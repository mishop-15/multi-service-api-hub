# Multi-Service API Hub

A comprehensive API gateway simulation with authentication, multiple service endpoints, and advanced features.

## Current Features ✅
- JWT Authentication
- API Key generation
- Basic CRUD operations for Users and Products
- Express.js server setup

## Implemented Endpoints
- `POST /auth/login` - JWT login
- `POST /auth/api-key` - Generate API key (JWT required)
- `GET /api/v1/users` - List users (JWT required)
- `POST /api/v1/users` - Create user (JWT required)
- `GET /api/v1/products` - List products (public)
- `POST /api/v1/products` - Create product (API key required)

## Next Steps 🚧
- Complete missing CRUD endpoints
- Add API key management (list, revoke)
- Implement error handling and validation
- Add pagination and filtering
- Implement caching strategy
- Add circuit breaker logic

## Setup
```bash
npm install
npm start