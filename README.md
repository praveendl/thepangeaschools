# NFC Check-in System for Procare

Automated student check-in/check-out system using NFC RFID tags that integrates with Procare attendance management.

## 🎯 How It Works

1. **Student arrives** → Scans their RFID tag with any iPhone
2. **System checks** → Is student already checked in?
   - **No** → Automates browser login to Procare and checks IN
   - **Yes** → Automates browser login to Procare and checks OUT
3. **Confirmation** → Shows success message on phone

## 📋 Features

- ✅ One-tap NFC scanning (no app required)
- ✅ Automatic toggle: Check-in on first scan, check-out on second scan
- ✅ Works with any iPhone (iOS 13+)
- ✅ Multiple staff can use their own phones
- ✅ Persistent status tracking (survives server restarts)
- ✅ Cloud-deployed for 24/7 availability

## 🚀 Quick Start

### For Staff Using the System

1. When a student arrives, hold their RFID tag near the back of your iPhone
2. Tap the NFC notification that appears
3. Wait for the success message
4. Done! Student is checked in to Procare

### For Setup (One-Time)

See [DEPLOYMENT.md](DEPLOYMENT.md) for full deployment instructions.

## 📱 Compatible Devices

- iPhone 7 or newer
- iOS 13 or later
- Any NFC-compatible RFID tags (NTAG213, NTAG215, NTAG216)

## 🔧 Technical Details

**Backend:**
- Node.js + Express server
- Playwright for browser automation
- Persistent JSON storage for check-in status

**Frontend:**
- Simple HTML pages served for each scan
- No mobile app required

**NFC Tags:**
- Each tag programmed with unique URL
- Format: `https://your-server.com/api/checkin/SERIAL_NUMBER`

## 📂 Project Structure

```
├── server.js                 # Express API server
├── checkin-procare.js        # Playwright automation for Procare
├── students.json             # RFID → Student mapping
├── checkin-status.json       # Current check-in state (auto-generated)
├── public/
│   ├── index.html           # Web interface (optional)
│   └── scan.html            # Cache-busting redirect
├── .env                     # Procare credentials (not committed)
└── package.json
```

## 🔐 Environment Variables

Required in `.env` file:

```env
PROCARE_EMAIL=your-email@example.com
PROCARE_PASSWORD=your-password
PROCARE_LOGIN_URL=https://schools.procareconnect.com/login
PROCARE_TO_ROOM=Room Name
PROCARE_SIGNED_IN_BY=Staff Name
```

## 👥 Adding Students

Edit `students.json`:

```json
{
  "students": {
    "53:15:4E:CC:33:00:01": {
      "name": "Student Name",
      "room": "Twos-1"
    }
  }
}
```

Then program the RFID tag with NFC Tools app.

## 🐛 Troubleshooting

**Tag doesn't respond:**
- Make sure iPhone NFC is enabled (Settings → General)
- Hold tag to the top back of iPhone for 2-3 seconds
- Try repositioning the tag

**Check-in fails:**
- Check Railway logs for errors
- Verify Procare credentials in environment variables
- Ensure student name matches exactly in Procare

**Student shows wrong status:**
- Use `/api/status` endpoint to see current state
- Use `/api/reset` endpoint to clear all statuses (POST request)

## 📊 API Endpoints

- `GET /api/checkin/:rfidId` - Main check-in/out endpoint
- `GET /api/status` - View all checked-in students
- `POST /api/reset` - Reset all check-in statuses
- `GET /api/students` - List all registered students

## 📄 License

Private use for Pangea Schools.

## 🙏 Support

For issues or questions, contact the IT administrator.
