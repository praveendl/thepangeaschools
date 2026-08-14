# NFC Check-in System Setup

## What I Built

A real-time NFC check-in system where you tap an NFC tag with your iPhone to automatically check students into Procare.

## System Components

1. **Web Server** (`server.js`) - Runs on cloud/computer, handles NFC requests
2. **Web Page** (`public/index.html`) - Mobile-friendly NFC scanner interface
3. **Student Mapping** (`students.json`) - Maps NFC tag IDs to student names
4. **Procare Integration** (`checkin-procare.js`) - Automated browser check-in

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Students

Edit `students.json` and map your NFC tag IDs to students:

```json
{
  "students": {
    "ACTUAL_NFC_TAG_ID": {
      "name": "Sreedha Akula",
      "room": "Twos-1"
    }
  }
}
```

**To get NFC tag IDs:**
1. Run the server (step 3)
2. Open the web page
3. Scan an NFC tag
4. Check the browser console or server logs for the tag ID
5. Copy that ID into `students.json`

### 3. Start the Server

```bash
npm run server
```

The server will show:
```
🚀 NFC Check-in Server Running
📱 Open on your phone: http://localhost:3000
```

### 4. Access from iPhone

**Option A: Same WiFi Network (Testing)**
1. Find your computer's IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac: `ifconfig` (look for inet)
2. On your iPhone, open Safari
3. Go to: `http://YOUR_IP_ADDRESS:3000`

**Option B: Deploy to Cloud (Production)**
- Deploy to services like:
  - Railway.app (easiest)
  - Heroku
  - DigitalOcean
  - AWS

### 5. Use the System

1. Open the web page on your iPhone
2. Tap "Scan NFC Tag"
3. Hold iPhone near NFC tag
4. System automatically checks student into Procare
5. See confirmation on screen

## How It Works

1. **Scan NFC tag** with iPhone (uses WebNFC API)
2. **Web page sends** tag ID to server via API
3. **Server looks up** student name in `students.json`
4. **Playwright automation** logs into Procare and checks in the student
5. **Response sent** back to phone with success/error

## iPhone NFC Requirements

- iPhone 7 or newer
- iOS 13 or later
- Safari browser
- NFC must be enabled (usually on by default)

## Cloud Deployment (Recommended)

### Deploy to Railway (Free/Easy):

1. Create account at railway.app
2. Install Railway CLI or use GitHub integration
3. Add environment variables from your `.env` file
4. Deploy!

Railway will give you a URL like: `https://your-app.railway.app`

### Environment Variables for Cloud:

Make sure to set these in your cloud platform:
- `PROCARE_EMAIL`
- `PROCARE_PASSWORD`
- `PROCARE_LOGIN_URL`
- `PROCARE_TO_ROOM`
- `PROCARE_SIGNED_IN_BY`
- `PORT` (usually auto-set by cloud platform)

## Troubleshooting

**"NFC not supported"**
- Make sure you're using Safari on iPhone
- Chrome on iPhone doesn't support WebNFC yet

**"Student not found"**
- The NFC tag ID hasn't been mapped in `students.json`
- Check server logs for the actual tag ID
- Update `students.json` with correct ID

**Check-in fails**
- Check Procare credentials in `.env`
- Make sure Procare website hasn't changed
- Check server logs for detailed error

**Can't access from phone**
- Make sure phone and computer are on same WiFi
- Check firewall isn't blocking port 3000
- Try using your computer's IP address instead of localhost

## Adding More Students

1. Get the NFC tag ID (scan it once, check logs)
2. Add to `students.json`:
```json
"NEW_TAG_ID": {
  "name": "Student Name",
  "room": "Room Name"
}
```
3. No need to restart server (it reloads on each check-in)

## Security Notes

- Don't expose this publicly without authentication
- Keep `.env` file secure with Procare credentials
- For production, add password protection or IP whitelist
- Consider HTTPS for cloud deployment

## Next Steps

1. Test locally first
2. Map all your NFC tags to students
3. Deploy to cloud for 24/7 access
4. Print labels for each NFC tag with student names
5. Mount tags by the entrance for easy scanning
