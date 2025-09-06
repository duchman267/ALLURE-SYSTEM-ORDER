# Custom Product E-commerce System

Sistem e-commerce untuk produk custom dengan perhitungan harga real-time berdasarkan quantity, material, upgrade, dan packaging. Sistem ini dirancang khusus untuk bisnis yang menjual produk custom seperti tumbler, mug, notebook dengan berbagai pilihan material dan layanan marking.

## 🚀 Fitur Utama

- **Dynamic Pricing**: Perhitungan harga real-time berdasarkan tier quantity
- **Product Customization**: Support untuk logo custom, teks, dan upload desain
- **Material Options**: Pilihan material berbeda dengan struktur harga berbeda
- **Upgrade Services**: Laser engraving, emboss, dan sablon printing
- **Packaging Choices**: Berbagai pilihan packaging dengan template desain
- **Order Management**: Sistem pemesanan lengkap dengan tracking detail
- **File Upload**: Upload logo dan desain custom dengan progress indicator
- **Order Tracking**: Customer bisa lacak status pesanan real-time
- **Admin Dashboard**: Panel admin untuk manage orders dan lihat statistik
- **Responsive Design**: Mobile-friendly interface

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL dengan mysql2 driver (connection pooling)
- **File Upload**: Multer middleware
- **Environment**: dotenv untuk configuration management
- **CORS**: Enabled untuk cross-origin requests

### Frontend
- **Framework**: React (Create React App)
- **Styling**: CSS3 dengan responsive design
- **Features**: Real-time price calculation, Multi-step checkout flow
- **File Upload**: Progress indicator dan preview

## ⚡ Quick Start

### Automatic Setup (Recommended)
```bash
# Clone repository
git clone <repository-url>
cd custom-product-ecommerce

# Run automatic setup
npm run setup

# Update .env with your database credentials
# Create database and import schema
mysql -u root -p
CREATE DATABASE custom_ecommerce;
mysql -u root -p custom_ecommerce < database/schema.sql

# Start development environment (both backend & frontend)
npm run start-dev
```

### Manual Setup

#### 1. Database Setup
```bash
# Buat database MySQL
mysql -u root -p
CREATE DATABASE custom_ecommerce;

# Import schema dengan sample data
mysql -u root -p custom_ecommerce < database/schema.sql
```

#### 2. Backend Setup
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file dengan database credentials
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=custom_ecommerce
PORT=5000

# Start server
npm run dev
```

#### 3. Frontend Setup
```bash
# Masuk ke folder client
cd client

# Install dependencies
npm install

# Start React development server
npm start
```

## API Endpoints

### Products
- `GET /api/products` - List semua produk dengan material dan harga
- `GET /api/products/:id/details` - Detail produk dengan upgrade options
- `POST /api/products/calculate-price` - Hitung harga real-time

### Packaging
- `GET /api/packaging` - List packaging dengan desain tersedia
- `GET /api/packaging/:id/designs` - Desain untuk packaging tertentu

### Orders
- `POST /api/orders` - Buat pesanan baru
- `GET /api/orders/:orderNumber` - Detail pesanan

## User Flow

1. **Halaman Produk**: Customer pilih produk, material, dan quantity
2. **Customization**: Pilih marking (laser/emboss/sablon), input teks, upload logo
3. **Packaging**: Pilih packaging dan desain (template atau custom)
4. **Checkout**: Input data customer dan alamat pengiriman
5. **Success**: Konfirmasi pesanan dengan nomor order

## Database Schema

### Core Tables
- `products` - Katalog produk utama
- `materials` - Material yang tersedia per produk
- `pricing` - Tier harga berdasarkan quantity
- `upgrades` - Layanan tambahan (laser, emboss, sablon)
- `packaging` - Pilihan packaging dengan desain
- `orders` - Header pesanan dengan info customer
- `order_details` - Detail item dalam pesanan

## Development Commands

```bash
# Start backend only
npm run server

# Start frontend only
npm run client

# Start both (development)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Pricing Logic

Rumus perhitungan harga:
```
Total = (Harga Produk × Qty) + Harga Packaging + (Harga Upgrade × Qty)
```

- Harga produk ditentukan berdasarkan tier quantity di tabel `pricing`
- Upgrade (marking) dikalikan dengan quantity
- Packaging harga flat per pesanan

## File Upload

- Logo custom: JPEG, PNG (max 5MB)
- Desain packaging: JPEG, PNG, PDF (max 5MB)
- Files disimpan di folder `uploads/`

## Production Deployment

1. Build React app: `npm run build`
2. Set `NODE_ENV=production`
3. Configure database production credentials
4. Setup reverse proxy (nginx) untuk static files
5. Configure SSL certificate

## Support

Untuk bantuan teknis atau pertanyaan:
- Email: [email]
- WhatsApp: [phone_number]
#
# 🧪 Testing

```bash
# Test API endpoints
npm test

# Manual testing URLs (after starting server)
# Health check: http://localhost:5000/api/health
# Products: http://localhost:5000/api/products
# Packaging: http://localhost:5000/api/packaging
# Admin dashboard: http://localhost:5000/api/admin/dashboard
```

## 📊 User Flow

### Customer Journey
1. **Halaman Produk**: Customer pilih produk, material, dan quantity dengan real-time pricing
2. **Customization**: Pilih marking (laser/emboss/sablon), input teks, upload logo
3. **Packaging**: Pilih packaging dan desain (template atau custom upload)
4. **Checkout**: Input data customer dan alamat pengiriman
5. **Success**: Konfirmasi pesanan dengan nomor order
6. **Tracking**: Customer bisa lacak status pesanan kapan saja

### Admin Features
- Dashboard dengan statistik orders dan revenue
- Manage orders dan update status
- View detailed order information
- Popular products analytics

## 🗄 Database Schema

### Core Tables
- **`products`** - Katalog produk utama
- **`materials`** - Material yang tersedia per produk  
- **`pricing`** - Tier harga berdasarkan quantity (MinQty-MaxQty)
- **`upgrades`** - Layanan tambahan (laser, emboss, sablon)
- **`packaging`** - Pilihan packaging dengan desain
- **`packaging_designs`** - Template desain untuk setiap packaging
- **`orders`** - Header pesanan dengan info customer
- **`order_details`** - Detail item dalam pesanan

### Key Relationships
- Products → Materials (many-to-many via pricing)
- Products → Upgrades (JSON array in upgrades table)
- Packaging → Designs (one-to-many)
- Orders → Order Details (one-to-many)

## 💰 Pricing Logic

Sistem menggunakan rumus perhitungan:
```
Total = (Harga Produk × Qty) + Harga Packaging + (Harga Upgrade × Qty)
```

**Detail Perhitungan:**
- **Harga Produk**: Ditentukan berdasarkan tier quantity di tabel `pricing`
- **Upgrade (Marking)**: Dikalikan dengan quantity (per piece)
- **Packaging**: Harga flat per pesanan (tidak dikalikan quantity)

**Contoh:**
- Tumbler Stainless Steel: 10 pcs × Rp 70.000 = Rp 700.000
- Laser Engraving: 10 pcs × Rp 15.000 = Rp 150.000  
- Gift Box Packaging: 1 × Rp 15.000 = Rp 15.000
- **Total: Rp 865.000**

## 📁 File Upload

- **Logo Custom**: JPEG, PNG (max 5MB)
- **Desain Packaging**: JPEG, PNG, PDF (max 5MB)
- **Storage**: Files disimpan di folder `uploads/`
- **Features**: Progress indicator, preview, drag & drop

## 🔌 API Endpoints

### Products
- `GET /api/products` - List semua produk dengan material dan harga
- `GET /api/products/:id/details` - Detail produk dengan upgrade options
- `POST /api/products/calculate-price` - Hitung harga real-time

### Packaging  
- `GET /api/packaging` - List packaging dengan desain tersedia
- `GET /api/packaging/:id/designs` - Desain untuk packaging tertentu

### Orders
- `POST /api/orders` - Buat pesanan baru
- `GET /api/orders/:orderNumber` - Detail pesanan untuk tracking

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/orders` - List orders dengan pagination
- `GET /api/admin/orders/:id` - Detail order untuk admin
- `PUT /api/admin/orders/:id/status` - Update status order

### Upload
- `POST /api/upload/logo` - Upload logo custom
- `POST /api/upload/design` - Upload desain packaging

## 🚀 Development Commands

```bash
# Start backend only
npm run server

# Start frontend only  
npm run client

# Start both (recommended for development)
npm run start-dev

# Build for production
npm run build

# Start production server
npm start

# Run API tests
npm test

# Setup project (install deps, create folders)
npm run setup
```

## 🌐 Production Deployment

Lihat [DEPLOYMENT.md](DEPLOYMENT.md) untuk panduan lengkap deployment ke production dengan:
- Nginx configuration
- PM2 process management
- SSL setup
- Security checklist
- Performance optimization

## 📱 Responsive Design

Sistem fully responsive dan mobile-friendly:
- Mobile-first CSS approach
- Touch-friendly interface
- Optimized file upload untuk mobile
- Responsive navigation dan forms

## 🔒 Security Features

- Parameterized SQL queries (SQL injection prevention)
- File type validation untuk uploads
- File size limits
- CORS configuration
- Environment variables untuk sensitive data
- Input validation dan sanitization

## 🎯 Sample Data

Database schema sudah include sample data untuk testing:
- 3 produk (Tumbler, Mug, Notebook)
- 4 material options
- 3 upgrade services (Laser, Emboss, Sablon)
- 3 packaging options dengan multiple designs
- Pricing tiers untuk berbagai quantity ranges

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

Untuk bantuan teknis atau pertanyaan:
- Email: [email]
- WhatsApp: [phone_number]
- Documentation: [docs_url]

## 📋 Project Status

- ✅ **Core Features**: Complete and tested
- ✅ **API Endpoints**: All 20+ endpoints working
- ✅ **Database Schema**: Optimized and indexed
- ✅ **Frontend UI**: Responsive and mobile-friendly
- ✅ **Admin Dashboard**: Full order management
- ✅ **File Upload**: Progress tracking and validation
- ✅ **Order Tracking**: Real-time status updates
- ✅ **Analytics**: Sales and customer insights
- ✅ **Testing Suite**: Comprehensive API testing
- ✅ **Documentation**: Complete setup guides

## 🔄 Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed version history and updates.

## 📖 Additional Documentation

- [FEATURES.md](FEATURES.md) - Comprehensive feature documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment guide
- [CHANGELOG.md](CHANGELOG.md) - Version history and updates

---

**Built with ❤️ for custom product businesses**

*Ready for production deployment with enterprise-grade features and security.*