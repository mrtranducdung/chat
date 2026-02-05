import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../config/database.js';

const router = Router();

// ============================================
// GET TENANT INFO
// ============================================

router.get('/', requireAuth, (req, res) => {
  try {
    const tenant = db.prepare('SELECT * FROM tenants WHERE id = ?')
      .get(req.user.tenantId);
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    res.json({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      plan: tenant.plan,
      status: tenant.status,
      monthlyMessageLimit: tenant.monthly_message_limit,
      monthlyMessagesUsed: tenant.monthly_messages_used,
      storageLimitMb: tenant.storage_limit_mb,
      storageUsedMb: tenant.storage_used_mb,
      createdAt: tenant.created_at
    });
  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({ error: 'Failed to fetch tenant info' });
  }
});

export default router;