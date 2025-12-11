# Confluence to Google Docs Chrome Extension

This Chrome extension automates the process of converting Confluence pages into Google Docs and keeping them synchronized. It's designed to help you easily import your organization's documentation into tools like NotebookLM.

## Features

- **Confluence to Google Docs Conversion**: Convert all pages from specified Confluence spaces into Google Docs.
- **Automated Syncing**: The extension runs in the background, checking for changes to your Confluence pages every hour.
- **Update Existing Docs**: Instead of creating duplicates, the extension intelligently updates the Google Docs that have been changed in Confluence.
- **User Notifications**: Get notified when the sync process is complete.
- **Secure Storage**: Your Confluence Personal Access Token (PAT) and other settings are stored securely using Chrome's storage API.

## Setup Instructions

### 1. Google Cloud Project Setup

Before you can use this extension, you need to configure a Google Cloud project to get the necessary OAuth 2.0 credentials.

1.  **Create a new Google Cloud Project**: Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a new project.
2.  **Enable the Google Drive and Google Docs APIs**: In your new project, go to the "APIs & Services" > "Library" section. Search for and enable the "Google Drive API" and "Google Docs API".
3.  **Create OAuth 2.0 Credentials**:
    *   Go to "APIs & Services" > "Credentials".
    *   Click "Create Credentials" and select "OAuth client ID".
    *   Choose "Chrome App" as the application type.
    *   Enter the **Application ID** of your extension. To get this ID:
        1.  Load the extension into Chrome (see the next section).
        2.  Go to `chrome://extensions`.
        3.  Find your extension and copy the ID.
    *   Click "Create".
4.  **Get your Client ID**: Once created, copy the "Client ID" that's generated for you.

### 2. Loading the Extension in Chrome

1.  **Clone or download this repository**.
2.  **Install dependencies**: Open a terminal in the project's root directory and run `npm install`.
3.  **Update the `manifest.json`**:
    *   Open the `manifest.json` file.
    *   Replace `"YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"` with the Client ID you got from the Google Cloud Console.
4.  **Load the extension**:
    *   Open Google Chrome and go to `chrome://extensions`.
    *   Enable "Developer mode" in the top right corner.
    *   Click "Load unpacked" and select the directory where you cloned or downloaded this project.

## How to Use the Extension

1.  **Open the extension**: Click on the extension's icon in the Chrome toolbar.
2.  **Sign in with Google**: Click the "Sign in with Google" button to authorize the extension to access your Google Drive and Docs.
3.  **Configure your settings**:
    *   **Confluence URL**: The base URL of your Confluence instance (e.g., `your-company.atlassian.net`).
    *   **Confluence PAT**: Your Confluence Personal Access Token.
    *   **Confluence Spaces**: A comma-separated list of the Confluence space keys you want to sync (e.g., `ENG,PROD`).
    *   **Google Drive Folder URL**: The URL of the Google Drive folder where you want to save the converted documents.
4.  **Save your settings**: Click the "Save Settings" button.
5.  **Start the initial sync**: Click the "Start Sync" button to begin the first conversion. After that, the extension will automatically sync every hour.
