import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { pool } from './pool.js';

const schema = readFileSync('./db/schema.sql', 'utf-8');
const raw = JSON.parse(readFileSync('./data/db.json', 'utf-8'));
const products = Array.isArray(raw) ? raw : raw.products;

await pool.query(schema); // 1. создаём таблицы

for (const p of products) { // 2. переносим товары из db.json
  const name = p.name ?? p.title;                                  // название: name или title
  const price = Math.round(Number(String(p.price).replace(/[^\d.]/g, '')));
  await pool.query(
    `INSERT INTO products (name, category, price, unit, image)
     VALUES ($1, $2, $3, $4, $5)`,
    [name, p.category ?? null, price, p.unit ?? 'кг', p.image ?? null]
  );
}

console.log(`Готово: таблицы созданы, товаров добавлено — ${products.length}`);
await pool.end(); // 3. закрываем соединения, иначе скрипт не завершится
