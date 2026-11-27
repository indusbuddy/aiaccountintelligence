import mongoose from 'mongoose';

let isConnected = false;

export async function connectMongo(): Promise<void> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined in .env');
  }

  try {
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME || 'aiaccountintelligence',
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    console.log('[MongoDB] Connected successfully to database:', mongoose.connection.name);
  } catch (err) {
    console.error('[MongoDB] Initial connection failed:', err);
    throw err;
  }

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Runtime connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('[MongoDB] Disconnected from cluster.');
  });
}
