const mongoose = require('mongoose');

let mongoMemoryServer = null;

/**
 * Connect to MongoDB with automatic In-Memory fallback if local Mongo is not running
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/customer_management';

  try {
    // Attempt standard connection with 2.5 second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`[Database] MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error) {
    console.warn(`[Database] Local MongoDB is not reachable (${error.message}).`);
    console.log(`[Database] Initializing In-Memory MongoDB Server (Zero-Configuration Fallback)...`);
    console.log(`[Database] If this is your first run, downloading the in-memory binary may take 1-2 minutes.`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'customer_management'
        },
        spawn: {
          timeout: 60000 // Allow up to 60s for initial binary download if needed
        }
      });
      const inMemoryUri = mongoMemoryServer.getUri();

      await mongoose.connect(inMemoryUri, {
        dbName: 'customer_management'
      });

      console.log(`====================================================`);
      console.log(`  [Database] Connected to In-Memory MongoDB Server! `);
      console.log(`  Ready to accept customer and admin operations.    `);
      console.log(`====================================================`);
    } catch (memError) {
      console.error(`[Database Error] Could not start in-memory MongoDB:`, memError.message);
      console.warn(`[Database Warning] You can also connect to free MongoDB Atlas:`);
      console.warn(`  1. Create free database at https://www.mongodb.com/atlas`);
      console.warn(`  2. Paste your connection string into server/.env (MONGODB_URI)`);
    }
  }
};

module.exports = connectDB;
