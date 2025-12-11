# Confluence to Google Docs & Markdown Chrome Extension

This Chrome extension automates the process of converting Confluence pages into Google Docs or local Markdown files, keeping them synchronized for use with tools like NotebookLM.

## Features

-   **Flexible Syncing:** Sync entire Confluence spaces by their **Space Key** (e.g., `CSTS`) or sync a specific page and all of its children by its **Page ID** (e.g., `431089988`).
-   **Dual Destination:** Save Confluence pages as either Google Docs in a specified Drive folder or as text-selectable Markdown (`.md`) files in your local "Downloads" folder.
-   **Automated Syncing:** The extension runs in the background, checking for changes to your Confluence pages every hour.
-   **Intelligent Updates:** When using the Google Drive destination, the extension intelligently updates existing documents to preserve their IDs and links.
-   **User Notifications:** Get notified when a sync process is complete.
-   **Secure Storage:** Your Confluence Personal Access Token (PAT) and other settings are stored securely using Chrome's storage API.

---

## Local Setup and Installation

Follow these instructions to set up the extension on your local machine.

### Part 1: First-Time Setup

These steps will get the code onto your computer and prepare it for use.

1.  **Create a Folder:**
    First, create a dedicated folder on your computer where you will store the extension's code. Open your terminal or command prompt and run:
    ```bash
    mkdir confluence-extension
    cd confluence-extension
    ```

2.  **Clone the Git Repository:**
    Inside the new folder, run the following command to download the code from the GitHub repository:
    ```bash
    git clone https://github.com/njishtester/confluence-googledoc.git .
    ```
    *(Note the `.` at the end, which clones the code directly into your current folder.)*

3.  **Install Dependencies:**
    The extension relies on several packages. Install them by running:
    ```bash
    npm install
    ```

4.  **Build the Extension:**
    The source code needs to be bundled into a format Chrome can use. Build the extension by running:
    ```bash
    npm run build
    ```
    This will create a `dist` folder containing the necessary `background.js` file.

5.  **Configure for Your Confluence Server (Important for Self-Hosted Confluence):**
    If you are using a self-hosted Confluence instance (like `confluence.yourcompany.com`), you **must** grant the extension permission to access it.
    *   Open the `manifest.json` file in your code editor.
    *   Find the `host_permissions` section.
    *   Change the URL to match your Confluence domain. For example:
        ```json
        "host_permissions": [
          "https://confluence.yourcompany.com/"
        ]
        ```
    *   Save the file.

6.  **Configure Google Cloud (Google Drive Only):**
    If you plan to use the Google Drive feature, you must configure a Google Cloud project to get an OAuth 2.0 Client ID. **If you only plan to save files locally, you can skip this step.**
    *   Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a new project.
    *   In your project, go to **APIs & Services > Library** and enable the **Google Drive API** and **Google Docs API**.
    *   Go to **APIs & Services > Credentials**, click **Create Credentials**, and select **OAuth client ID**.
    *   For **Application type**, choose **Chrome App**.
    *   You will need your extension's ID. You can get this *after* loading it into Chrome (see next step). You can enter a placeholder for now and update it later.
    *   Once created, copy the **Client ID**.
    *   Open the `manifest.json` file in your local code editor and replace `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` with the Client ID you just copied.

7.  **Load the Extension into Chrome:**
    *   Open Google Chrome and navigate to `chrome://extensions`.
    *   Enable **Developer mode** using the toggle in the top-right corner.
    *   Click the **Load unpacked** button.
    *   Select the `confluence-extension` folder (or whatever you named it) that contains the code. The extension is now installed.

### Part 2: Updating the Extension

To sync your local files with any future changes from the Git repository, follow these steps.

1.  **Navigate to the Directory:**
    Open your terminal and make sure you are in the extension's folder:
    ```bash
    cd path/to/confluence-extension
    ```

2.  **Pull the Latest Changes:**
    Run the following command to download the latest updates from the repository:
    ```bash
    git pull
    ```

3.  **Re-install Dependencies (If Needed):**
    If the `package.json` file was updated, it's good practice to re-run the install command to get any new packages:
    ```bash
    npm install
    ```

4.  **Rebuild the Extension:**
    After pulling the latest code, you must rebuild the extension for the changes to take effect:
    ```bash
    npm run build
    ```

5.  **Reload the Extension in Chrome:**
    *   Go back to the `chrome://extensions` page.
    *   Find the "Confluence to Google Docs" extension and click the **reload** icon (a circular arrow). The extension is now updated with the latest changes.

---

## How to Use the Extension

1.  **Open the extension**: Click on the extension's icon in the Chrome toolbar.
2.  **Configure your settings**:
    *   **Confluence URL**: The base URL of your Confluence instance (e.g., `https://confluence.yourcompany.com`).
    *   **Confluence Email**: Your Confluence email address.
    *   **Confluence PAT**: Your Confluence Personal Access Token.
    *   **Space Key(s) or Parent Page ID(s)**: This is where you tell the extension what to sync. You can enter a comma-separated list of:
        *   **Space Keys:** To sync an entire space (e.g., `CSTS`, `ENG`).
        *   **Parent Page IDs:** To sync a specific page and all of its sub-pages. The Page ID is the number in the URL. For example, in `.../pages/431089988/Expanse+PDoc`, the ID is `431089988`.
    *   **Save Destination**: Choose between **Google Drive** or **Local Markdown (.md)**.
    *   **Google Drive Folder URL (if applicable)**: If using Google Drive, provide the folder URL.
3.  **Save and Sync**: Click "Save Settings", then "Start Sync". The extension will sync automatically every hour after the first manual start.

## Known Limitations

-   **Images**: Currently, images embedded in Confluence pages are not rendered in the converted Google Docs or Markdown files. This is a complex issue that may be addressed in a future release.
