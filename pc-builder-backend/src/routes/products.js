import { Router } from 'express';
import { Op } from 'sequelize';
import { Product } from '../models/index.js';

const router = Router();

// GET /api/products - with optional filters: q, category, brand, minPrice, maxPrice
router.get('/', async (req, res) => {
  try {
    const { q, category, brand, minPrice, maxPrice } = req.query;
    const where = {};
    if (q) where.name = { [Op.like]: `%${q}%` };
    if (category) where.category = category;
    if (brand) where.brand = brand;
    if (minPrice || maxPrice) where.price = {
      ...(minPrice ? { [Op.gte]: parseFloat(minPrice) } : {}),
      ...(maxPrice ? { [Op.lte]: parseFloat(maxPrice) } : {}),
    };

    const products = await Product.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/category/:category
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.findAll({ where: { category: req.params.category } });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products/compatibility
// Body: { parts: [{category, compatibility_tags}, ...] }
router.post('/compatibility', async (req, res) => {
  try {
    const { parts = [] } = req.body || {};
    // Simple compatibility: for CPU+Motherboard ensure socket_type matches; RAM+Motherboard ensure memory_type matches; Case+Motherboard ensure form_factor matches.
    const byCat = Object.fromEntries(parts.map(p => [p.category, p]));
    const issues = [];

    const cpu = byCat['CPU'];
    const mobo = byCat['Motherboard'];
    if (cpu && mobo) {
      const cpuSocket = cpu.compatibility_tags?.socket_type;
      const mbSocket = mobo.compatibility_tags?.socket_type;
      if (cpuSocket && mbSocket && cpuSocket !== mbSocket) issues.push('CPU and Motherboard socket mismatch');
    }

    const ram = byCat['RAM'];
    if (ram && mobo) {
      const ramType = ram.compatibility_tags?.memory_type;
      const mbMemType = mobo.compatibility_tags?.memory_type;
      if (ramType && mbMemType && ramType !== mbMemType) issues.push('RAM type incompatible with Motherboard');
    }

    const caseC = byCat['Case'];
    if (caseC && mobo) {
      const caseFF = caseC.compatibility_tags?.form_factor;
      const mbFF = mobo.compatibility_tags?.form_factor;
      if (caseFF && mbFF && caseFF !== mbFF) issues.push('Case and Motherboard form factor mismatch');
    }

    res.json({ compatible: issues.length === 0, issues });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
