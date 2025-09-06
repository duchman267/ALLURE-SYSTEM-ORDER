# 🛠️ TROUBLESHOOTING GUIDE - ALLURE SOUVENIR

## 🚨 PANDUAN MENGATASI MASALAH UMUM

Panduan lengkap untuk mengatasi masalah yang mungkin terjadi saat setup atau menjalankan aplikasi.

---

## 🔍 **DIAGNOSIS CEPAT**

### **Cek Status Sistem:**
```bash
# Cek Node.js
node --version
npm --version

# Cek MySQL
mysql --version

# Cek port yang digunakan
lsof -i :8080
lsof -i :3000

# Test database connection
mysql -u root -p -e "USE custom_ecommerce; SELECT COUNT(*) FROM products;"
```

---

## ❌ **MASALAH UMUM & SOLUSI**

### **1. ERROR: "EADDRINUSE: address already in use"**

**Penyebab**: Port 8080 atau 3000 sudah digunakan aplikasi lain.

**Solusi A - Kill Process:**
```bash
# Cari process yang menggunakan port
lsof -i :8080
lsof -i :3000

# Kill process (ganti 1234 dengan PID yang muncul)
kill -9 1234
```

**Solusi B - Ganti Port:**
```bash
# Edit file .env
PORT=8081

# Atau untuk frontend, edit client/package.json
"proxy": "http://localhost:8081"
```

---

### **2. ERROR: "Database connection failed"**

**Penyebab**: MySQL tidak berjalan atau konfigurasi salah.

**Diagnosis:**
```bash
# Cek MySQL service
brew services list | grep mysql  # macOS
sudo systemctl status mysql      # Linux
net start mysql                  # Windows

# Test koneksi manual
mysql -u root -p
```

**Solusi:**
```bash
# Start MySQL service
brew services start mysql        # macOS
sudo systemctl start mysql       # Linux
net start mysql                  # Windows

# Cek dan edit .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_password
DB_NAME=custom_ecommerce
```

---

### **3. ERROR: "Cannot find module"**

**Penyebab**: Dependencies tidak terinstall atau corrupt.

**Solusi:**
```bash
# Backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd client
rm -rf node_modules package-lock.json
npm install
cd ..

# Atau gunakan setup otomatis
npm run setup
```

---

### **4. ERROR: "Table doesn't exist"**

**Penyebab**: Database schema belum diimport.

**Solusi:**
```bash
# Pastikan database ada
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS custom_ecommerce;"

# Import schema
mysql -u root -p custom_ecommerce < database/allure-schema.sql

# Verifikasi
mysql -u root -p -e "USE custom_ecommerce; SHOW TABLES;"
```

---

### **5. Frontend tidak muncul / Blank page**

**Penyebab**: Frontend tidak berjalan atau proxy error.

**Diagnosis:**
```bash
# Cek frontend berjalan
curl http://localhost:3000

# Cek backend API
curl http://localhost:8080/api/health
```

**Solusi:**
```bash
# Start frontend manual
cd client
npm start

# Cek proxy di client/package.json
"proxy": "http://localhost:8080"

# Clear browser cache
# Buka Developer Tools → Application → Clear Storage
```

---

### **6. API tidak response / 500 Error**

**Penyebab**: Backend error atau database issue.

**Diagnosis:**
```bash
# Lihat error di terminal backend
# Cek log error

# Test API manual
curl http://localhost:8080/api/health
curl http://localhost:8080/api/products
```

**Solusi:**
```bash
# Restart backend
pkill -f "node server.js"
npm start

# Cek database connection
node -e "const {testConnection} = require('./config/database'); testConnection();"
```

---

### **7. Real-time pricing tidak update**

**Penyebab**: JavaScript error atau API connection issue.

**Diagnosis:**
```bash
# Buka browser Developer Tools → Console
# Lihat error JavaScript

# Test API pricing
curl -X POST http://localhost:8080/api/products/calculate-price \
  -H "Content-Type: application/json" \
  -d '{"product_id":1,"material_id":1,"qty":100}'
```

**Solusi:**
```bash
# Clear browser cache
# Restart frontend
cd client
npm start

# Cek network tab di Developer Tools
```

---

### **8. File upload tidak berfungsi**

**Penyebab**: Folder uploads tidak ada atau permission issue.

**Solusi:**
```bash
# Buat folder uploads
mkdir -p uploads
chmod 755 uploads

# Cek MAX_FILE_SIZE di .env
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

---

### **9. Styling tidak muncul / CSS broken**

**Penyebab**: CSS tidak load atau build issue.

**Solusi:**
```bash
# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows/Linux) atau Cmd+Shift+R (Mac)

# Rebuild frontend
cd client
npm run build
npm start
```

---

### **10. MySQL "Access denied" error**

**Penyebab**: Password salah atau user tidak ada.

**Solusi:**
```bash
# Reset MySQL password (macOS dengan Homebrew)
brew services stop mysql
mysqld_safe --skip-grant-tables &
mysql -u root
UPDATE mysql.user SET authentication_string=PASSWORD('newpassword') WHERE User='root';
FLUSH PRIVILEGES;
EXIT;
brew services start mysql

# Atau buat user baru
mysql -u root -p
CREATE USER 'allure'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON custom_ecommerce.* TO 'allure'@'localhost';
FLUSH PRIVILEGES;

# Update .env
DB_USER=allure
DB_PASSWORD=password123
```

---

## 🔧 **TOOLS DEBUGGING**

### **1. Validasi Setup:**
```bash
node validate-setup.js
```

### **2. Test API Lengkap:**
```bash
npm run test-enhanced
```

### **3. Cek Health Status:**
```bash
curl http://localhost:8080/api/health
```

### **4. Database Query Test:**
```bash
mysql -u root -p custom_ecommerce -e "
SELECT p.nama_produk, COUNT(pr.id) as pricing_count 
FROM products p 
LEFT JOIN pricing pr ON p.id = pr.product_id 
GROUP BY p.id, p.nama_produk;
"
```

---

## 📊 **LOG ANALYSIS**

### **Backend Logs:**
- Lihat terminal yang menjalankan `npm start`
- Error biasanya muncul dengan stack trace
- Perhatikan error database connection

### **Frontend Logs:**
- Buka Browser Developer Tools → Console
- Lihat error JavaScript atau network errors
- Cek Network tab untuk failed API calls

### **Database Logs:**
```bash
# MySQL error log location
# macOS: /usr/local/var/mysql/[hostname].err
# Linux: /var/log/mysql/error.log
# Windows: C:\ProgramData\MySQL\MySQL Server 8.0\Data\[hostname].err

tail -f /usr/local/var/mysql/*.err
```

---

## 🆘 **RESET LENGKAP**

Jika semua solusi di atas tidak berhasil:

### **1. Reset Database:**
```bash
mysql -u root -p -e "DROP DATABASE IF EXISTS custom_ecommerce;"
mysql -u root -p -e "CREATE DATABASE custom_ecommerce;"
mysql -u root -p custom_ecommerce < database/allure-schema.sql
```

### **2. Reset Dependencies:**
```bash
# Backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd client
rm -rf node_modules package-lock.json
npm install
cd ..
```

### **3. Reset Configuration:**
```bash
cp .env.example .env
# Edit .env dengan konfigurasi yang benar
```

### **4. Fresh Start:**
```bash
# Kill semua process
pkill -f "node"
pkill -f "npm"

# Start ulang
npm run start-dev
```

---

## 📞 **BANTUAN LANJUTAN**

### **Jika masih bermasalah:**

1. **Cek dokumentasi lengkap:**
   - `TUTORIAL_SETUP.md` - Setup detail
   - `README.md` - Overview
   - `FEATURES.md` - Fitur aplikasi

2. **Jalankan diagnostic:**
   ```bash
   node validate-setup.js
   npm run test-enhanced
   ```

3. **Cek GitHub Issues:**
   - https://github.com/duchman267/ALLURE-SYSTEM-ORDER/issues

4. **System Requirements:**
   - Node.js 16+
   - MySQL 8.0+
   - RAM minimum 4GB
   - Storage minimum 1GB

---

## ✅ **CHECKLIST TROUBLESHOOTING**

Sebelum meminta bantuan, pastikan sudah:

- [ ] Node.js dan MySQL terinstall dengan versi yang benar
- [ ] Database `custom_ecommerce` sudah dibuat
- [ ] Schema sudah diimport dengan `database/allure-schema.sql`
- [ ] File `.env` sudah dikonfigurasi dengan benar
- [ ] Dependencies sudah terinstall (`npm run setup`)
- [ ] Port 8080 dan 3000 tidak digunakan aplikasi lain
- [ ] Browser cache sudah di-clear
- [ ] Sudah coba restart aplikasi

**🎯 Dengan mengikuti panduan ini, 99% masalah setup dapat teratasi!**