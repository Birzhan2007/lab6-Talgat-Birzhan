import 'dotenv/config'; // ← ПЕРВОЙ строкой: читает .env в process.env
import express from 'express';
import cors from 'cors';
import { pool } from './db/pool.js';
import { logger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use(logger);

app.get('/', (req, res) => {
  res.send('АгроМаркет API работает');
});

// «Жив ли сервер и есть ли связь с базой?»
app.get('/api/health', async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok', db: 'connected', time: new Date().toISOString() });
});

// GET /api/about из лабораторной 5
app.get('/api/about', (req, res) => {
  res.json({ name: 'АгроМаркет API', version: '1.0.0' });
});

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);

app.use((req, res) => {
  res.status(404).json({ error: `Маршрут ${req.method} ${req.originalUrl} не найден` });
});

app.use(errorHandler); // ← последний middleware

app.listen(PORT, () => {
  console.log(`API запущен: http://localhost:${PORT}`);
});
