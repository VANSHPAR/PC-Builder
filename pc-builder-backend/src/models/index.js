import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  brand: { type: DataTypes.STRING },
  price: { type: DataTypes.FLOAT, allowNull: false },
  stock_quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  specifications: { type: DataTypes.JSON },
  image_url: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  compatibility_tags: { type: DataTypes.JSON },
});

export const User = sequelize.define('User', {
  name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, unique: true },
  password_hash: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  address: { type: DataTypes.STRING },
});

export const CartItem = sequelize.define('CartItem', {
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
});

export const Order = sequelize.define('Order', {
  order_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  total_amount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  assembly_service: { type: DataTypes.BOOLEAN, defaultValue: false },
  assembly_charge: { type: DataTypes.FLOAT, defaultValue: 0 },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  shipping_address: { type: DataTypes.STRING },
  payment_status: { type: DataTypes.STRING, defaultValue: 'unpaid' },
});

export const OrderItem = sequelize.define('OrderItem', {
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  price_at_purchase: { type: DataTypes.FLOAT, allowNull: false },
});

export const Service = sequelize.define('Service', {
  service_name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  base_price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  category: { type: DataTypes.STRING },
  estimated_time: { type: DataTypes.STRING },
});

export const ServiceBooking = sequelize.define('ServiceBooking', {
  booking_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  scheduled_date: { type: DataTypes.DATE },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  device_details: { type: DataTypes.JSON },
  total_cost: { type: DataTypes.FLOAT, defaultValue: 0 },
});

export const AIConversation = sequelize.define('AIConversation', {
  session_id: { type: DataTypes.STRING },
  message: { type: DataTypes.TEXT },
  sender: { type: DataTypes.STRING },
  cart_snapshot: { type: DataTypes.JSON },
});

export const CompatibilityRule = sequelize.define('CompatibilityRule', {
  component_type_1: { type: DataTypes.STRING },
  component_type_2: { type: DataTypes.STRING },
  compatibility_key: { type: DataTypes.STRING },
  rule_description: { type: DataTypes.TEXT },
});

// Associations
User.hasMany(CartItem, { foreignKey: 'user_id' });
CartItem.belongsTo(User, { foreignKey: 'user_id' });
Product.hasMany(CartItem, { foreignKey: 'product_id' });
CartItem.belongsTo(Product, { foreignKey: 'product_id' });

User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });
Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

Service.hasMany(ServiceBooking, { foreignKey: 'service_id' });
ServiceBooking.belongsTo(Service, { foreignKey: 'service_id' });
User.hasMany(ServiceBooking, { foreignKey: 'user_id' });
ServiceBooking.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(AIConversation, { foreignKey: 'user_id' });
AIConversation.belongsTo(User, { foreignKey: 'user_id' });

export async function syncModels() {
  await sequelize.sync();
}
