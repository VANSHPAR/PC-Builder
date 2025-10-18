import { Router } from 'express';
import { User } from '../models/index.js';

const router = Router();

// GET /api/users/demo -> ensures a demo user exists and returns its id
router.get('/demo', async (_req, res) => {
  try {
    let user = await User.findOne({ where: { email: 'demo@example.com' } });
    if (!user) {
      user = await User.create({ name: 'Demo User', email: 'demo@example.com', address: '123 Demo Street' });
    }
    res.json({ id: user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;