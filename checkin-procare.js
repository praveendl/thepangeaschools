require('dotenv').config();
const { chromium } = require('playwright');

// Single check-in function for NFC system
async function checkinStudent(studentName) {
  console.log(`\n🔄 Starting check-in for: ${studentName}`);
  
  const browser = await chromium.launch({ headless: true });
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
    
    // Select room and staff
    const dropdowns = await page.locator('.dropdown-portal__header:visible').all();
    
    if (dropdowns.length > 0) {
      await dropdowns[0].click();
      await page.waitForTimeout(500);
      
      if (process.env.PROCARE_TO_ROOM) {
        try {
          await page.getByText(process.env.PROCARE_TO_ROOM, { exact: true }).click();
        } catch (e) {
          await page.locator('.select-group__item:visible').first().click();
        }
      } else {
        await page.locator('.select-group__item:visible').first().click();
      }
      await page.waitForTimeout(500);
    }
    
    if (dropdowns.length > 1) {
      await dropdowns[1].click();
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
    
    // Submit check-in (uses current time)
    console.log('💾 Submitting check-in...');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForTimeout(2000);
    
    console.log(`✅ Successfully checked in ${studentName}`);
    
    await browser.close();
    return { success: true, student: studentName, time: new Date().toLocaleTimeString() };
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    await browser.close();
    return { success: false, student: studentName, error: error.message };
  }
}

// Check-out function for NFC system
async function checkoutStudent(studentName) {
  console.log(`\n🔄 Starting check-out for: ${studentName}`);
  
  const browser = await chromium.launch({ headless: true });
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
    await page.waitForTimeout(2000);
    
    console.log(`✅ Successfully checked out ${studentName}`);
    
    await browser.close();
    return { success: true, student: studentName, time: new Date().toLocaleTimeString() };
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    await browser.close();
    return { success: false, student: studentName, error: error.message };
  }
}

module.exports = { checkinStudent, checkoutStudent };
