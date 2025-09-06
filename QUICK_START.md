# ⚡ QUICK START GUIDE - ALLURE SOUVENIR

## 🚀 SETUP CEPAT (5 MENIT)

Panduan singkat untuk menjalankan aplikasi Allure Souvenir dengan cepat.

---

## 📋 **PERSYARATAN**
- ✅ Node.js 16+ ([Download](https://nodejs.org/))
- ✅ MySQL 8.0+ ([Download](https://dev.mysql.com/downloads/mysql/))

---

## 🔽 **1. DOWNLOAD**
```bash
git clone https://github.com/duchman267/ALLURE-SYSTEM-ORDER.git
cd ALLURE-SYSTEM-ORDER
```

---

## ⚙️ **2. SETUP OTOMATIS**
```bash
npm run setup
```

---

## 🗄️ **3. DATABASE**
```bash
# Login MySQL
mysql -u root -p

# Buat database
CREATE DATABASE custom_ecommerce;
EXIT;

# Import data
mysql -u root -p custom_ecommerce < database/allure-schema.sql
```

---

## 🔧 **4. KONFIGURASI**
Edit file `.env`:
```env
DB_PASSWORD=your_mysql_password_here
```

---

## 🚀 **5. JALANKAN**
```bash
npm run start-dev
```

---

## 🌐 **6. AKSES**
- **Allure Souvenir**: http://localhost:3000 → Tab "Allure Souvenir"
- **API**: http://localhost:8080/api/health

---

## ✅ **7. TEST**
1. Buka http://localhost:3000
2. Pilih tab "Allure Souvenir"
3. Isi form dan pilih produk
4. Lihat harga real-time di sidebar
5. Submit pesanan

---

## 🆘 **TROUBLESHOOTING**

### **Database Error:**
```bash
# Cek MySQL berjalan
mysql -u root -p -e "SELECT 1;"
```

### **Port Error:**
```bash
# Ganti port di .env
PORT=8081
```

### **Module Error:**
```bash
# Install ulang
rm -rf node_modules
npm install
```

---

## 📚 **DOKUMENTASI LENGKAP**
- **TUTORIAL_SETUP.md**: Panduan detail step-by-step
- **README.md**: Overview lengkap
- **FEATURES.md**: 25+ fitur aplikasi

---

**🎉 SELAMAT! Aplikasi Allure Souvenir siap digunakan!**