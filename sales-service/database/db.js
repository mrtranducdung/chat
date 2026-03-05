import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'sales.db');

export let db = new Database(DB_PATH);

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      region TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      region TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_date TEXT NOT NULL,
      customer_id INTEGER,
      staff_id INTEGER,
      region TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'completed',
      total_amount REAL NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (staff_id) REFERENCES staff(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  const count = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  if (count === 0) {
    seedData();
    console.log('✅ Database seeded with sample data');
  }

  console.log('✅ Sales database ready');
}

function seedData() {
  const insertProduct = db.prepare('INSERT INTO products (name, category, price) VALUES (?, ?, ?)');
  const products = [
    ['Laptop Pro 15"',        'Electronics', 25000000],
    ['Wireless Mouse',        'Electronics',   450000],
    ['Mechanical Keyboard',   'Electronics',  1200000],
    ['Monitor 27"',           'Electronics',  8500000],
    ['Office Chair',          'Furniture',    3200000],
    ['Standing Desk',         'Furniture',    5500000],
    ['Notebook A4',           'Stationery',     35000],
    ['Ballpoint Pen (10pcs)', 'Stationery',     25000],
    ['USB-C Hub',             'Electronics',   650000],
    ['Webcam HD',             'Electronics',  1100000],
  ];
  products.forEach(p => insertProduct.run(...p));

  const insertStaff = db.prepare('INSERT INTO staff (name, region) VALUES (?, ?)');
  const staffList = [
    ['Nguyễn Văn An',   'Hà Nội'],
    ['Trần Thị Bình',   'Hà Nội'],
    ['Lê Văn Cường',    'TP.HCM'],
    ['Phạm Thị Dung',   'TP.HCM'],
    ['Hoàng Văn Em',    'Đà Nẵng'],
  ];
  staffList.forEach(s => insertStaff.run(...s));

  const insertCustomer = db.prepare('INSERT INTO customers (name, email, region) VALUES (?, ?, ?)');
  const customers = [
    ['Công ty ABC',          'abc@email.com',  'Hà Nội'],
    ['Công ty XYZ',          'xyz@email.com',  'TP.HCM'],
    ['Trường THPT Lê Lợi',  'loi@edu.vn',     'Đà Nẵng'],
    ['Văn phòng DEF',        'def@gmail.com',  'Hà Nội'],
    ['Cửa hàng GHI',         'ghi@shop.vn',    'TP.HCM'],
    ['Công ty JKL',          'jkl@corp.vn',    'Đà Nẵng'],
  ];
  customers.forEach(c => insertCustomer.run(...c));

  const insertOrder = db.prepare(
    'INSERT INTO orders (order_date, customer_id, staff_id, region, status, total_amount) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertItem = db.prepare(
    'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)'
  );

  const regions  = ['Hà Nội', 'TP.HCM', 'Đà Nẵng'];
  const statuses = ['completed', 'completed', 'completed', 'cancelled', 'pending'];
  const now = new Date();

  for (let i = 0; i < 200; i++) {
    const daysAgo = Math.floor(Math.random() * 180);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    const dateStr = date.toISOString().split('T')[0];

    const customerId = Math.floor(Math.random() * 6) + 1;
    const staffId    = Math.floor(Math.random() * 5) + 1;
    const region     = regions[Math.floor(Math.random() * regions.length)];
    const status     = statuses[Math.floor(Math.random() * statuses.length)];

    const itemCount = Math.floor(Math.random() * 3) + 1;
    let total = 0;
    const items = [];

    for (let j = 0; j < itemCount; j++) {
      const productId = Math.floor(Math.random() * 10) + 1;
      const qty       = Math.floor(Math.random() * 5) + 1;
      const price     = products[productId - 1][2];
      total += qty * price;
      items.push([productId, qty, price]);
    }

    const { lastInsertRowid: orderId } = insertOrder.run(dateStr, customerId, staffId, region, status, total);
    items.forEach(([pid, qty, price]) => insertItem.run(orderId, pid, qty, price));
  }
}

// Schema string dùng cho AI prompt
export const SCHEMA_DESCRIPTION = `
SQLite database schema:

products(id, name TEXT, category TEXT, price REAL)
  -- categories: 'Electronics', 'Furniture', 'Stationery'

customers(id, name TEXT, email TEXT, region TEXT)

staff(id, name TEXT, region TEXT)

orders(id, order_date TEXT 'YYYY-MM-DD', customer_id, staff_id, region TEXT, status TEXT, total_amount REAL)
  -- status values: 'completed', 'cancelled', 'pending'
  -- regions: 'Hà Nội', 'TP.HCM', 'Đà Nẵng'

order_items(id, order_id, product_id, quantity INTEGER, unit_price REAL)

Common joins:
  orders o JOIN staff s ON s.id = o.staff_id
  orders o JOIN customers c ON c.id = o.customer_id
  order_items oi JOIN orders o ON o.id = oi.order_id
  order_items oi JOIN products p ON p.id = oi.product_id
`;