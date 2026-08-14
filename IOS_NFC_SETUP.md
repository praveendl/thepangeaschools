# iOS NFC Automation Setup

## Simple One-Tap NFC Check-in for iPhone

This guide shows you how to set up NFC tags so that just tapping them with your iPhone automatically checks in students.

## Prerequisites

- iPhone 7 or newer (with NFC)
- iOS 13 or later
- Server running (`npm run server`)

## Step-by-Step Setup

### Step 1: Restart Server with New Endpoint

The server now has a simpler GET endpoint for iOS. Restart it:

```bash
npm run server
```

### Step 2: Get Your NFC Tag IDs

For each student's NFC tag:

1. Hold iPhone near the NFC tag (screen unlocked)
2. A notification will appear at the top
3. Tap the notification
4. Copy the **serial number** (e.g., `04:A1:B2:C3:D4:E5:80`)
5. Add it to `students.json`:

```json
{
  "students": {
    "04:A1:B2:C3:D4:E5:80": {
      "name": "Sreedha Akula",
      "room": "Twos-1"
    },
    "ANOTHER_TAG_ID": {
      "name": "Another Student",
      "room": "Twos-1"
    }
  }
}
```

### Step 3: Create Automation for Each Student

For EACH student's NFC tag, do this:

1. Open **Shortcuts** app
2. Go to **"Automation"** tab (bottom middle)
3. Tap **"+"** (top right)
4. Tap **"Create Personal Automation"**
5. Scroll down and tap **"NFC"**
6. Tap **"Scan"**
7. Hold iPhone near the student's NFC tag
8. Give it a name (e.g., "Sreedha's Tag")
9. Tap **"Next"**

10. Now add the action:
    - Search for **"URL"**
    - Tap **"Get Contents of URL"**
    - Enter URL: `http://YOUR_IP:3000/api/checkin/TAG_ID_HERE`
      (Replace YOUR_IP with your computer's IP)
      (Replace TAG_ID_HERE with the actual serial number)
    
    For example:
    ```
    http://192.168.1.100:3000/api/checkin/04:A1:B2:C3:D4:E5:80
    ```

11. Add notification:
    - Search for **"Show Notification"**
    - Tap **"Show Notification"**
    - For the text, select **"Contents of URL"**

12. Tap **"Next"**
13. **IMPORTANT**: Turn OFF "Ask Before Running"
14. Tap **"Done"**

### Step 4: Test It!

1. Lock your iPhone (or just have screen on)
2. Hold iPhone near the NFC tag
3. You should see a notification that the student was checked in!

## URL Format

Each tag needs its own URL with the tag ID:

```
http://YOUR_IP:3000/api/checkin/[SERIAL_NUMBER]
```

Examples:
```
http://192.168.1.100:3000/api/checkin/04:A1:B2:C3:D4:E5:80
http://192.168.1.100:3000/api/checkin/05:B2:C3:D4:E5:F6:90
```

## Quick Setup Checklist

For each student:
- [ ] Get NFC tag serial number
- [ ] Add to `students.json`
- [ ] Create iOS automation with tag ID in URL
- [ ] Turn off "Ask Before Running"
- [ ] Test the tag

## Troubleshooting

**Automation doesn't run:**
- Make sure "Ask Before Running" is OFF
- Check that the URL has the correct IP address
- Make sure server is running
- Ensure iPhone and computer are on same WiFi

**"Student not found" error:**
- The serial number in the URL doesn't match `students.json`
- Check the exact format (with or without colons)
- Look at server logs to see what ID it received

**Takes too long:**
- This is normal - Playwright needs to automate the browser
- Usually takes 10-20 seconds
- You'll see the notification when done

## Alternative: Single Shortcut (Manual)

If you don't want to set up automations for each tag:

1. Create a regular Shortcut (not automation)
2. Add these actions:
   - **Text** → Type: `http://YOUR_IP:3000/api/checkin/`
   - **Ask for Input** → Prompt: "Scan NFC tag"
   - **Combine Text** → Combine the URL and input
   - **Get Contents of URL** → Use combined text
   - **Show Notification** → Show the result

3. Run this shortcut manually
4. It will prompt you to scan an NFC tag
5. After scanning, it will check in automatically

## Cloud Deployment Note

For production use, deploy the server to a cloud platform (Railway, Heroku, etc.) so you can use it from anywhere, not just your home WiFi.

Then your URL becomes:
```
https://your-app.railway.app/api/checkin/[TAG_ID]
```
