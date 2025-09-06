# Project Structure

## Root Directory
```
├── server.js              # Main Express server entry point
├── package.json           # Dependencies and scripts
├── .env.example          # Environment variables template
├── config/               # Configuration files
├── database/             # Database schema and migrations
├── routes/               # API route handlers
├── uploads/              # Static file uploads (created at runtime)
└── client/               # React frontend (separate build)
```

## API Architecture

### Route Organization
- **`/routes/products.js`** - Product catalog, pricing, and calculations
- **`/routes/orders.js`** - Order creation and management
- **`/routes/packaging.js`** - Packaging options and designs

### API Endpoints Pattern
- All API routes prefixed with `/api/`
- RESTful conventions: GET for retrieval, POST for creation
- Consistent response format with `success` boolean and `data` object

## Database Schema

### Core Tables
- **`products`** - Main product catalog
- **`materials`** - Available materials per product
- **`pricing`** - Quantity-based pricing tiers
- **`upgrades`** - Additional services (laser, emboss, sablon)
- **`packaging`** - Packaging options with designs
- **`orders`** - Order headers with customer info
- **`order_details`** - Individual order items

### Key Relationships
- Products → Materials (many-to-many via pricing)
- Products → Upgrades (JSON array in upgrades table)
- Packaging → Designs (one-to-many)
- Orders → Order Details (one-to-many)

## Code Conventions

### Error Handling
- Try-catch blocks in all async route handlers
- Consistent error response format
- Database transaction rollback for order creation

### Database Queries
- Use parameterized queries to prevent SQL injection
- Connection pooling for performance
- Explicit connection management for transactions