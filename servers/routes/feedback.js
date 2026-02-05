import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../config/database.js';

const router = Router();

// ============================================
// GET ALL FEEDBACK
// ============================================

router.get('/', requireAuth, (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT * FROM feedback_logs 
      WHERE tenant_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 100
    `).all(req.user.tenantId);
    
    res.json(logs.map(log => ({ 
      id: log.id, 
      tenantId: log.tenant_id, 
      text: log.message_text, 
      feedback: log.feedback, 
      userQuery: log.user_query, 
      timestamp: log.timestamp 
    })));
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// ============================================
// SAVE FEEDBACK
// ============================================

router.post('/', requireAuth, (req, res) => {
  try {
    const { id, text, feedback, userQuery } = req.body;
    const db = getDb();
    
    db.prepare(`
      INSERT OR REPLACE INTO feedback_logs 
      (id, tenant_id, message_text, feedback, user_query, timestamp) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, req.user.tenantId, text, feedback, userQuery, Date.now());
    
    res.json({ success: true });
  } catch (error) {
    console.error('Save feedback error:', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

export default router;