import { Router } from 'express';
import { CartItem, Product, User } from '../models/index.js';

const router = Router();

// POST /api/cart/add { userId, productId, quantity }
router.post('add', async (req, res) => {
  try {
    const { userId, productId, quantity = 1 } = req.body;
    if (!userId || !productId) return res.status(400).json({ error: 'userId and productId required' });

    const user = await User.findByPk(userId);
    const product = await Product.findByPk(productId);
    if (!user || !product) return res.status(404).json({ error: 'User or Product not found' });

    const existing = await CartItem.findOne({ where: { user_id: userId, product_id: productId } });
    if (existing) {
      existing.quantity += quantity;
      await existing.save();
      return res.json(existing);
    }

    const item = await CartItem.create({ user_id: userId, product_id: productId, quantity });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cart/:userId
router.get('/:userId', async (req, res) => {
  try {
    const items = await CartItem.findAll({
      where: { user_id: req.params.userId },
      include: [{ model: Product }],
      order: [['createdAt', 'DESC']],
    });

    const total = items.reduce((sum, it) => sum + it.quantity * (it.Product?.price || 0), 0);
    res.json({ items, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cart/update { userId, itemId, quantity }
router.put('/update', async (req, res) => {
  try {
    const { userId, itemId, quantity } = req.body;
    const item = await CartItem.findOne({ where: { id: itemId, user_id: userId } });
    if (!item) return res.status(404).json({ error: 'Cart item not found' });
    if (quantity <= 0) {
      await item.destroy();
      return res.json({ removed: true });
    }
    item.quantity = quantity;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cart/remove/:itemId?userId=...
router.delete('/remove/:itemId', async (req, res) => {
  try {
    const { userId } = req.query;
    const item = await CartItem.findOne({ where: { id: req.params.itemId, user_id: userId } });
    if (!item) return res.status(404).json({ error: 'Cart item not found' });
    await item.destroy();
    res.json({ removed: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cart/apply-assembly { userId, apply }
// Note: For simplicity, we just return the preference. Client should pass assembly flag when creating order.
router.post('/apply-assembly', async (req, res) => {
  try {
    const { userId, apply } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    res.json({ userId, assemblyApplied: !!apply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
