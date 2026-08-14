require('dotenv').config();
const { google } = require('googleapis');
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const open = require('open');

const DRY_RUN = process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true';
const TOKEN_PATH = path.join(__dirname, 'token.json');

// Helper function to convert time format (e.g., "7:00 AM" to match dropdown options)
function formatTime(timeStr) {
  if (!timeStr) return null;
  
  const cleaned = timeStr.trim().toUpperCase();
  const match = cleaned.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
  if (!match) return null;
  
  let hours = parseInt(match[1]);
  const minutes = match[2];
  const meridiem = match[3] || '';
  
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  
  return { hours, minutes, meridiem: meridiem || (hours >= 12 ? 'PM' : 'AM') };
}

// Google OAuth2 setup
function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback'
  );
}

async function getAuthenticatedClient() {
  const oauth2Client = getOAuth2Client();
  
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oauth2Client.setCredentials(token);
    return oauth2Client;
  }
  
  return new Promise((resolve, reject) => {
    const authorizeUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    
    console.log('\n🔐 First time setup - Authorization needed');
    console.log('Opening browser for Google authentication...\n');
    
    const server = http.createServer(async (req, res) => {
      if (req.url.indexOf('/oauth2callback') > -1) {
        const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
        const code = qs.get('code');
        
        res.end('✅ Authentication successful! You can close this window and return to the terminal.');
        
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        console.log('✅ Authentication successful!\n');
        
        server.close();
        resolve(oauth2Client);
      }
    }).listen(3000, () => {
      open(authorizeUrl, { wait: false });
    });
  });
}

// Google Sheets setup
async function getAttendanceData() {
  const auth = await getAuthenticatedClient();
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: process.env.SHEET_RANGE,
  });
  
  return response.data.values || [];
}

// Procare automation
async function updateProcare(rows) {
  if (DRY_RUN) {
    console.log('🔍 DRY RUN - Would process:');
    rows.forEach(([name, date, checkIn, checkOut], i) => {
      console.log(`  ${i + 1}. ${name} | ${date} | In: ${checkIn || 'N/A'} | Out: ${checkOut || 'N/A'}`);
    });
    return;
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Login
    console.log('🔐 Logging into Procare...');
    await page.goto(process.env.PROCARE_LOGIN_URL);
    
    // Click STAFF button
    await page.getByText('STAFF').click();
    await page.waitForTimeout(500);
    
    // Fill in login credentials
    await page.getByRole('textbox', { name: 'Email Address' }).click();
    await page.getByRole('textbox', { name: 'Email Address' }).fill(process.env.PROCARE_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill(process.env.PROCARE_PASSWORD);
    await page.getByTestId('login-submit').click();
    
    // Wait for navigation after login
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (e) {
      console.log('  ⏳ Page still loading, continuing anyway...');
      await page.waitForTimeout(3000);
    }
    
    console.log('✅ Logged in successfully');

    const results = [];
    
    for (const [childName, dateStr, checkIn, checkOut] of rows) {
      try {
        console.log(`\n📝 Processing: ${childName} on ${dateStr}`);
        
        // Navigate to Student Sign-In > Attendance
        await page.getByRole('link', { name: 'Student Sign-In' }).click();
        await page.waitForTimeout(1000);
        
        // Important: Click on Attendance link (not Create Sign-In yet!)
        await page.getByRole('button', { name: 'Create Sign-In' }).click();
        await page.waitForTimeout(500);
        
        await page.getByText('Sign-In Attendance', { exact: true }).click();
        await page.waitForTimeout(1000);
        
        // Search for student
        await page.locator('#search').click();
        await page.locator('#search').fill(childName.toLowerCase());
        await page.waitForTimeout(1500);
        
        // Select the student - try text match first, then fall back to card click
        try {
          await page.getByText(childName, { exact: false }).click();
        } catch (e) {
          console.log(`  Trying alternative student selection...`);
          await page.locator('.student-card').first().click();
        }
        
        await page.getByRole('button', { name: 'Continue' }).click();
        
        console.log(`  📝 Filling in attendance details...`);
        console.log(`  ⏳ Waiting for form to load...`);
        
        // Wait longer
        await page.waitForTimeout(5000);
        
        // Debug: Take screenshot and print page content
        await page.screenshot({ path: 'debug-after-continue.png' });
        console.log(`  📸 Screenshot saved to debug-after-continue.png`);
        console.log(`  Current URL: ${page.url()}`);
        
        // Check if there are any modals or overlays blocking
        const modals = await page.locator('.modal, [role="dialog"]').count();
        console.log(`  Found ${modals} modals/dialogs`);
        
        // Try to find dropdowns by different selector
        const allDropdowns = await page.locator('.dropdown-portal__header').count();
        const visibleDropdowns = await page.locator('.dropdown-portal__header:visible').count();
        console.log(`  Total dropdowns: ${allDropdowns}, Visible: ${visibleDropdowns}`);
        
        // Try waiting for the form container instead
        try {
          await page.locator('form').first().waitFor({ state: 'visible', timeout: 10000 });
          console.log(`  ✓ Form is visible`);
        } catch (e) {
          console.log(`  ⚠️ Form not visible: ${e.message}`);
        }
        
        await page.waitForTimeout(2000);
        
        // Try clicking dropdowns with different approach
        console.log(`  🏠 Attempting to select room...`);
        
        // Try to find visible dropdowns only
        const dropdowns = await page.locator('.dropdown-portal__header:visible').all();
        console.log(`  Found ${dropdowns.length} dropdowns`);
        
        if (dropdowns.length > 0) {
          await dropdowns[0].click();
          await page.waitForTimeout(800);
          
          // Wait for dropdown options to appear
          await page.waitForTimeout(500);
          
          // Try to select room from env, otherwise use first visible option
          if (process.env.PROCARE_TO_ROOM) {
            try {
              await page.getByText(process.env.PROCARE_TO_ROOM, { exact: true }).click({ timeout: 3000 });
              console.log(`  ✓ Selected room: ${process.env.PROCARE_TO_ROOM}`);
            } catch (e) {
              console.log(`  ⚠️ Room "${process.env.PROCARE_TO_ROOM}" not found, trying visible options`);
              // Try clicking any visible select group item
              await page.locator('.select-group__item:visible').first().click();
            }
          } else {
            // Click first visible option
            await page.locator('.select-group__item:visible').first().click();
          }
          await page.waitForTimeout(500);
        }
        
        // Select "Signed in by" dropdown - second dropdown
        console.log(`  ✍️ Selecting signed in by...`);
        if (dropdowns.length > 1) {
          await dropdowns[1].click();
          await page.waitForTimeout(800);
          
          if (process.env.PROCARE_SIGNED_IN_BY) {
            try {
              await page.getByText(process.env.PROCARE_SIGNED_IN_BY, { exact: true }).click({ timeout: 3000 });
              console.log(`  ✓ Selected: ${process.env.PROCARE_SIGNED_IN_BY}`);
            } catch (e) {
              console.log(`  ⚠️ Person not found, using first visible option`);
              await page.locator('.select-group__item:visible').first().click();
            }
          } else {
            await page.locator('.select-group__item:visible').first().click();
          }
          await page.waitForTimeout(500);
        }
        
        // Set the time (date is fixed to today)
        if (checkIn) {
          const checkInTime = formatTime(checkIn);
          console.log(`  ⏰ Setting time to ${checkIn}...`);
          
          try {
            // Click time icon to activate time inputs
            await page.locator('.tooltip-portal-trigger > .icon > svg').first().click({ force: true, timeout: 5000 });
            await page.waitForTimeout(1000);
            console.log(`  ✓ Opened time editor`);
            
            // Find all textbox inputs
            const allInputs = await page.locator('input[type="text"]').all();
            console.log(`  Found ${allInputs.length} text inputs`);
            
            // Look for hour/minute inputs (usually small numeric inputs)
            const timeInputs = await page.locator('form input[type="text"]').all();
            
            if (timeInputs.length >= 2) {
              // Fill hour
              await timeInputs[0].click();
              await timeInputs[0].clear();
              await timeInputs[0].fill((checkInTime.hours % 12 || 12).toString());
              await page.waitForTimeout(500);
              console.log(`  ✓ Set hour to ${checkInTime.hours % 12 || 12}`);
              
              // Fill minutes
              await timeInputs[1].click();
              await timeInputs[1].clear();
              await timeInputs[1].fill(checkInTime.minutes);
              await page.waitForTimeout(500);
              console.log(`  ✓ Set minutes to ${checkInTime.minutes}`);
              
              // Click AM/PM button
              try {
                await page.getByText(checkInTime.meridiem, { exact: true }).nth(2).click({ force: true, timeout: 3000 });
                console.log(`  ✓ Selected ${checkInTime.meridiem}`);
              } catch (e) {
                try {
                  await page.getByText(checkInTime.meridiem, { exact: true }).first().click({ force: true });
                  console.log(`  ✓ Selected ${checkInTime.meridiem} (fallback)`);
                } catch (e2) {
                  console.log(`  ⚠️ Could not select ${checkInTime.meridiem}`);
                }
              }
              
              await page.waitForTimeout(1000);
            } else {
              console.log(`  ⚠️ Could not find hour/minute inputs`);
            }
          } catch (e) {
            console.log(`  ⚠️ Error setting time: ${e.message}`);
          }
        }
        
        // Check-out time would be set similarly if needed
        // For now, it seems check-out is set later or separately
        
        // Submit the sign-in
        await page.getByRole('button', { name: 'Sign in' }).click();
        await page.waitForTimeout(2000);
        
        results.push({ childName, date: dateStr, status: 'success' });
        console.log(`  ✅ Successfully signed in ${childName}`);
        
        // Navigate back to main page for next entry
        await page.goto(process.env.PROCARE_LOGIN_URL.replace('/login', '/staff'));
        await page.waitForTimeout(1000);
        
      } catch (error) {
        results.push({ childName, date: dateStr, status: 'failed', error: error.message });
        console.log(`  ❌ Failed: ${error.message}`);
      }
    }
    
    // Summary
    const success = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'failed').length;
    console.log(`\n📊 Summary: ${success} success, ${failed} failed`);
    
  } finally {
    await browser.close();
  }
}

// Main execution
(async () => {
  try {
    console.log('🚀 Starting Procare Attendance Sync...\n');
    const rows = await getAttendanceData();
    
    if (rows.length === 0) {
      console.log('ℹ️  No attendance data found in sheet');
      return;
    }
    
    console.log(`📋 Found ${rows.length} attendance records\n`);
    await updateProcare(rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
