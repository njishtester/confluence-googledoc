document.addEventListener('DOMContentLoaded', () => {
  const confluenceUrlInput = document.getElementById('confluence-url');
  const confluenceEmailInput = document.getElementById('confluence-email');
  const confluenceTokenInput = document.getElementById('confluence-token');
  const confluenceSpacesInput = document.getElementById('confluence-spaces');
  const driveFolderInput = document.getElementById('drive-folder');
  const saveButton = document.getElementById('save-settings');
  const startSyncButton = document.getElementById('start-sync');
  const googleSignInButton = document.getElementById('google-signin');
  const statusDiv = document.getElementById('status');
  const gdriveOptionsDiv = document.getElementById('gdrive-options');
  const destGdriveRadio = document.getElementById('dest-gdrive');
  const destLocalRadio = document.getElementById('dest-local');

  // Function to toggle UI based on destination
  function toggleDestination(destination) {
    if (destination === 'gdrive') {
      gdriveOptionsDiv.style.display = 'block';
      googleSignInButton.style.display = 'block';
    } else {
      gdriveOptionsDiv.style.display = 'none';
      googleSignInButton.style.display = 'none';
    }
  }

  // Load saved settings
  chrome.storage.sync.get(['confluenceUrl', 'confluenceEmail', 'confluenceToken', 'confluenceSpaces', 'driveFolder', 'destination'], (result) => {
    if (result.confluenceUrl) confluenceUrlInput.value = result.confluenceUrl;
    if (result.confluenceEmail) confluenceEmailInput.value = result.confluenceEmail;
    if (result.confluenceToken) confluenceTokenInput.value = result.confluenceToken;
    if (result.confluenceSpaces) confluenceSpacesInput.value = result.confluenceSpaces;
    if (result.driveFolder) driveFolderInput.value = result.driveFolder;

    const destination = result.destination || 'gdrive';
    if (destination === 'local') {
      destLocalRadio.checked = true;
    } else {
      destGdriveRadio.checked = true;
    }
    toggleDestination(destination);
  });

  // Add event listeners for radio buttons
  destGdriveRadio.addEventListener('change', () => toggleDestination('gdrive'));
  destLocalRadio.addEventListener('change', () => toggleDestination('local'));

  // Load and display status
  chrome.storage.local.get('status', (result) => {
    if (result.status) {
      statusDiv.textContent = result.status;
      statusDiv.style.display = 'block';
    }
  });

  // Save settings
  saveButton.addEventListener('click', () => {
    const destination = destLocalRadio.checked ? 'local' : 'gdrive';
    chrome.storage.sync.set({
      confluenceUrl: confluenceUrlInput.value,
      confluenceEmail: confluenceEmailInput.value,
      confluenceToken: confluenceTokenInput.value,
      confluenceSpaces: confluenceSpacesInput.value,
      driveFolder: driveFolderInput.value,
      destination: destination,
    }, () => {
      statusDiv.textContent = 'Settings saved.';
      statusDiv.style.display = 'block';
    });
  });

  // Start sync
  startSyncButton.addEventListener('click', () => {
    statusDiv.textContent = 'Syncing...';
    statusDiv.style.display = 'block';
    chrome.runtime.sendMessage({ action: 'startSync' });
  });

  googleSignInButton.addEventListener('click', () => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        statusDiv.textContent = 'Sign-in failed.';
        statusDiv.style.display = 'block';
        console.error(chrome.runtime.lastError);
        return;
      }
      statusDiv.textContent = 'Sign-in successful.';
      statusDiv.style.display = 'block';
      console.log('Google Sign-In successful, token:', token);
    });
  });

  // Listen for status updates from the background script
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.status) {
      statusDiv.textContent = changes.status.newValue;
      statusDiv.style.display = 'block';
    }
  });
});
