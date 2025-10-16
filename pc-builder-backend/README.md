# PC Builder Backend

Express + Sequelize (SQLite dev) backend for the AI-Powered PC Builder System.

## Prerequisites
- Node.js 18+

## Setup
1. Copy env
```
cp .env.example .env
```
2. Install deps
```
npm install
```
3. Seed database
```
npm run seed
```
4. Run server
```
npm run dev
```
Server: http://localhost:5000

Health: `GET /api/health`

## CORS
Update `CORS_ORIGIN` in `.env` to the URL that serves your frontend pages (e.g. `http://127.0.0.1:5500` for VS Code Live Server).

## API Summary
- Products
  - `GET /api/products?q=&category=&brand=&minPrice=&maxPrice`
  - `GET /api/products/:id`
  - `GET /api/products/category/:category`
  - `POST /api/products/compatibility` body: `{ parts: [{category, compatibility_tags}, ...] }`
- Cart
  - `POST /api/cart/add` body: `{ userId, productId, quantity }`
  - `GET /api/cart/:userId`
  - `PUT /api/cart/update` body: `{ userId, itemId, quantity }`
  - `DELETE /api/cart/remove/:itemId?userId=...`
  - `POST /api/cart/apply-assembly` body: `{ userId, apply }`
- Orders
  - `POST /api/orders/create` body: `{ userId, assembly_service, shipping_address }`
  - `GET /api/orders/:userId`
  - `GET /api/orders/detail/:orderId`
  - `PUT /api/orders/:orderId/status` body: `{ status, payment_status }`
- Services
  - `GET /api/services`
  - `POST /api/services/book` body: `{ userId, serviceId, scheduled_date, device_details }`
  - `GET /api/services/bookings/:userId`
- AI
  - `POST /api/ai/chat` body: `{ message, sessionId?, userId? }`
  - `POST /api/ai/build-pc` body: `{ message, sessionId?, userId? }`
  - `GET /api/ai/conversation/:sessionId`
  - `POST /api/ai/add-build-to-cart` body: `{ sessionId, userId }`

## Demo Data
- Seeds 50+ products, sample services, and one demo user.
- Demo user id is printed at the end of seeding.

## Notes
- This backend uses SQLite for easy local dev. You can switch to MySQL/PostgreSQL by updating Sequelize config and models.
