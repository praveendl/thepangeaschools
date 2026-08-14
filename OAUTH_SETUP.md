# OAuth2 Setup Guide (No Service Account Key Needed)

Since your organization blocks service account keys, we'll use OAuth2 instead. This is actually more secure!

## Step 1: Create OAuth2 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. **Create or Select Project**
   - Click project dropdown at top
   - Create new or select existing project

3. **Enable Google Sheets API**
   - Search "Google Sheets API" in top search bar
   - Click on it and click "Enable"

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Select "External" (unless you have Google Workspace)
   - Click "Create"
   - Fill in:
     - App name: `Procare Attendance Sync`
     - User support email: Your email
     - Developer contact: Your email
   - Click "Save and Continue"
   - Click "Add or Remove Scopes"
   - Filter for "Google Sheets API" and select `.../auth/spreadsheets.readonly`
   - Click "Update" then "Save and Continue"
   - Add your email as a test user
   - Click "Save and Continue"

5. **Create OAuth Client ID**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Desktop app"
   - Name: `Procare Sync Desktop`
   - Click "Create"
   - **Copy the Client ID and Client Secret** (you'll need these!)

## Step 2: Update .env File

Edit your `.env` file with:

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
SPREADSHEET_ID=your-spreadsheet-id
SHEET_RANGE=Attendance!A2:D
```

To get your **Spreadsheet ID**:
- Open your Google Sheet
- Look at URL: `https://docs.google.com/spreadsheets/d/`**`[THIS_PART]`**`/edit`
- Copy the long string between `/d/` and `/edit`

## Step 3: Install New Dependency

```bash
npm install
```

## Step 4: First Run - Authenticate

The first time you run the script, it will:
1. Open a browser window
2. Ask you to sign in to Google
3. Ask for permission to read your sheets
4. Save the authentication token for future use

```bash
npm run dry-run
```

A browser will open - sign in with your Google account and approve the permissions.

## Done!

After the first authentication, you won't need to do it again. The token is saved in `token.json` and will be reused.

## Troubleshooting

### "Access blocked: This app's request is invalid"
- Make sure you added your email as a test user in OAuth consent screen
- Or publish the app (change from Testing to Production in OAuth consent screen)

### "Redirect URI mismatch"
- In Google Cloud Console, add `http://localhost:3000/oauth2callback` to authorized redirect URIs
- Go to Credentials → Edit your OAuth client → Add URI

### Need to re-authenticate
Delete `token.json` and run the script again.
