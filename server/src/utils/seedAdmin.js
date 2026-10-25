const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedInitialData = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@crm.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

    // Check if Super Admin exists
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!existingAdmin) {
      await User.create({
        name: process.env.ADMIN_NAME || 'Super Administrator',
        email: adminEmail.toLowerCase(),
        phone: process.env.ADMIN_PHONE || '+1 (555) 019-2834',
        address: process.env.ADMIN_ADDRESS || 'Global HQ, 100 Innovation Way, Suite 400',
        password: adminPassword,
        role: 'admin',
        status: 'active'
      });
      console.log(`[Seed] Super Admin created: ${adminEmail} (password: ${adminPassword})`);
    } else {
      console.log(`[Seed] Super Admin already exists: ${adminEmail}`);
    }

    // Check customer count to seed demo records if database is empty
    const customerCount = await User.countDocuments({ role: 'customer' });
    if (customerCount === 0) {
      console.log('[Seed] Seeding realistic sample customers for demonstration...');
      const sampleCustomers = [
        {
          name: 'Sarah Connor',
          email: 'sarah.connor@example.com',
          phone: '9321098765',
          address: '74 Sector 18, Noida, Uttar Pradesh',
          password: 'Password@123',
          role: 'customer',
          status: 'active'
        },
        {
          name: 'David Miller',
          email: 'david.miller@techflow.io',
          phone: '9432109876',
          address: '24 Park Street, Kolkata, West Bengal',
          password: 'Password@123',
          role: 'customer',
          status: 'active'
        },
        {
          name: 'Elena Rostova',
          email: 'elena.rostova@cloudscale.net',
          phone: '9543210987',
          address: '104 Banjara Hills, Hyderabad, Telangana',
          password: 'Password@123',
          role: 'customer',
          status: 'inactive'
        },
        {
          name: 'Marcus Vance',
          email: 'marcus.vance@apexlogistics.com',
          phone: '9654321098',
          address: '88 Tech Park, Viman Nagar, Pune, Maharashtra',
          password: 'Password@123',
          role: 'customer',
          status: 'active'
        },
        {
          name: 'Amina Al-Mansoor',
          email: 'amina.mansoor@globalfin.org',
          phone: '9712345678',
          address: 'Tower B, Cyber City, Gurugram, Haryana',
          password: 'Password@123',
          role: 'customer',
          status: 'active'
        },
        {
          name: 'Liam Gallagher',
          email: 'liam.g@soundwave.co.uk',
          phone: '9820123456',
          address: '15 Marine Drive, Nariman Point, Mumbai',
          password: 'Password@123',
          role: 'customer',
          status: 'inactive'
        },
        {
          name: 'Priya Sharma',
          email: 'priya.sharma@zenithlabs.in',
          phone: '9876543210',
          address: '42 Brigade Road, Bengaluru, Karnataka',
          password: 'Password@123',
          role: 'customer',
          status: 'active'
        }
      ];

      for (const cust of sampleCustomers) {
        await User.create(cust);
      }
      console.log(`[Seed] Seeded ${sampleCustomers.length} initial demo customers.`);
    }
  } catch (err) {
    console.error('[Seed Error] Failed to seed initial data:', err.message);
  }
};

// If run directly via CLI
if (require.main === module) {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/customer_management';
  mongoose
    .connect(uri)
    .then(async () => {
      console.log('[Seed CLI] Connected to MongoDB.');
      await seedInitialData();
      console.log('[Seed CLI] Seeding completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed CLI Error]', err.message);
      process.exit(1);
    });
}

module.exports = seedInitialData;
