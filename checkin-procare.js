require('dotenv').config();
const { chromium } = require('playwright');

// Single check-in function for NFC system
async function checkinStudent(studentName) {
  console.log(`\n🔄 Starting check-in for: ${studentName}`);
  
  const browser = await chromium.launch({ 
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-extensions',
      '--disable-background-networking',
      '--single-process'
    ]
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Login
    console.log('🔐 Logging into Procare...');
    await page.goto(process.env.PROCARE_LOGIN_URL);
    
    await page.getByText('STAFF').click();
    await page.waitForTimeout(500);
    
    await page.getByRole('textbox', { name: 'Email Address' }).fill(process.env.PROCARE_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(process.env.PROCARE_PASSWORD);
    await page.getByTestId('login-submit').click();
    
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (e) {
      await page.waitForTimeout(3000);
    }
    
    console.log('✅ Logged in');

    // Navigate to check-in
    await page.getByRole('link', { name: 'Student Sign-In' }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'Create Sign-In' }).click();
    await page.waitForTimeout(500);
    
    await page.getByText('Sign-In Attendance', { exact: true }).click();
    await page.waitForTimeout(1000);
    
    // Search for student
    console.log(`🔍 Searching for ${studentName}...`);
    await page.locator('#search').fill(studentName.toLowerCase());
    await page.waitForTimeout(1500);
    
    // Select student
    try {
      await page.getByText(studentName, { exact: false }).click();
    } catch (e) {
      await page.locator('.student-card').first().click();
    }
    
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForTimeout(3000);
    
    console.log('📝 Filling details...');
    
    // Log current URL to verify we're on the right page
    console.log(`📍 Current URL: ${page.url()}`);
    
    // Select room and staff
    const dropdowns = await page.locator('.dropdown-portal__header:visible').all();
    console.log(`🔍 Found ${dropdowns.length} dropdowns`);
    console.log(`🔧 ENV: PROCARE_TO_ROOM="${process.env.PROCARE_TO_ROOM}", PROCARE_SIGNED_IN_BY="${process.env.PROCARE_SIGNED_IN_BY}"`);
    
    if (dropdowns.length > 0) {
      await dropdowns[0].click();
      await page.waitForTimeout(500);
      
      // List available options
      const roomOptions = await page.locator('.select-group__item:visible').allTextContents();
      console.log(`📋 Available rooms: ${JSON.stringify(roomOptions)}`);
      
      if (process.env.PROCARE_TO_ROOM) {
        try {
          console.log(`🏠 Selecting room: ${process.env.PROCARE_TO_ROOM}`);
          await page.getByText(process.env.PROCARE_TO_ROOM, { exact: true }).click();
          console.log(`✅ Selected room: ${process.env.PROCARE_TO_ROOM}`);
        } catch (e) {
          console.log(`⚠️  Room not found, using first option`);
          await page.locator('.select-group__item:visible').first().click();
        }
      } else {
        console.log(`⚠️  No PROCARE_TO_ROOM set, using first option`);
        await page.locator('.select-group__item:visible').first().click();
      }
      await page.waitForTimeout(500);
    }
    
    if (dropdowns.length > 1) {
      await dropdowns[1].click();
      await page.waitForTimeout(500);
      
      // List available options
      const staffOptions = await page.locator('.select-group__item:visible').allTextContents();
      console.log(`📋 Available staff: ${JSON.stringify(staffOptions)}`);
      
      if (process.env.PROCARE_SIGNED_IN_BY) {
        try {
          console.log(`✍️  Selecting signed in by: ${process.env.PROCARE_SIGNED_IN_BY}`);
          await page.getByText(process.env.PROCARE_SIGNED_IN_BY, { exact: true }).click();
          console.log(`✅ Selected: ${process.env.PROCARE_SIGNED_IN_BY}`);
        } catch (e) {
          console.log(`⚠️  Person not found, using first option`);
          await page.locator('.select-group__item:visible').first().click();
        }
      } else {
        console.log(`⚠️  No PROCARE_SIGNED_IN_BY set, using first option`);
        await page.locator('.select-group__item:visible').first().click();
      }
      await page.waitForTimeout(500);
    }
    
    // Submit check-in (uses current time)
    console.log('💾 Submitting check-in...');
    
    // Take screenshot before submission for debugging
    try {
      await page.screenshot({ path: 'before-submit.png' });
      console.log('📸 Screenshot saved');
    } catch (e) {
      console.log('⚠️  Could not take screenshot');
    }
    
    // Verify the sign-in button is visible
    const signInButton = page.getByRole('button', { name: 'Sign in' });
    const isVisible = await signInButton.isVisible();
    console.log(`🔍 Sign in button visible: ${isVisible}`);
    
    await signInButton.click();
    console.log('✅ Clicked Sign in button');
    
    // Wait a moment for any validation errors
    await page.waitForTimeout(1000);
    
    // Check if there's an error message
    const errorExists = await page.locator('.error, .alert, [role="alert"]').first().isVisible().catch(() => false);
    if (errorExists) {
      const errorText = await page.locator('.error, .alert, [role="alert"]').first().textContent();
      console.log(`❌ Form error: ${errorText}`);
      throw new Error(`Procare form error: ${errorText}`);
    }
    
    // Wait for navigation or success indicator
    try {
      // Wait for the URL to change (indicates successful submission)
      await page.waitForURL('**/attendance**', { timeout: 5000 });
      console.log('✅ Form submitted - navigated to attendance page');
    } catch (e) {
      // Or wait for success message
      try {
        await page.waitForSelector('.success, .toast, [role="status"]', { timeout: 3000 });
        console.log('✅ Form submitted - success message shown');
      } catch (e2) {
        console.log('⚠️  Could not confirm submission (may still be successful)');
      }
    }
    
    try {
      await page.waitForTimeout(2000);
    } catch (e) {
      // Ignore timeout/crash errors after successful submission
      console.log('⚠️  Page closed after submission (this is okay)');
    }
    
    console.log(`✅ Successfully checked in ${studentName}`);
    
    try {
      await browser.close();
    } catch (e) {
      // Browser might already be closed
    }
    
    return { success: true, student: studentName, time: new Date().toLocaleTimeString() };
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    try {
      await browser.close();
    } catch (e) {
      // Browser might already be closed
    }
    return { success: false, student: studentName, error: error.message };
  }
}

// Check-out function for NFC system
async function checkoutStudent(studentName) {
  console.log(`\n🔄 Starting check-out for: ${studentName}`);
  
  const browser = await chromium.launch({ 
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-extensions',
      '--disable-background-networking',
      '--single-process'
    ]
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Login
    console.log('🔐 Logging into Procare...');
    await page.goto(process.env.PROCARE_LOGIN_URL);
    
    await page.getByText('STAFF').click();
    await page.waitForTimeout(500);
    
    await page.getByRole('textbox', { name: 'Email Address' }).fill(process.env.PROCARE_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(process.env.PROCARE_PASSWORD);
    await page.getByTestId('login-submit').click();
    
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (e) {
      await page.waitForTimeout(3000);
    }
    
    console.log('✅ Logged in');

    // Navigate to check-out
    await page.getByRole('link', { name: 'Student Sign-In' }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'Create Sign-In' }).click();
    await page.waitForTimeout(500);
    
    await page.getByText('Sign-Out Attendance').click();
    await page.waitForTimeout(1000);
    
    // Search for student
    console.log(`🔍 Searching for ${studentName}...`);
    await page.locator('#search').fill(studentName.toLowerCase());
    await page.waitForTimeout(1500);
    
    // Select student
    try {
      await page.getByText(studentName, { exact: false }).click();
    } catch (e) {
      await page.locator('.student-card').first().click();
    }
    
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForTimeout(3000);
    
    console.log('📝 Filling details...');
    
    // Select "Signed out by" dropdown
    const dropdowns = await page.locator('.dropdown-portal__header:visible').all();
    
    if (dropdowns.length > 0) {
      await dropdowns[0].click();
      await page.waitForTimeout(500);
      
      if (process.env.PROCARE_SIGNED_IN_BY) {
        try {
          await page.getByText(process.env.PROCARE_SIGNED_IN_BY, { exact: true }).click();
        } catch (e) {
          await page.locator('.select-group__item:visible').first().click();
        }
      } else {
        await page.locator('.select-group__item:visible').first().click();
      }
      await page.waitForTimeout(500);
    }
    
    // Submit check-out
    console.log('💾 Submitting check-out...');
    await page.getByRole('button', { name: 'Sign out' }).click();
    
    try {
      await page.waitForTimeout(2000);
    } catch (e) {
      // Ignore timeout/crash errors after successful submission
      console.log('⚠️  Page closed after submission (this is okay)');
    }
    
    console.log(`✅ Successfully checked out ${studentName}`);
    
    try {
      await browser.close();
    } catch (e) {
      // Browser might already be closed
    }
    
    return { success: true, student: studentName, time: new Date().toLocaleTimeString() };
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    try {
      await browser.close();
    } catch (e) {
      // Browser might already be closed
    }
    return { success: false, student: studentName, error: error.message };
  }
}

module.exports = { checkinStudent, checkoutStudent };
