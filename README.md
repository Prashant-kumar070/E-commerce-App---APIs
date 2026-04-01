# eCommerce REST API

Scalable Laravel 13 REST API for an eCommerce platform using MySQL, clean architecture-inspired layering, repository pattern, service layer, JWT authentication, RBAC, Form Requests, API Resources, and OpenAPI documentation.

## Architecture

The API is split into focused layers:

- `app/Http/Controllers/Api`: Thin controllers for request/response orchestration
- `app/Http/Requests`: Validation rules for each endpoint
- `app/Http/Resources`: Consistent API response shaping
- `app/Services`: Business logic and use-case orchestration
- `app/Repositories`: Data access contracts and Eloquent implementations
- `app/Models`: Eloquent models and relationships
- `app/Http/Middleware`: JWT auth, role guard, permission guard
- `app/Support/Jwt`: Custom JWT encoder/decoder with blacklist-based logout
- `database/migrations`: MySQL-ready schema
- `database/seeders`: Roles, permissions, and demo users
- `docs/openapi.yaml`: Swagger/OpenAPI spec

## Folder Structure

```text
app
├── Enums
├── Exceptions
├── Helpers
├── Http
│   ├── Controllers/Api
│   ├── Middleware
│   ├── Requests
│   └── Resources
├── Models
├── Repositories
│   ├── Contracts
│   └── Eloquent
├── Services
└── Support/Jwt
database
├── migrations
└── seeders
docs
└── openapi.yaml
routes
└── api.php
```

## Implemented Features

### Authentication

- Register for `admin`, `seller`, `customer`, `delivery_person`
- Login with JWT response
- Logout with token blacklist invalidation
- Authenticated profile endpoint

### Admin

- Create users for any role
- List, view, update, delete users
- View all products
- View all orders
- Assign delivery person to orders
- Update order status
- can view Profile

### Seller

- Add product with image upload to `storage/app/public/uploads/products`
- Update own products
- Delete own products
- View own products
- can view Profile

### Customer

- Browse products with optional `search` and `seller_id` filters
- Add to cart
- Update/remove cart items
- View cart
- Place order with shipping details
- View own orders
- can view Profile

### Delivery Person

- View assigned orders
- Update delivery status
- can view Profile

## Database Tables

- `roles`
- `permissions`
- `permission_role`
- `users`
- `products`
- `product_images`
- `carts`
- `cart_items`
- `orders`
- `order_items`
- `jwt_blacklists`

## Important Models & Relationships

- `User` belongs to `Role`
- `Role` belongs to many `Permission`
- `Seller` has many `Product`
- `Product` has many `ProductImage`
- `Customer` has one `Cart`
- `Cart` has many `CartItem`
- `Customer` has many `Order`
- `Order` has many `OrderItem`
- `Order` optionally belongs to `Delivery Person`

## API Base URL

`/api/v1`

## Documentation

Swagger/OpenAPI file:

- `GET /api/v1/docs/openapi`
- `GET /api/documentation`
- Local file: `docs/openapi.yaml`

You can open `/api/documentation` for the in-app Swagger UI, or import `docs/openapi.yaml` into Postman or Insomnia.

## Setup

1. Install dependencies:

```bash
composer install
```

2. Generate app key:

```bash
php artisan key:generate
```

3. Configure MySQL credentials in `.env`

4. Run migrations and seed roles, permissions, and demo users:

```bash
php artisan migrate --seed
```

5. Link public storage for product image access:

```bash
php artisan storage:link
```

6. Run the server:

```bash
php artisan serve
```

## Demo Users

Seeders create these accounts with password `password`:

- `admin@example.com`
- `seller@example.com`
- `customer@example.com`
- `delivery@example.com`

## Example Requests

### Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Seller",
  "email": "seller2@example.com",
  "role": "seller",
  "phone": "1234567890",
  "address": "Dhaka",
  "password": "Password123",
  "password_confirmation": "Password123"
}
```

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password"
}
```

Example response:

```json
{
  "success": true,
  "message": "Login completed successfully.",
  "data": {
    "user": {
      "id": 1,
      "name": "System Admin",
      "email": "admin@example.com",
      "role": "admin"
    },
    "auth": {
      "access_token": "jwt-token",
      "token_type": "Bearer",
      "expires_at": "2026-04-02T10:00:00+00:00"
    }
  },
  "meta": []
}
```

### Seller Create Product

```http
POST /api/v1/seller/products
Authorization: Bearer <token>
Content-Type: multipart/form-data

name=Wireless Mouse
description=Ergonomic bluetooth mouse
price=29.99
stock=25
is_active=1
image=<file>
```

### Customer Add To Cart

```http
POST /api/v1/customer/cart/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "product_id": 1,
  "quantity": 2
}
```

### Customer Place Order

```http
POST /api/v1/customer/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipient_name": "John Doe",
  "recipient_phone": "123456789",
  "shipping_address": "221B Baker Street",
  "shipping_city": "London",
  "shipping_state": "London",
  "shipping_postal_code": "NW16XE",
  "shipping_country": "UK",
  "notes": "Leave at door"
}
```

## Notes

- JWT is implemented in-app with HS256 signing and blacklist-based logout
- Product images use Laravel public storage
- API responses follow a uniform `success`, `message`, `data`, `meta/errors` structure
- Role checks and permission checks are enforced through middleware
