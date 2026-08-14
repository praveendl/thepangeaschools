# Setup Guide - Procare Attendance Automation

## Quick Start

### 1. Install Dependencies
```bash
npm install
npx playwright install chromium
```

### 2. Configure Google Sheets Access

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable Google Sheets API
4. Create a Service Account:
   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Download the JSON key file
5. Save the JSON key as `service-account.json` in this folder
6. Share your Google Sheet with the service account email (found in the JSON as `client_email`)

### 3. Set Up Environment Variables
```bash
cp .env.example .env
```

Edit `.env` and fill in:
- `SPREADSHEET_ID` - From your Google Sheet URL
- `PROCARE_EMAIL` and `PROCARE_PASSWORD` - Your Procare login
- `START_HOUR` and `END_HOUR` - Business hours (default: 7 AM - 6 PM)
- `INTERVAL_MINUTES` - How often to sync (default: 60 minutes)

### 4. Verify Procare Selectors

**IMPORTANT**: The script has placeholder selectors that need verification:

```bash
npm run codegen
```

This opens a browser where you can:
1. Log into Procare
2. Manually check in one child
3. Copy the actual selectors Playwright generates
4. Update the `TODO: VERIFY` sections in `sync-attendance.js`

### 5. Test with Dry Run
```bash
npm run dry-run
```

This reads the Google Sheet but doesn't touch Procare. Verify the data looks correct.

### 6. Run Manual Sync (Test)
```bash
npm start
```

Watch it process one batch to ensure everything works.

### 7. Start Hourly Automation
```bash
npm run scheduler
```

This runs the sync:
- Every hour (or your configured interval)
- Only during business hours (7 AM - 6 PM by default)
- Only on weekdays (Monday-Friday)

## Google Sheet Format

Your sheet should have these columns:

| Child Name  | Date       | Check-In | Check-Out |
|-------------|------------|----------|-----------|
| Jane Doe    | 2026-07-29 | 08:15 AM | 05:00 PM  |
| John Smith  | 2026-07-29 | 09:00 AM | 03:30 PM  |

- **Child Name**: Full name as it appears in Procare
- **Date**: YYYY-MM-DD format
- **Check-In**: Time in 12-hour format (e.g., 08:15 AM) - leave blank if not needed
- **Check-Out**: Time in 12-hour format (e.g., 05:00 PM) - leave blank if not needed

## Running as a Background Service

### Option 1: PM2 (Recommended for servers)
```bash
npm install -g pm2
pm2 start scheduler.js --name procare-sync
pm2 save
pm2 startup  # Follow instructions to auto-start on reboot
```

### Option 2: Windows Task Scheduler
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: At startup
4. Action: Start a program
5. Program: `node`
6. Arguments: `scheduler.js`
7. Start in: `[path to this folder]`

### Option 3: Keep terminal open
Just run `npm run scheduler` and minimize the terminal window.

## Monitoring

The scheduler logs each run with:
- Timestamp
- Number of records processed
- Success/failure for each child
- Summary statistics

## Troubleshooting

### "No attendance data found"
- Check `SHEET_RANGE` in .env
- Verify the sheet is shared with service account
- Ensure `SPREADSHEET_ID` is correct

### Login fails
- Verify `PROCARE_EMAIL` and `PROCARE_PASSWORD`
- Check if Procare URL has changed
- Run `npm run codegen` to see the actual login flow

### Selectors not working
- Procare may have updated their UI
- Run `npm run codegen` again to get fresh selectors
- Update the `TODO: VERIFY` sections in `sync-attendance.js`

## Security Notes

- Never commit `.env` or `service-account.json`
- Both are already in `.gitignore`
- Store credentials securely
- Consider using environment variables on production servers
