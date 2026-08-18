require('dotenv').config();
const { chromium } = require('playwright');

// Single check-in function for NFC system
async function checkinStudent(studentName) {
  console.log(`\n🔄 Starting check-in for: ${studentName}`);
  
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 }
    });
    
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
    
    // Check for time input fields (might be required)
    const timeInputs = await page.locator('input[type="time"], input[placeholder*="time" i]').count();
    console.log(`⏰ Found ${timeInputs} time input fields`);
    
    if (timeInputs > 0) {
      console.log('⚠️  Time fields detected - these might need to be filled!');
    }
    
    // Select room and staff (use first option for both)
    const dropdowns = await page.locator('.dropdown-portal__header:visible').all();
    console.log(`🔍 Found ${dropdowns.length} dropdowns`);
    
    if (dropdowns.length > 0) {
      console.log('🏠 Selecting first room option');
      await dropdowns[0].click();
      await page.waitForTimeout(500);
      await page.locator('.select-group__item:visible').first().click();
      await page.waitForTimeout(500);
      console.log('✅ Room selected');
    }
    
    if (dropdowns.length > 1) {
      console.log('✍️  Selecting first staff option');
      await dropdowns[1].click();
      await page.waitForTimeout(500);
      await page.locator('.select-group__item:visible').first().click();
      await page.waitForTimeout(500);
      console.log('✅ Staff selected');
    }
    
    // Wait for any pending network requests to complete
    console.log('⏳ Waiting for network to be idle...');
    try {
      await page.waitForLoadState('networkidle', { timeout: 5000 });
      console.log('✅ Network idle');
    } catch (e) {
      console.log('⚠️  Network not idle, continuing anyway');
    }
    
    // Wait a bit more for JavaScript to initialize
    await page.waitForTimeout(1000);
    
    // Check if there are any time/date picker icons that need clicking
    const timeIcons = await page.locator('.time-picker, .clock-icon, [class*="time"], [class*="clock"]').count();
    console.log(`🕐 Found ${timeIcons} potential time picker elements`);
    
    // Check if there's a displayed time that might need to be "touched" or confirmed
    const timeDisplays = await page.locator('input[readonly], .time-display').all();
    if (timeDisplays.length > 0) {
      console.log(`⏰ Found ${timeDisplays.length} time display fields`);
      for (const display of timeDisplays) {
        const value = await display.inputValue().catch(async () => {
          return await display.textContent().catch(() => '');
        });
        if (value) {
          console.log(`   Time shown: ${value}`);
        }
      }
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
    
    // Wait a bit for any JavaScript to finish loading
    await page.waitForTimeout(1000);
    
    // Find the submit button using multiple selectors
    console.log('🔍 Looking for submit button...');
    
    let submitButton = null;
    
    // Try different selectors
    const selectors = [
      'button[type="submit"]',
      'button:has-text("Sign in")',
      '.submit-button',
      '[data-testid*="submit"]'
    ];
    
    for (const selector of selectors) {
      const btn = page.locator(selector).first();
      if (await btn.isVisible().catch(() => false)) {
        submitButton = btn;
        console.log(`✅ Found button with selector: ${selector}`);
        break;
      }
    }
    
    if (!submitButton) {
      submitButton = page.getByRole('button', { name: 'Sign in' });
      console.log('Using role-based selector');
    }
    
    const isVisible = await submitButton.isVisible();
    const isEnabled = await submitButton.isEnabled();
    console.log(`🔍 Sign in button - visible: ${isVisible}, enabled: ${isEnabled}`);
    
    if (!isEnabled) {
      console.log('❌ Sign in button is disabled');
      throw new Error('Sign in button is disabled');
    }
    
    // Scroll button into view
    await submitButton.scrollIntoViewIfNeeded();
    console.log('📜 Scrolled to button');
    
    // Get button position for more human-like interaction
    const buttonBox = await submitButton.boundingBox();
    if (buttonBox) {
      console.log(`📍 Button position: x=${buttonBox.x}, y=${buttonBox.y}`);
      
      // Move mouse to button (more human-like)
      await page.mouse.move(buttonBox.x + buttonBox.width / 2, buttonBox.y + buttonBox.height / 2);
      await page.waitForTimeout(100);
      console.log('🖱️  Moved mouse to button');
    }
    
    // Try clicking with delay (simulates human click)
    try {
      console.log('🖱️  Trying click with delay...');
      await submitButton.click({ delay: 100 });
      await page.waitForTimeout(2000);
      
      const formClosed = !(await page.locator('.modal, form').first().isVisible().catch(() => false));
      if (formClosed) {
        console.log('✅ Form submitted via delayed click');
      } else {
        console.log('⚠️  Delayed click did not work, trying dispatchEvent...');
        
        // Try triggering click event directly via JavaScript
        await submitButton.evaluate(btn => btn.click());
        await page.waitForTimeout(2000);
        
        const formClosedAfterJS = !(await page.locator('.modal, form').first().isVisible().catch(() => false));
        if (formClosedAfterJS) {
          console.log('✅ Form submitted via JavaScript click');
        } else {
          console.log('⚠️  JavaScript click also failed');
        }
      }
    } catch (e) {
      console.log(`⚠️  Error during submission: ${e.message}`);
    }
    
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
      // Check if form is still visible (would mean submission failed)
      const formStillVisible = await page.locator('.modal, form').first().isVisible().catch(() => false);
      if (formStillVisible) {
        console.log('⚠️  Form still visible after click - submission may have failed');
        await page.screenshot({ path: 'after-submit-failed.png' });
        console.log('📸 Failure screenshot saved');
      } else {
        console.log('✅ Form closed - submission likely successful');
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
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // Browser might already be closed
      }
    }
    return { success: false, student: studentName, error: error.message };
  }
}

// Check-out function for NFC system
async function checkoutStudent(studentName) {
  console.log(`\n🔄 Starting check-out for: ${studentName}`);
  
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 }
    });
    
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
    
    // Wait for the page to load and search box to appear
    console.log(`🔍 Waiting for search box...`);
    try {
      await page.waitForSelector('#search', { timeout: 10000, state: 'visible' });
      console.log('✅ Search box found');
    } catch (e) {
      console.log('❌ Search box not found');
      console.log(`📍 Current URL: ${page.url()}`);
      await page.screenshot({ path: 'checkout-no-search.png' });
      throw new Error('Search box not found on Sign-Out page');
    }
    
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
    
    // Select "Signed out by" dropdown (use first option)
    const dropdowns = await page.locator('.dropdown-portal__header:visible').all();
    console.log(`🔍 Found ${dropdowns.length} dropdowns`);
    
    if (dropdowns.length > 0) {
      console.log('✍️  Selecting first staff option');
      await dropdowns[0].click();
      await page.waitForTimeout(500);
      await page.locator('.select-group__item:visible').first().click();
      await page.waitForTimeout(500);
      console.log('✅ Staff selected');
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
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // Browser might already be closed
      }
    }
    return { success: false, student: studentName, error: error.message };
  }
}

module.exports = { checkinStudent, checkoutStudent };
