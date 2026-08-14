require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { checkinStudent, checkoutStudent } = require('./checkin-procare');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Load students mapping
function getStudents() {
  const data = fs.readFileSync(path.join(__dirname, 'students.json'), 'utf8');
  return JSON.parse(data);
}

// API: Check-in endpoint
app.post('/api/checkin', async (req, res) => {
  const { rfidId } = req.body;
  
  if (!rfidId) {
    return res.status(400).json({ error: 'RFID ID is required' });
  }
  
  console.log(`\n📱 Received check-in request for RFID: ${rfidId}`);
  
  try {
    const studentsData = getStudents();
    const student = studentsData.students[rfidId];
    
    if (!student) {
      console.log(`⚠️  RFID ${rfidId} not found in database`);
      return res.status(404).json({ 
        error: 'Student not found', 
        rfidId: rfidId 
      });
    }
    
    console.log(`✓ Found student: ${student.name}`);
    
    // Check in to Procare
    const result = await checkinStudent(student.name);
    
    res.json({
      success: result.success,
      student: student.name,
      room: student.room,
      time: result.time || new Date().toLocaleTimeString(),
      error: result.error
    });
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Track check-in status (persisted to file)
const STATUS_FILE = path.join(__dirname, 'checkin-status.json');

function loadCheckinStatus() {
  try {
    if (fs.existsSync(STATUS_FILE)) {
      const data = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
      return new Map(Object.entries(data));
    }
  } catch (error) {
    console.error('Error loading check-in status:', error);
  }
  return new Map();
}

function saveCheckinStatus(statusMap) {
  try {
    const data = Object.fromEntries(statusMap);
    fs.writeFileSync(STATUS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving check-in status:', error);
  }
}

const checkedInStudents = loadCheckinStatus();

// Simple GET endpoint for iOS Shortcuts (easier to use)
app.get('/api/checkin/:rfidId', async (req, res) => {
  const { rfidId } = req.params;
  
  // Prevent caching
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Expires', '-1');
  res.set('Pragma', 'no-cache');
  
  console.log(`\n📱 Received request for RFID: ${rfidId} at ${new Date().toLocaleTimeString()}`);
  
  try {
    const studentsData = getStudents();
    const student = studentsData.students[rfidId];
    
    if (!student) {
      console.log(`⚠️  RFID ${rfidId} not found`);
      return res.send(`❌ Student not found for tag: ${rfidId}`);
    }
    
    console.log(`✓ Found student: ${student.name}`);
    
    // Check if student is already checked in
    const isCheckedIn = checkedInStudents.has(rfidId);
    
    if (isCheckedIn) {
      console.log(`🔄 Student already checked in - checking OUT`);
      
      // Check out from Procare
      const result = await checkoutStudent(student.name);
      
      if (result.success) {
        checkedInStudents.delete(rfidId);
        saveCheckinStatus(checkedInStudents);
        console.log(`✓ Saved check-out status to file`);
        const html = `
          <!DOCTYPE html>
          <html><head><meta charset="UTF-8">
          <meta http-equiv="refresh" content="3;url=http://${req.get('host')}">
          <style>body{font-family:system-ui;text-align:center;padding:50px;font-size:24px;}</style>
          </head><body>
          <h1>✅ ${student.name}</h1>
          <p>Checked OUT at ${result.time}</p>
          <p style="font-size:14px;color:#666;">Redirecting...</p>
          </body></html>
        `;
        res.send(html);
      } else {
        const html = `
          <!DOCTYPE html>
          <html><head><meta charset="UTF-8">
          <style>body{font-family:system-ui;text-align:center;padding:50px;font-size:24px;}</style>
          </head><body>
          <h1>❌ Error</h1>
          <p>Failed to check out ${student.name}</p>
          <p style="font-size:14px;">${result.error}</p>
          </body></html>
        `;
        res.send(html);
      }
    } else {
      console.log(`🔄 Checking IN student`);
      
      // Check in to Procare
      const result = await checkinStudent(student.name);
      
      if (result.success) {
        checkedInStudents.set(rfidId, {
          name: student.name,
          checkInTime: new Date().toISOString() // Store as ISO string, not Date object
        });
        saveCheckinStatus(checkedInStudents);
        console.log(`✓ Saved check-in status to file`);
        const html = `
          <!DOCTYPE html>
          <html><head><meta charset="UTF-8">
          <meta http-equiv="refresh" content="3;url=http://${req.get('host')}">
          <style>body{font-family:system-ui;text-align:center;padding:50px;font-size:24px;}</style>
          </head><body>
          <h1>✅ ${student.name}</h1>
          <p>Checked IN at ${result.time}</p>
          <p style="font-size:14px;color:#666;">Redirecting...</p>
          </body></html>
        `;
        res.send(html);
      } else {
        const html = `
          <!DOCTYPE html>
          <html><head><meta charset="UTF-8">
          <style>body{font-family:system-ui;text-align:center;padding:50px;font-size:24px;}</style>
          </head><body>
          <h1>❌ Error</h1>
          <p>Failed to check in ${student.name}</p>
          <p style="font-size:14px;">${result.error}</p>
          </body></html>
        `;
        res.send(html);
      }
    }
    
  } catch (error) {
    console.error('Server error:', error);
    res.send(`❌ Server error: ${error.message}`);
  }
});

// API to manually reset check-in status (for testing)
app.post('/api/reset', (req, res) => {
  checkedInStudents.clear();
  saveCheckinStatus(checkedInStudents);
  console.log('🔄 Reset all check-in statuses');
  res.json({ message: 'All statuses reset' });
});

// API to see who's checked in
app.get('/api/status', (req, res) => {
  const status = Array.from(checkedInStudents.entries()).map(([rfidId, data]) => ({
    student: data.name,
    checkInTime: data.checkInTime,
    duration: Math.floor((new Date() - data.checkInTime) / 1000 / 60) + ' minutes'
  }));
  
  res.json({
    checkedInCount: checkedInStudents.size,
    students: status
  });
});

// API: Get all students
app.get('/api/students', (req, res) => {
  try {
    const studentsData = getStudents();
    res.json(studentsData);
  } catch (error) {
    res.status(500).json({ error: 'Could not load students' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 NFC Check-in Server Running`);
  console.log(`📱 Open on your phone: http://localhost:${PORT}`);
  console.log(`\n💡 To access from your phone:`);
  console.log(`   1. Find your computer's IP address`);
  console.log(`   2. Open http://YOUR_IP:${PORT} on your iPhone\n`);
});
