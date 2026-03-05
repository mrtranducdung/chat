import express from 'express';
import { db } from '../database/db.js';

const router = express.Router();

// GET /api/sales/summary — quick stats không cần AI
router.get('/summary', (req, res) => {
  try {
    const totalRevenue = db.prepare(
      `SELECT ROUND(SUM(total_amount), 0) as value FROM orders WHERE status = 'completed'`
    ).get();

    const totalOrders = db.prepare(
      `SELECT COUNT(*) as value FROM orders WHERE status = 'completed'`
    ).get();

    const revenueByMonth = db.prepare(`
      SELECT strftime('%Y-%m', order_date) as month,
             ROUND(SUM(total_amount), 0) as revenue
      FROM orders WHERE status = 'completed'
      GROUP BY month ORDER BY month
    `).all();

    const topProducts = db.prepare(`
      SELECT p.name,
             SUM(oi.quantity) as total_sold,
             ROUND(SUM(oi.quantity * oi.unit_price), 0) as revenue
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status = 'completed'
      GROUP BY p.id ORDER BY revenue DESC LIMIT 5
    `).all();

    const revenueByRegion = db.prepare(`
      SELECT region, ROUND(SUM(total_amount), 0) as revenue
      FROM orders WHERE status = 'completed'
      GROUP BY region ORDER BY revenue DESC
    `).all();

    const revenueByStaff = db.prepare(`
      SELECT s.name, ROUND(SUM(o.total_amount), 0) as revenue
      FROM orders o JOIN staff s ON s.id = o.staff_id
      WHERE o.status = 'completed'
      GROUP BY s.id ORDER BY revenue DESC
    `).all();

    res.json({
      totalRevenue: totalRevenue.value,
      totalOrders: totalOrders.value,
      revenueByMonth,
      topProducts,
      revenueByRegion,
      revenueByStaff,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sales/health
router.get('/health', (req, res) => {
  const orderCount = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
  res.json({ status: 'ok', orderCount });
});

export default router;