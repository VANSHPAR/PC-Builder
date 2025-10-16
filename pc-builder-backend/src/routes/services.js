import { Router } from 'express';
import { Service, ServiceBooking, User } from '../models/index.js';

const router = Router();

// GET /api/services
router.get('/', async (_req, res) => {
  try {
    const services = await Service.findAll({ order: [['createdAt', 'ASC']] });
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/services/book { userId, serviceId, scheduled_date, device_details }
router.post('/book', async (req, res) => {
  try {
    const { userId, serviceId, scheduled_date, device_details } = req.body;
    const user = await User.findByPk(userId);
    const service = await Service.findByPk(serviceId);
    if (!user || !service) return res.status(404).json({ error: 'User or Service not found' });

    const booking = await ServiceBooking.create({ user_id: userId, service_id: serviceId, scheduled_date, device_details, status: 'pending', total_cost: service.base_price });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/services/bookings/:userId
router.get('/bookings/:userId', async (req, res) => {
  try {
    const bookings = await ServiceBooking.findAll({ where: { user_id: req.params.userId }, include: [Service], order: [['createdAt', 'DESC']] });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
