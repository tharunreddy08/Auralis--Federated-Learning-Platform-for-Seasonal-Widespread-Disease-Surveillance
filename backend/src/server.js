import dotenv from 'dotenv';
import app from './app.js';
import { connectDatabase } from './config/db.js';
import { seedIfEmpty } from './data/seedIfEmpty.js';

dotenv.config();

const port = Number(process.env.PORT) || 5000;
const mongoUri = process.env.MONGODB_URI;

const start = async () => {
  try {
    await connectDatabase(mongoUri);
    const seeded = await seedIfEmpty();
    if (seeded) {
      console.log('Seeded initial data because database was empty.');
    }
    app.listen(port, () => {
      console.log(`Backend API running on http://localhost:${port}`);
    });
  } catch (error) {
    const help =
      error.message === 'MONGODB_URI is required.'
        ? 'Create backend/.env with MONGODB_URI or copy backend/.env.example to backend/.env.'
        : error.message;

    console.error('Failed to start backend API:', help);
    process.exit(1);
  }
};

start();
