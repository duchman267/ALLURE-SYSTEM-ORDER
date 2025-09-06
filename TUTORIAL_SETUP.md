# 🚀 TUTORIAL SETUP ALLURE SOUVENIR E-COMMERCE

## 📋 PANDUAN LENGKAP MENJALANKAN APLIKASI

Tutorial ini akan memandu Anda step-by-step untuk menjalankan aplikasi Allure Souvenir E-commerce setelah download dari GitHub.

---

## 📋 **PERSYARATAN SISTEM**

Sebelum memulai, pastikan komputer Anda sudah terinstall:

### **1. Node.js (Wajib)**
- **Versi**: Node.js 16 atau lebih baru
- **Download**: https://nodejs.org/
- **Cek versi**: 
  ```bash
  node --version
  npm --version
  ```

### **2. MySQL Database (Wajib)**
- **Versi**: MySQL 8.0 atau lebih baru
- **Download**: https://dev.mysql.com/downloads/mysql/
- **Alternatif**: XAMPP, MAMP, atau Docker MySQL

### **3. Git (Opsional)**
- **Download**: https://git-scm.com/
- **Untuk clone repository**

---

## 🔽 **LANGKAH 1: DOWNLOAD APLIKASI**

### **Opsi A: Clone dengan Git (Recommended)**
```bash
# Buka terminal/command prompt
git clone https://github.com/duchman267/ALLURE-SYSTEM-ORDER.git
cd ALLURE-SYSTEM-ORDER
```

### **Opsi B: Download ZIP**
1. Buka https://github.com/duchman267/ALLURE-SYSTEM-ORDER
2. Klik tombol hijau **"Code"**
3. Pilih **"Download ZIP"**
4. Extract file ZIP ke folder yang diinginkan
5. Buka terminal di folder tersebut

---

## ⚙️ **LANGKAH 2: SETUP OTOMATIS**

Jalankan script setup otomatis yang sudah disediakan:

```bash
# Jalankan setup otomatis
npm run setup
```

**Script ini akan:**
- ✅ Install semua dependencies backend
- ✅ Install semua dependencies frontend
- ✅ Membuat file .env dari template
- ✅ Membuat folder uploads
- ✅ Validasi setup

**Jika berhasil, Anda akan melihat:**
```
🎉 Setup completed successfully!

Next steps:
1. Update .env file with your database credentials
2. Create MySQL database: CREATE DATABASE custom_ecommerce;
3. Import schema: mysql -u root -p custom_ecommerce < database/allure-schema.sql
4. Start development: npm run dev
5. In another terminal: npm run client
```

---

## 🗄️ **LANGKAH 3: SETUP DATABASE**

### **3.1 Buka MySQL**
```bash
# Login ke MySQL (masukkan password jika ada)
mysql -u root -p
```

### **3.2 Buat Database**
```sql
-- Buat database baru
CREATE DATABASE custom_ecommerce;

-- Cek database berhasil dibuat
SHOW DATABASES;

-- Keluar dari MySQL
EXIT;
```

### **3.3 Import Schema & Data**
```bash
# Import schema dan sample data
mysql -u root -p custom_ecommerce < database/allure-schema.sql
```

### **3.4 Verifikasi Data**
```bash
# Cek data berhasil diimport
mysql -u root -p -e "USE custom_ecommerce; SELECT COUNT(*) as total_products FROM products;"
```

**Hasil yang diharapkan:**
```
+----------------+
| total_products |
+----------------+
|             10 |
+----------------+
```

---

## 🔧 **LANGKAH 4: KONFIGURASI ENVIRONMENT**

### **4.1 Edit File .env**
Buka file `.env` dengan text editor dan sesuaikan:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=custom_ecommerce

# Server Configuration
PORT=8080
NODE_ENV=development

# JWT Secret (for future authentication)
JWT_SECRET=your_jwt_secret_key_here

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

**⚠️ PENTING**: Ganti `your_mysql_password_here` dengan password MySQL Anda!

### **4.2 Test Koneksi Database**
```bash
# Test koneksi database
node -e "
const { testConnection } = require('./config/database');
testConnection();
"
```

**Jika berhasil:**
```
✅ Database connected successfully
```

---

## 🚀 **LANGKAH 5: MENJALANKAN APLIKASI**

### **Opsi A: Start Otomatis (Recommended)**
```bash
# Start backend dan frontend sekaligus
npm run start-dev
```

### **Opsi B: Start Manual (2 Terminal)**

**Terminal 1 - Backend:**
```bash
# Start backend server
npm start
```

**Terminal 2 - Frontend:**
```bash
# Start frontend (buka terminal baru)
npm run client
```

---

## 🌐 **LANGKAH 6: AKSES APLIKASI**

Setelah aplikasi berjalan, buka browser dan akses:

### **🎨 Allure Souvenir Interface (Utama)**
- **URL**: http://localhost:3000
- **Pilih Tab**: "Allure Souvenir"
- **Fitur**: Single-page order form dengan design elegant

### **📊 Multi-Step Interface (Alternatif)**
- **URL**: http://localhost:3000
- **Pilih Tab**: "Multi-Step Order"
- **Fitur**: Step-by-step order process

### **📋 Order Tracking**
- **URL**: http://localhost:3000
- **Pilih Tab**: "Lacak Pesanan"
- **Fitur**: Track order dengan nomor pesanan

### **🔧 API Endpoints**
- **Base URL**: http://localhost:8080/api
- **Health Check**: http://localhost:8080/api/health
- **Products**: http://localhost:8080/api/products

---

## ✅ **LANGKAH 7: VERIFIKASI SISTEM**

### **7.1 Test API**
```bash
# Test semua API endpoints
npm run test-enhanced
```

### **7.2 Test Manual**
1. **Buka**: http://localhost:3000
2. **Pilih**: Tab "Allure Souvenir"
3. **Isi**: Form kontak (nama, email, WhatsApp, alamat)
4. **Pilih**: Produk (contoh: Tumbler Stainless)
5. **Pilih**: Bahan (Stainless Steel 304)
6. **Input**: Jumlah (contoh: 100)
7. **Lihat**: Harga otomatis muncul di sidebar
8. **Pilih**: Upgrade (opsional, contoh: Laser Engraving)
9. **Lihat**: Total harga update real-time
10. **Klik**: "Kirim Pesanan"
11. **Lihat**: Halaman sukses dengan nomor pesanan

---

## 🛠️ **TROUBLESHOOTING**

### **❌ Error: "EADDRINUSE: address already in use"**
**Solusi:**
```bash
# Cari process yang menggunakan port
lsof -i :8080
lsof -i :3000

# Kill process (ganti PID dengan nomor yang muncul)
kill -9 PID_NUMBER

# Atau gunakan port lain di .env
PORT=8081
```

### **❌ Error: "Database connection failed"**
**Solusi:**
1. Pastikan MySQL service berjalan
2. Cek username/password di file `.env`
3. Pastikan database `custom_ecommerce` sudah dibuat
4. Test koneksi manual:
   ```bash
   mysql -u root -p custom_ecommerce -e "SELECT 1;"
   ```

### **❌ Error: "Cannot find module"**
**Solusi:**
```bash
# Hapus node_modules dan install ulang
rm -rf node_modules package-lock.json
npm install

# Untuk frontend
cd client
rm -rf node_modules package-lock.json
npm install
cd ..
```

### **❌ Frontend tidak muncul**
**Solusi:**
```bash
# Pastikan frontend dependencies terinstall
cd client
npm install
npm start
```

### **❌ API tidak response**
**Solusi:**
1. Cek backend berjalan di port 8080
2. Cek database connection
3. Lihat error di terminal backend
4. Test health check: http://localhost:8080/api/health

---

## 📱 **PENGGUNAAN APLIKASI**

### **🎨 Allure Souvenir Interface**

**Fitur Utama:**
- ✅ **Single Page**: Semua dalam satu halaman
- ✅ **Real-time Pricing**: Harga update otomatis
- ✅ **Mobile Responsive**: Perfect di smartphone
- ✅ **Elegant Design**: Earthy color palette
- ✅ **Form Validation**: Error handling yang jelas

**Flow Penggunaan:**
1. **Isi Data Kontak**: Nama, email, WhatsApp, alamat
2. **Pilih Produk**: 10 produk Allure Souvenir tersedia
3. **Pilih Bahan**: Material premium untuk setiap produk
4. **Input Jumlah**: Minimum 50 pcs, harga otomatis adjust
5. **Pilih Upgrade**: 8 layanan tambahan (Laser, Emboss, dll)
6. **Lihat Summary**: Sticky sidebar dengan breakdown harga
7. **Submit Order**: Form validation dan konfirmasi

### **📊 Admin Features**

**Akses Admin:**
- Tab "Multi-Step Order" → Complete order flow
- Dashboard dengan statistics
- Order management dengan status update
- Analytics dan reports

---

## 🔄 **MAINTENANCE**

### **Update Aplikasi**
```bash
# Pull update terbaru dari GitHub
git pull origin main

# Install dependencies baru (jika ada)
npm install
cd client && npm install && cd ..

# Restart aplikasi
npm run start-dev
```

### **Backup Database**
```bash
# Backup database
mysqldump -u root -p custom_ecommerce > backup_$(date +%Y%m%d).sql
```

### **Reset Database**
```bash
# Reset ke data awal
mysql -u root -p custom_ecommerce < database/allure-schema.sql
```

---

## 📞 **BANTUAN & SUPPORT**

### **Dokumentasi Lengkap:**
- **README.md**: Overview dan quick start
- **FEATURES.md**: 25+ fitur detail
- **DEPLOYMENT.md**: Production deployment
- **PROJECT_SUMMARY.md**: Complete project overview

### **Jika Masih Bermasalah:**
1. **Cek file log** di terminal untuk error message
2. **Baca dokumentasi** di folder project
3. **Test API** dengan `npm run test-enhanced`
4. **Validasi setup** dengan `node validate-setup.js`

---

## 🎉 **SELAMAT!**

Jika semua langkah berhasil, Anda sekarang memiliki:

✅ **Allure Souvenir E-commerce System** yang berjalan  
✅ **Database** dengan 10 produk dan pricing lengkap  
✅ **Frontend** dengan elegant single-page interface  
✅ **Backend API** dengan 25+ endpoints  
✅ **Admin Dashboard** untuk order management  
✅ **Real-time Pricing** calculation  
✅ **Mobile-responsive** design  

**Aplikasi siap digunakan untuk menerima pesanan Allure Souvenir! 🚀**

---

*Tutorial ini dibuat untuk memastikan siapa pun bisa menjalankan aplikasi dengan mudah. Jika ada pertanyaan, silakan merujuk ke dokumentasi lengkap di repository.*