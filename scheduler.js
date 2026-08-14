require('dotenv').config();
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Configuration
const START_HOUR = parseInt(process.env.START_HOUR || '7');  // 7 AM
const END_HOUR = parseInt(process.env.END_HOUR || '18');     // 6 PM
const INTERVAL_MINUTES = parseInt(process.env.INTERVAL_MINUTES || '60'); // Every 60 minutes

function isWithinWorkingHours() {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Skip weekends
  if (day === 0 || day === 6) {
    return false;
  }
  
  // Check if within working hours
  return hour >= START_HOUR && hour < END_HOUR;
}

async function runSync() {
  const timestamp = new Date().toISOString();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`⏰ [${timestamp}] Running scheduled sync...`);
  console.log('='.repeat(60));
  
  if (!isWithinWorkingHours()) {
    console.log('⏸️  Outside working hours - skipping');
    return;
  }
  
  try {
    const { stdout, stderr } = await execPromise('node sync-attendance.js');
    console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
  }
}

function scheduleNext() {
  const intervalMs = INTERVAL_MINUTES * 60 * 1000;
  setTimeout(async () => {
    await runSync();
    scheduleNext();
  }, intervalMs);
}

// Start
console.log('🤖 Procare Attendance Scheduler Started');
console.log(`⏰ Running every ${INTERVAL_MINUTES} minutes`);
console.log(`📅 Active hours: ${START_HOUR}:00 - ${END_HOUR}:00 (weekdays only)`);
console.log('Press Ctrl+C to stop\n');

// Run immediately on start, then schedule
runSync().then(() => scheduleNext());
