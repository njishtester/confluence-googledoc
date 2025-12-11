import axios from 'axios';

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed. Setting up alarm.');
  chrome.alarms.create('confluenceSync', {
    delayInMinutes: 1,
    periodInMinutes: 60
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'confluenceSync') {
    console.log('Alarm triggered. Starting sync process.');
    startSyncProcess();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startSync') {
    console.log('Manual sync process initiated.');
    startSyncProcess();
    return true; // Keep the message channel open for async response
  }
});

async function startSyncProcess() {
    try {
        await chrome.storage.local.set({ status: 'Syncing...' });
        const { confluenceUrl, confluenceEmail, confluenceToken, confluenceSpaces, driveFolder } = await chrome.storage.sync.get([
            'confluenceUrl',
            'confluenceEmail',
            'confluenceToken',
            'confluenceSpaces',
            'driveFolder'
        ]);

        if (!confluenceUrl || !confluenceEmail || !confluenceToken || !confluenceSpaces) {
            console.error('Confluence settings are not fully configured.');
            await chrome.storage.local.set({ status: 'Error: Confluence settings are not fully configured.' });
            return;
        }

        const { lastSync } = await chrome.storage.local.get('lastSync');
        const now = new Date().toISOString();

        const spaces = confluenceSpaces.split(',').map(s => s.trim());
        for (const space of spaces) {
            await fetchAndProcessPages(space, confluenceUrl, confluenceEmail, confluenceToken, driveFolder, lastSync);
        }

        await chrome.storage.local.set({ lastSync: now });
        notifySyncComplete();
    } catch (error) {
        console.error('An error occurred during the sync process:', error);
        await chrome.storage.local.set({ status: 'Error: An unexpected error occurred.' });
    }
}

async function fetchAndProcessPages(spaceKey, url, email, token, driveFolder, lastSync) {
  let allPages = [];
  const MAX_PAGES = 300; // Safety limit

  let baseUrl = url.startsWith('http') ? url : `https://${url}`;
  baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  const credentials = `${email}:${token}`;
  const encodedCredentials = btoa(credentials);

  const authHeader = {
    'Authorization': `Basic ${encodedCredentials}`,
    'Accept': 'application/json',
    'User-Agent': 'ConfluenceToGoogleDocsExtension/1.0',
  };

  console.log(`[${spaceKey}] Fetching pages from ${baseUrl}...`);
  try {
    let start = 0;
    const limit = 50;
    let hasMore = true;

    while (hasMore) {
      if (allPages.length >= MAX_PAGES) {
        console.warn(`[${spaceKey}] Reached page limit of ${MAX_PAGES}.`);
        break;
      }

      const response = await axios.get(`${baseUrl}/rest/api/content`, {
        headers: authHeader,
        params: {
          spaceKey,
          type: 'page',
          expand: 'body.view,version',
          limit,
          start,
        },
      });

      const newPages = response.data.results;
      if (newPages.length > 0) {
        allPages = allPages.concat(newPages);
        start += newPages.length;
        console.log(`[${spaceKey}] Fetched ${newPages.length} pages. Total: ${allPages.length}`);
        hasMore = newPages.length === limit;
      } else {
        hasMore = false;
      }
    }

    const updatedPages = allPages.filter(page => {
      if (!lastSync) return true;
      const pageModified = new Date(page.version.when);
      const lastSyncDate = new Date(lastSync);
      return pageModified > lastSyncDate;
    });

    console.log(`[${spaceKey}] Total pages found: ${allPages.length}. Updated pages: ${updatedPages.length}`);
    await createOrUpdateGoogleDocsForPages(updatedPages, driveFolder);

  } catch (error) {
    console.error(`[${spaceKey}] Error fetching pages:`, error.message);
    if (error.response) {
      console.error('Error details:', error.response.status, error.response.data);
    }
  }
}

async function createOrUpdateGoogleDocsForPages(pages, driveFolder) {
    try {
        const token = await new Promise((resolve, reject) => {
            chrome.identity.getAuthToken({ interactive: false }, (token) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(token);
                }
            });
        });

        const folderIdMatch = driveFolder ? driveFolder.match(/folders\/([a-zA-Z0-9-_]+)/) : null;
        const folderId = folderIdMatch ? folderIdMatch[1] : null;

        const { pageIdToDocId } = await chrome.storage.local.get('pageIdToDocId');
        const newPageIdToDocId = pageIdToDocId || {};

        for (const page of pages) {
            const docId = newPageIdToDocId[page.id];

            if (docId) {
                console.log(`Updating Google Doc for: ${page.title}`);
                await updateGoogleDocFromHtml(docId, page.title, page.body.view.value, token);
            } else {
                console.log(`Creating Google Doc for: ${page.title}`);
                const newDocId = await createGoogleDocFromHtml(page.title, page.body.view.value, folderId, token);
                if (newDocId) {
                    newPageIdToDocId[page.id] = newDocId;
                }
            }
        }

        await chrome.storage.local.set({ pageIdToDocId: newPageIdToDocId });
    } catch (error) {
        console.error('Could not get Google auth token:', error.message);
        notifyAuthFailure();
    }
}

async function createGoogleDocFromHtml(title, htmlContent, folderId, token) {
  try {
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const close_delim = `\r\n--${boundary}--`;

    const metadata = {
      name: title,
      mimeType: 'application/vnd.google-apps.document',
      parents: folderId ? [folderId] : []
    };

    const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: text/html\r\n\r\n' +
        htmlContent +
        close_delim;

    const response = await axios.post('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', multipartRequestBody, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      }
    });
    console.log(`  > Created doc with ID: ${response.data.id}`);
    return response.data.id;
  } catch (error) {
    console.error(`  > Error creating doc for "${title}":`, error.message);
    return null;
  }
}

async function updateGoogleDocFromHtml(documentId, title, htmlContent, token) {
    try {
        const boundary = '-------314159265358979323846';
        const delimiter = `\r\n--${boundary}\r\n`;
        const close_delim = `\r\n--${boundary}--`;

        const metadata = {
            name: title,
            mimeType: 'application/vnd.google-apps.document'
        };

        const multipartRequestBody =
            delimiter +
            'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: text/html\r\n\r\n' +
            htmlContent +
            close_delim;

        const response = await axios.patch(`https://www.googleapis.com/upload/drive/v3/files/${documentId}?uploadType=multipart`, multipartRequestBody, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': `multipart/related; boundary=${boundary}`
            }
        });
        console.log(`  > Updated doc with ID: ${response.data.id}`);
    } catch (error) {
        console.error(`  > Error updating doc for "${title}":`, error.message);
    }
}


function notifySyncComplete() {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'images/icon48.png',
    title: 'Confluence Sync Complete',
    message: 'Your Confluence pages have been successfully synced to Google Docs.'
  });
  chrome.storage.local.set({ status: 'Sync complete.' });
}

function notifyAuthFailure() {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'images/icon48.png',
        title: 'Google Authentication Failed',
        message: 'Could not authenticate with Google. Please sign in again.'
    });
    chrome.storage.local.set({ status: 'Error: Google authentication failed.' });
}
