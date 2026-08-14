# Deploy NFC Check-in System to Railway

## Step 1: Install Railway CLI (Optional but Recommended)

```bash
npm install -g @railway/cli
```

Or use the Railway web dashboard (easier for first-time users).

## Step 2: Deploy via Railway Dashboard

### A. Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub (recommended)
3. Verify your email

### B. Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Connect your GitHub account
4. Select this repository (or create a new repo and push this code)

### C. Configure Environment Variables
In Railway dashboard:
1. Go to your project → **Variables** tab
2. Add all variables from your `.env` file:

```
PROCARE_EMAIL=praveen.v.akula@gmail.com
PROCARE_PASSWORD=Honey19271927*
PROCARE_LOGIN_URL=https://schools.procareconnect.com/login
PROCARE_ATTENDANCE_URL=https://schools.procareconnect.com/attendance
PROCARE_TO_ROOM=Twos-1
PROCARE_SIGNED_IN_BY=Praveen Akula
PORT=3000
```

### D. Install Playwright Browsers
Railway needs to install Chromium for Playwright:
1. Go to **Settings** tab
2. Under **Build Command**, add:
   ```
   npm install && npx playwright install --with-deps chromium
   ```
3. Under **Start Command**, ensure it says:
   ```
   npm start
   ```

### E. Deploy
1. Railway will automatically deploy
2. Once deployed, click **"Generate Domain"** to get your public URL
3. Your URL will be something like: `https://your-app.railway.app`

## Step 3: Test Deployment

Test the API endpoint:
```
https://your-app.railway.app/api/checkin/53:15:4E:CC:33:00:01
```

You should see the check-in HTML page.

## Step 4: Program NFC Tags

For each student:
1. Open **NFC Tools** app on iPhone
2. Go to **WRITE** tab
3. Tap **Add a record** → **URL/URI**
4. Enter: `https://your-app.railway.app/api/checkin/SERIAL_NUMBER`
   - Replace `SERIAL_NUMBER` with the actual RFID serial number
5. Tap **Write** and hold the tag to the phone

Example URLs:
- Sreedha: `https://your-app.railway.app/api/checkin/53:15:4E:CC:33:00:01`
- Child 2: `https://your-app.railway.app/api/checkin/04:A2:B3:C4:D5:E6:F7`

## Alternative: Deploy Without GitHub

If you don't want to use GitHub:

1. In Railway dashboard, select **"Deploy from template"** → **"Blank template"**
2. Install Railway CLI: `npm install -g @railway/cli`
3. Login: `railway login`
4. Link project: `railway link`
5. Deploy: `railway up`

## Troubleshooting

**If Playwright fails:**
- Make sure the build command includes `npx playwright install --with-deps chromium`
- Check Railway logs for any errors

**If environment variables are missing:**
- Double-check all variables are added in the Railway dashboard
- Restart the deployment after adding variables

**If the server won't start:**
- Check logs in Railway dashboard
- Ensure PORT is set to 3000 or removed (Railway auto-assigns)

## Cost

- Railway offers a **free tier** with 500 hours/month
- This should be sufficient for a school check-in system
- You may need to verify with a credit card (but won't be charged unless you exceed free tier)

## Next Steps After Deployment

1. Get your Railway URL (e.g., `https://your-app.railway.app`)
2. Program all RFID tags with their respective URLs
3. Test with each tag
4. Distribute tags to students
5. Train staff on the scanning process
