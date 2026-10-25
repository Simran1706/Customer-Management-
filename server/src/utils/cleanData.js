const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const cleanAndSyncData = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/customer_management';
    await mongoose.connect(uri);
    console.log('[CleanData] Connected to MongoDB.');

    // 1. Clean up Simran Gupta's record if present
    const simran = await User.findOne({ email: 'simmogupta4@gmail.com' });
    if (simran) {
      simran.phone = '9604495863'; // Exactly 10 digits
      simran.address = 'Flat 402, Green Heights, Andheri West, Mumbai, 400053';
      simran.name = 'Simran Gupta';
      await simran.save();
      console.log('[CleanData] Updated Simran Gupta with 10-digit phone: 9604495863');
    }

    // 2. Standardize all other sample customers to valid 10-digit mobile numbers & real addresses
    const standardizedCustomers = [
      {
        email: 'priya.sharma@zenithlabs.in',
        name: 'Priya Sharma',
        phone: '9876543210',
        address: '42 Brigade Road, MG Road, Bengaluru, Karnataka 560001',
        status: 'active'
      },
      {
        email: 'liam.g@soundwave.co.uk',
        name: 'Liam Gallagher',
        phone: '9820123456',
        address: '15 Marine Drive, Nariman Point, Mumbai 400021',
        status: 'inactive'
      },
      {
        email: 'amina.mansoor@globalfin.org',
        name: 'Amina Al-Mansoor',
        phone: '9712345678',
        address: 'Tower B, Cyber City, DLF Phase 2, Gurugram 122002',
        status: 'active'
      },
      {
        email: 'marcus.vance@apexlogistics.com',
        name: 'Marcus Vance',
        phone: '9654321098',
        address: '88 Tech Park, Viman Nagar, Pune, Maharashtra 411014',
        status: 'active'
      },
      {
        email: 'elena.rostova@cloudscale.net',
        name: 'Elena Rostova',
        phone: '9543210987',
        address: '104 Banjara Hills, Road No 12, Hyderabad, Telangana 500034',
        status: 'inactive'
      },
      {
        email: 'david.miller@techflow.io',
        name: 'David Miller',
        phone: '9432109876',
        address: '24 Park Street, Kolkata, West Bengal 700016',
        status: 'active'
      },
      {
        email: 'sarah.connor@example.com',
        name: 'Sarah Connor',
        phone: '9321098765',
        address: '74 Sector 18, Noida, Uttar Pradesh 201301',
        status: 'active'
      }
    ];

    for (const data of standardizedCustomers) {
      await User.findOneAndUpdate(
        { email: data.email },
        {
          name: data.name,
          phone: data.phone,
          address: data.address,
          status: data.status
        },
        { new: true }
      );
    }

    console.log('[CleanData] Successfully standardized all customer data to 10-digit mobile numbers!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[CleanData Error]', err.message);
    process.exit(1);
  }
};

cleanAndSyncData();
