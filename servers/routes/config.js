import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../config/database.js';

const router = Router();

// ============================================
// GET CHATBOT CONFIG
// ============================================

router.get('/', requireAuth, (req, res) => {
  try {
    const config = db.prepare('SELECT * FROM chatbot_configs WHERE tenant_id = ?')
      .get(req.user.tenantId);
    
    if (!config) {
      return res.status(404).json({ error: 'Config not found' });
    }
    
    res.json({
      tenantId: config.tenant_id,
      botName: config.bot_name,
      welcomeMessage: config.welcome_message,
      systemPrompt: config.system_prompt,
      primaryColor: config.primary_color,
      theme: config.theme,
      enableSound: !!config.enable_sound,
      enableFeedback: !!config.enable_feedback,
      suggestedQuestions: config.suggested_questions ? JSON.parse(config.suggested_questions) : [],
      defaultLanguage: config.default_language
    });
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

// ============================================
// UPDATE CHATBOT CONFIG
// ============================================

router.put('/', requireAuth, (req, res) => {
  try {
    const config = req.body;
    const db = getDb();
    
    db.prepare(`
      UPDATE chatbot_configs 
      SET bot_name = ?, 
          welcome_message = ?, 
          system_prompt = ?, 
          primary_color = ?, 
          theme = ?, 
          enable_sound = ?, 
          enable_feedback = ?, 
          suggested_questions = ?, 
          default_language = ?, 
          updated_at = ? 
      WHERE tenant_id = ?
    `).run(
      config.botName,
      config.welcomeMessage,
      config.systemPrompt,
      config.primaryColor,
      config.theme,
      config.enableSound ? 1 : 0,
      config.enableFeedback ? 1 : 0,
      JSON.stringify(config.suggestedQuestions || []),
      config.defaultLanguage,
      Date.now(),
      req.user.tenantId
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({ error: 'Failed to update config' });
  }
});

export default router;