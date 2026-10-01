# BookVerse

BookVerse is a production-ready MERN Stack bookstore ecommerce app with JWT authentication, role-based admin access, cart management, checkout, order history, MongoDB seed data, and a responsive Bootstrap 5 UI.

## Tech Stack

- MongoDB, Mongoose
- Express.js, Node.js
- React.js, React Router DOM
- Axios
- JWT authentication
- bcryptjs password hashing
- Multer image uploads
- Bootstrap 5

## Project Structure

```text
server/   Express API using MVC architecture
client/   React storefront and admin dashboard
docs/     API documentation
```

## Installation Guide

1. Install and start MongoDB locally.
2. Configure backend environment in `server/.env`.
3. Install and start the backend:

```bash
cd server
npm install
npm run seed
npm start
```

4. Install and start the frontend in a second terminal:

```bash
cd client
npm install
npm start
```

The API runs at `http://localhost:5000` and the React app runs at `http://localhost:3000`.

## Seed Accounts

- Admin: `admin@bookverse.com` / `Admin123!`
- User: `reader@bookverse.com` / `Reader123!`

Seed data is stored in `server/seed/seedData.json`. Run `npm run seed` inside `server/` to reset users, books, carts, and orders.

## Core Features

- Register, login, logout, JWT protected routes
- Browse books with search, category filtering, sorting, and pagination
- Book details and reviews
- Add, update, and remove cart items
- Checkout and order history
- Profile editing
- Admin dashboard, book CRUD, user role management, and order status updates

## API Documentation

See `docs/API.md`.
