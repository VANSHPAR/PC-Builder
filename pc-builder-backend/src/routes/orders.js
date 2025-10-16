import { Router } from 'express';
import { CartItem, Order, OrderItem, Product, User } from '../models/index.js';

const router = Router();

// POST /api/orders/create { userId, assembly_service, shipping_address }
router.post('/create', async (req, res) => {
  const t = await Order.sequelize.transaction();
  try {
    const { userId, assembly_service = false, shipping_address } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const cartItems = await CartItem.findAll({ where: { user_id: userId }, include: [Product], transaction: t, lock: t.LOCK.UPDATE });
    if (cartItems.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    const assembly_charge = assembly_service ? 50 : 0;
    const itemsTotal = cartItems.reduce((sum, it) => sum + it.quantity * (it.Product?.price || 0), 0);
    const total_amount = itemsTotal + assembly_charge;

    const order = await Order.create({ user_id: userId, assembly_service, assembly_charge, total_amount, shipping_address, status: 'pending', payment_status: 'unpaid' }, { transaction: t });

    for (const it of cartItems) {
      await OrderItem.create({ order_id: order.id, product_id: it.product_id, quantity: it.quantity, price_at_purchase: it.Product.price }, { transaction: t });
      // reduce stock
      it.Product.stock_quantity = Math.max(0, (it.Product.stock_quantity || 0) - it.quantity);
      await it.Product.save({ transaction: t });
      // clear cart item
      await it.destroy({ transaction: t });
    }

    await t.commit();
    res.status(201).json(order);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:userId
router.get('/:userId', async (req, res) => {
  try {
    const orders = await Order.findAll({ where: { user_id: req.params.userId }, order: [['createdAt', 'DESC']] });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/detail/:orderId
router.get('/detail/:orderId', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.orderId, { include: [{ model: OrderItem, include: [Product] }] });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:orderId/status { status, payment_status }
router.put('/:orderId/status', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const { status, payment_status } = req.body;
    if (status) order.status = status;
    if (payment_status) order.payment_status = payment_status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
