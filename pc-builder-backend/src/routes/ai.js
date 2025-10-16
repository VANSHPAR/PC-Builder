import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AIConversation, CartItem, Product, User } from '../models/index.js';

const router = Router();

function extractBudget(text) {
  const m = text.match(/\b(\$|rs\.?|inr\s?)?(\d{3,6})\b/i);
  return m ? parseInt(m[2], 10) : null;
}

function extractUseCase(text) {
  if (/gaming/i.test(text)) return 'gaming';
  if (/editing|render|video|photo/i.test(text)) return 'editing';
  if (/office|browsing|study|student/i.test(text)) return 'office';
  return 'general';
}

async function suggestBuild({ budget, useCase }) {
  // Simple heuristic per category; pick mid-priced within budget windows
  const categories = ['CPU', 'GPU', 'RAM', 'Motherboard', 'Storage', 'PSU', 'Case'];
  const picks = {};
  let remaining = budget ?? 1000;

  // allocate weights per useCase
  const weights = {
    gaming: { CPU: 0.2, GPU: 0.45, RAM: 0.1, Motherboard: 0.1, Storage: 0.08, PSU: 0.05, Case: 0.02 },
    editing: { CPU: 0.35, GPU: 0.25, RAM: 0.12, Motherboard: 0.12, Storage: 0.1, PSU: 0.04, Case: 0.02 },
    office: { CPU: 0.25, GPU: 0.1, RAM: 0.15, Motherboard: 0.15, Storage: 0.15, PSU: 0.1, Case: 0.1 },
    general: { CPU: 0.25, GPU: 0.3, RAM: 0.12, Motherboard: 0.12, Storage: 0.12, PSU: 0.06, Case: 0.03 },
  }[useCase || 'general'];

  for (const cat of categories) {
    const target = remaining * (weights[cat] || 0.1);
    const products = await Product.findAll({ where: { category: cat }, order: [['price', 'ASC']] });
    if (!products.length) continue;
    // pick the most expensive under target, else the cheapest available
    let pick = products[0];
    for (const p of products) {
      if (p.price <= target) pick = p;
    }
    picks[cat] = pick;
  }

  const total = Object.values(picks).reduce((s, p) => s + (p?.price || 0), 0);
  return { picks, total };
}

// POST /api/ai/build-pc { message, sessionId?, userId? }
router.post('/build-pc', async (req, res) => {
  try {
    const { message = '', sessionId, userId } = req.body || {};
    const sid = sessionId || uuidv4();

    const budget = extractBudget(message);
    const useCase = extractUseCase(message);

    const { picks, total } = await suggestBuild({ budget: budget || 1000, useCase });

    // persist conversation
    await AIConversation.create({ session_id: sid, user_id: userId || null, message, sender: 'user', cart_snapshot: null });
    await AIConversation.create({ session_id: sid, user_id: userId || null, message: JSON.stringify({ picks, total }), sender: 'ai', cart_snapshot: picks });

    res.json({ sessionId: sid, useCase, budget: budget || 1000, picks, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/chat { message, sessionId?, userId? }
router.post('/chat', async (req, res) => {
  try {
    const { message = '', sessionId, userId } = req.body || {};
    const sid = sessionId || uuidv4();
    const response = `I can help build a PC. Tell me your budget and use case (gaming, editing, office). You said: "${message}"`;
    await AIConversation.create({ session_id: sid, user_id: userId || null, message, sender: 'user' });
    await AIConversation.create({ session_id: sid, user_id: userId || null, message: response, sender: 'ai' });
    res.json({ sessionId: sid, response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai/conversation/:sessionId
router.get('/conversation/:sessionId', async (req, res) => {
  try {
    const convo = await AIConversation.findAll({ where: { session_id: req.params.sessionId }, order: [['createdAt', 'ASC']] });
    res.json(convo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/add-build-to-cart { sessionId, userId }
router.post('/add-build-to-cart', async (req, res) => {
  try {
    const { sessionId, userId } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const lastAi = await AIConversation.findOne({ where: { session_id: sessionId, sender: 'ai' }, order: [['createdAt', 'DESC']] });
    if (!lastAi) return res.status(400).json({ error: 'No build found for session' });
    const picks = lastAi.cart_snapshot || {};
    const added = [];
    for (const cat of Object.keys(picks)) {
      const prod = picks[cat];
      if (!prod?.id) continue;
      await CartItem.create({ user_id: userId, product_id: prod.id, quantity: 1 });
      added.push(prod.id);
    }
    res.json({ added });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
