# BookVerse API Documentation

Base URL: `http://localhost:5000/api`

Authenticated requests require:

```http
Authorization: Bearer <jwt_token>
```

## Auth

### POST `/auth/register`

Creates a user account.

Body:

```json
{
  "username": "Reader One",
  "email": "reader@example.com",
  "password": "Reader123!",
  "phone": "+1-555-0110",
  "address": {
    "street": "42 Paper Street",
    "city": "Seattle",
    "state": "WA",
    "zipCode": "98101",
    "country": "USA"
  }
}
```

### POST `/auth/login`

Logs in a user.

Body:

```json
{
  "email": "reader@example.com",
  "password": "Reader123!"
}
```

### GET `/auth/profile`

Returns the authenticated user profile.

### PUT `/auth/profile`

Updates username, phone, and address for the authenticated user.

### GET `/auth/users`

Admin only. Returns all users.

### PUT `/auth/users/:id/role`

Admin only. Updates a user role.

Body:

```json
{
  "role": "admin"
}
```

## Books

### GET `/books`

Returns paginated books.

Query parameters:

- `page`: page number
- `limit`: page size
- `search`: title, author, or ISBN search
- `category`: exact category
- `sort`: `newest`, `rating`, `priceAsc`, `priceDesc`

### GET `/books/:id`

Returns one book by MongoDB id.

### POST `/books`

Admin only. Creates a book. Accepts JSON or `multipart/form-data` with an optional file field named `image`.

Required fields:

```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "category": "Technology",
  "description": "A practical guide to writing readable, maintainable software.",
  "price": 42.99,
  "image": "https://example.com/image.jpg",
  "stock": 18,
  "publisher": "Prentice Hall",
  "language": "English",
  "isbn": "9780132350884"
}
```

### PUT `/books/:id`

Admin only. Updates a book. Accepts JSON or `multipart/form-data`.

### DELETE `/books/:id`

Admin only. Deletes a book.

### POST `/books/:id/reviews`

Authenticated users can create or update their review.

Body:

```json
{
  "rating": 5,
  "comment": "Clear, practical, and worth revisiting."
}
```

## Cart

### GET `/cart`

Returns the authenticated user's cart.

### POST `/cart`

Adds a book to the cart.

Body:

```json
{
  "bookId": "66a000000000000000000001",
  "quantity": 1
}
```

### PUT `/cart/:id`

Updates a cart item quantity.

Body:

```json
{
  "quantity": 2
}
```

### DELETE `/cart/:id`

Removes a cart item.

## Orders

### POST `/orders`

Creates an order from the authenticated user's cart.

Body:

```json
{
  "shippingAddress": {
    "fullName": "Reader One",
    "phone": "+1-555-0110",
    "street": "42 Paper Street",
    "city": "Seattle",
    "state": "WA",
    "zipCode": "98101",
    "country": "USA"
  },
  "paymentMethod": "Cash on Delivery"
}
```

### GET `/orders`

Returns the authenticated user's orders. Admin users receive all orders.

### PUT `/orders/:id`

Admin only. Updates order status and payment status.

Body:

```json
{
  "orderStatus": "Shipped",
  "paymentStatus": "Paid"
}
```

Allowed order statuses: `Processing`, `Packed`, `Shipped`, `Delivered`, `Cancelled`.

Allowed payment statuses: `Pending`, `Paid`, `Failed`, `Refunded`.
