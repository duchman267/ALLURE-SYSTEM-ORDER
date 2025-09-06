#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Custom Product E-commerce System\n');

// Check if .env exists
if (!fs.existsSync('.env')) {
    console.log('📝 Creating .env file...');
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ .env file created. Please update with your database credentials.\n');
} else {
    console.log('✅ .env file already exists.\n');
}

// Check if uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    console.log('📁 Creating uploads directory...');
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Uploads directory created.\n');
} else {
    console.log('✅ Uploads directory already exists.\n');
}

// Install backend dependencies
console.log('📦 Installing backend dependencies...');
try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Backend dependencies installed.\n');
} catch (error) {
    console.error('❌ Failed to install backend dependencies:', error.message);
    process.exit(1);
}

// Install frontend dependencies
console.log('📦 Installing frontend dependencies...');
try {
    execSync('cd client && npm install', { stdio: 'inherit' });
    console.log('✅ Frontend dependencies installed.\n');
} catch (error) {
    console.error('❌ Failed to install frontend dependencies:', error.message);
    process.exit(1);
}

console.log('🎉 Setup completed successfully!\n');
console.log('Next steps:');
console.log('1. Update .env file with your database credentials');
console.log('2. Create MySQL database: CREATE DATABASE custom_ecommerce;');
console.log('3. Import schema: mysql -u root -p custom_ecommerce < database/schema.sql');
console.log('4. Start development: npm run dev');
console.log('5. In another terminal: npm run client');
console.log('\nFor testing API: npm test');
console.log('For production build: npm run build');