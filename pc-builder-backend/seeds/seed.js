import dotenv from 'dotenv';
import { sequelize } from '../src/config/database.js';
import { syncModels, Product, Service, User } from '../src/models/index.js';

dotenv.config();

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function imgUrl(category, name) {
  // Use a stable placeholder image service; text shows category/name for clarity
  const text = encodeURIComponent(`${category}: ${name}`.slice(0, 30));
  return `https://via.placeholder.com/600x400.png?text=${text}`;
}

async function seed() {
  await sequelize.authenticate();
  await syncModels();

  // Clean tables
  await Product.destroy({ where: {} });
  await Service.destroy({ where: {} });
  await User.destroy({ where: {} });

  // Demo user
  const demoUser = await User.create({ name: 'Demo User', email: 'demo@example.com', address: '123 Demo Street' });

  const products = [];

  // CPUs
  const cpuModels = [
    { name: 'Intel Core i5-12400F', brand: 'Intel', price: 180, socket: 'LGA1700' },
    { name: 'Intel Core i7-12700F', brand: 'Intel', price: 320, socket: 'LGA1700' },
    { name: 'AMD Ryzen 5 5600', brand: 'AMD', price: 160, socket: 'AM4' },
    { name: 'AMD Ryzen 7 5800X', brand: 'AMD', price: 260, socket: 'AM4' },
  ];
  for (const c of cpuModels) {
    products.push({
      name: c.name,
      category: 'CPU',
      brand: c.brand,
      price: c.price,
      stock_quantity: rand(5, 20),
      specifications: { cores: rand(6, 12), base_clock: `${rand(3, 4)}.${rand(0,9)} GHz` },
      image_url: imgUrl('CPU', c.name),
      description: `${c.brand} ${c.name}`,
      compatibility_tags: { socket_type: c.socket },
    });
  }

  // Motherboards
  const mobos = [
    { name: 'MSI PRO B660M-A', brand: 'MSI', price: 120, socket: 'LGA1700', mem: 'DDR4', form: 'mATX' },
    { name: 'ASUS TUF Gaming B660-PLUS', brand: 'ASUS', price: 170, socket: 'LGA1700', mem: 'DDR4', form: 'ATX' },
    { name: 'Gigabyte B550M DS3H', brand: 'Gigabyte', price: 100, socket: 'AM4', mem: 'DDR4', form: 'mATX' },
    { name: 'ASUS ROG Strix B550-F', brand: 'ASUS', price: 160, socket: 'AM4', mem: 'DDR4', form: 'ATX' },
  ];
  for (const m of mobos) {
    products.push({
      name: m.name,
      category: 'Motherboard',
      brand: m.brand,
      price: m.price,
      stock_quantity: rand(5, 20),
      specifications: { chipset: 'B-series' },
      image_url: imgUrl('Motherboard', m.name),
      description: `${m.brand} ${m.name}`,
      compatibility_tags: { socket_type: m.socket, memory_type: m.mem, form_factor: m.form },
    });
  }

  // RAM
  const rams = [8, 16, 32].flatMap((size) => [
    { name: `${size}GB DDR4 3200`, brand: 'Corsair', price: size * 3.5, mem: 'DDR4' },
    { name: `${size}GB DDR4 3600`, brand: 'G.Skill', price: size * 4, mem: 'DDR4' },
  ]);
  for (const r of rams) {
    products.push({
      name: r.name,
      category: 'RAM',
      brand: r.brand,
      price: Math.round(r.price),
      stock_quantity: rand(10, 30),
      specifications: { capacity: r.name.split('GB')[0] + 'GB' },
      image_url: imgUrl('RAM', r.name),
      description: `${r.brand} ${r.name}`,
      compatibility_tags: { memory_type: r.mem },
    });
  }

  // GPUs
  const gpus = [
    { name: 'NVIDIA GeForce RTX 4060', brand: 'NVIDIA', price: 300 },
    { name: 'NVIDIA GeForce RTX 4070', brand: 'NVIDIA', price: 520 },
    { name: 'AMD Radeon RX 6600', brand: 'AMD', price: 210 },
    { name: 'AMD Radeon RX 6700 XT', brand: 'AMD', price: 350 },
  ];
  for (const g of gpus) {
    products.push({
      name: g.name,
      category: 'GPU',
      brand: g.brand,
      price: g.price,
      stock_quantity: rand(5, 15),
      specifications: { vram: `${rand(8, 12)}GB` },
      image_url: imgUrl('GPU', g.name),
      description: `${g.brand} ${g.name}`,
      compatibility_tags: {},
    });
  }

  // Storage
  const storages = [
    { name: '1TB NVMe SSD', brand: 'Samsung', price: 80 },
    { name: '512GB NVMe SSD', brand: 'WD', price: 45 },
    { name: '2TB HDD', brand: 'Seagate', price: 50 },
    { name: '1TB SATA SSD', brand: 'Crucial', price: 60 },
  ];
  for (const s of storages) {
    products.push({
      name: s.name,
      category: 'Storage',
      brand: s.brand,
      price: s.price,
      stock_quantity: rand(20, 50),
      specifications: {},
      image_url: imgUrl('Storage', s.name),
      description: `${s.brand} ${s.name}`,
      compatibility_tags: {},
    });
  }

  // PSU
  const psus = [
    { name: '550W 80+ Bronze', brand: 'Corsair', price: 50 },
    { name: '650W 80+ Bronze', brand: 'Cooler Master', price: 60 },
    { name: '750W 80+ Gold', brand: 'Seasonic', price: 100 },
  ];
  for (const p of psus) {
    products.push({
      name: p.name,
      category: 'PSU',
      brand: p.brand,
      price: p.price,
      stock_quantity: rand(10, 25),
      specifications: { wattage: p.name.split('W')[0] + 'W' },
      image_url: imgUrl('PSU', p.name),
      description: `${p.brand} ${p.name}`,
      compatibility_tags: {},
    });
  }

  // Cases
  const cases = [
    { name: 'ATX Mid Tower', brand: 'NZXT', price: 70, form: 'ATX' },
    { name: 'mATX Mini Tower', brand: 'Cooler Master', price: 55, form: 'mATX' },
  ];
  for (const c of cases) {
    products.push({
      name: c.name,
      category: 'Case',
      brand: c.brand,
      price: c.price,
      stock_quantity: rand(10, 25),
      specifications: {},
      image_url: imgUrl('Case', c.name),
      description: `${c.brand} ${c.name}`,
      compatibility_tags: { form_factor: c.form },
    });
  }

  // Peripherals
  const peripherals = [
    { name: 'Mechanical Keyboard', brand: 'Redragon', price: 35 },
    { name: 'Gaming Mouse', brand: 'Logitech', price: 25 },
    { name: '1080p Monitor 24"', brand: 'AOC', price: 120 },
    { name: 'Headset', brand: 'HyperX', price: 40 },
  ];
  for (const p of peripherals) {
    products.push({
      name: p.name,
      category: 'Peripherals',
      brand: p.brand,
      price: p.price,
      stock_quantity: rand(15, 40),
      specifications: {},
      image_url: imgUrl('Peripherals', p.name),
      description: `${p.brand} ${p.name}`,
      compatibility_tags: {},
    });
  }

  // Ensure 50+ items by duplicating with variants
  const variants = [];
  for (let i = 0; i < 20; i++) {
    variants.push({
      name: `1TB NVMe SSD Gen4 Model ${i + 1}`,
      category: 'Storage',
      brand: 'Generic',
      price: 60 + i,
      stock_quantity: rand(10, 40),
      specifications: { gen: '4x4' },
      image_url: imgUrl('Storage', `NVMe Gen4 ${i + 1}`),
      description: 'Fast NVMe storage',
      compatibility_tags: {},
    });
  }

  const allProducts = [...products, ...variants];
  await Product.bulkCreate(allProducts);

  // Services
  const services = [
    { service_name: 'PC Assembly', description: 'Professional assembly of your PC parts', base_price: 50, category: 'assembly', estimated_time: '1-2 days' },
    { service_name: 'Repair Services', description: 'Diagnostics and repair', base_price: 30, category: 'repair', estimated_time: '2-5 days' },
    { service_name: 'Upgrades', description: 'Hardware upgrade service', base_price: 20, category: 'upgrade', estimated_time: '1-3 days' },
    { service_name: 'Maintenance', description: 'Cleaning and thermal paste replacement', base_price: 25, category: 'maintenance', estimated_time: '1 day' },
  ];
  await Service.bulkCreate(services);

  console.log('Seed complete. Demo user id:', demoUser.id);
  await sequelize.close();
}

seed().catch((e) => {
  console.error('Seed failed', e);
  process.exit(1);
});
