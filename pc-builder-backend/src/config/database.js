import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = process.env.SQLITE_STORAGE || path.resolve(__dirname, '../../data/dev.sqlite');
const dir = path.dirname(storage);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: false,
});

export async function connectDB() {
  try {
    await sequelize.authenticate();
    return true;
  } catch (err) {
    console.error('DB connection failed:', err.message);
    throw err;
  }
}
