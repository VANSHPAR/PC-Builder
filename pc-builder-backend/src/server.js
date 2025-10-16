import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { syncModels } from './models/index.js';
import productsRouter from './routes/products.js';
import cartRouter from './routes/cart.js';
import ordersRouter from './routes/orders.js';
import servicesRouter from './routes/services.js';
import aiRouter from './routes/ai.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()) || '*',
    credentials: true,
  })
);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/services', servicesRouter);
app.use('/api/ai', aiRouter);

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  await syncModels();
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
})();
