#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Custom Product E-commerce Setup\n');

const checks = [
    {
        name: 'Backend Files',
        files: [
            'server.js',
            'package.json',
            '.env.example',
            'config/database.js',
            'routes/products.js',
            'routes/orders.js',
            'routes/packaging.js',
            'routes/admin.js',
            'routes/upload.js',
            'routes/analytics.js',
            'routes/notifications.js'
        ]
    },
    {
        name: 'Database Files',
        files: [
            'database/schema.sql',
            'database/notifications.sql'
        ]
    },
    {
        name: 'Frontend Files',
        files: [
            'client/package.json',
            'client/src/App.js',
            'client/src/App.css',
            'client/src/components/ProductList.js',
            'client/src/components/Customization.js',
            'client/src/components/PackagingSelection.js',
            'client/src/components/Checkout.js',
            'client/src/components/OrderSuccess.js',
            'client/src/components/OrderTracking.js',
            'client/src/components/FileUpload.js',
            'client/src/components/AdminDashboard.js',
            'client/src/utils/api.js'
        ]
    },
    {
        name: 'CSS Files',
        files: [
            'client/src/components/ProductList.css',
            'client/src/components/Customization.css',
            'client/src/components/PackagingSelection.css',
            'client/src/components/Checkout.css',
            'client/src/components/OrderSuccess.css',
            'client/src/components/OrderTracking.css',
            'client/src/components/FileUpload.css',
            'client/src/components/AdminDashboard.css'
        ]
    },
    {
        name: 'Testing & Setup Files',
        files: [
            'test-api.js',
            'enhanced-test.js',
            'setup.js',
            'start-dev.js',
            'validate-setup.js'
        ]
    },
    {
        name: 'Documentation Files',
        files: [
            'README.md',
            'DEPLOYMENT.md',
            'FEATURES.md',
            'CHANGELOG.md',
            '.gitignore'
        ]
    }
];

let totalFiles = 0;
let existingFiles = 0;
let missingFiles = [];

checks.forEach(check => {
    console.log(`📁 Checking ${check.name}:`);
    
    check.files.forEach(file => {
        totalFiles++;
        const filePath = path.join(__dirname, file);
        
        if (fs.existsSync(filePath)) {
            console.log(`  ✅ ${file}`);
            existingFiles++;
        } else {
            console.log(`  ❌ ${file} - MISSING`);
            missingFiles.push(file);
        }
    });
    
    console.log('');
});

// Check package.json scripts
console.log('📋 Checking package.json scripts:');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredScripts = ['start', 'dev', 'client', 'server', 'build', 'test', 'test-enhanced', 'setup', 'start-dev'];
    
    requiredScripts.forEach(script => {
        if (packageJson.scripts && packageJson.scripts[script]) {
            console.log(`  ✅ ${script}: ${packageJson.scripts[script]}`);
        } else {
            console.log(`  ❌ ${script} - MISSING`);
            missingFiles.push(`package.json script: ${script}`);
        }
    });
} catch (error) {
    console.log('  ❌ Error reading package.json');
    missingFiles.push('package.json');
}

console.log('');

// Check client package.json
console.log('📋 Checking client package.json:');
try {
    const clientPackageJson = JSON.parse(fs.readFileSync('client/package.json', 'utf8'));
    
    if (clientPackageJson.proxy) {
        console.log(`  ✅ Proxy configured: ${clientPackageJson.proxy}`);
    } else {
        console.log('  ❌ Proxy not configured');
        missingFiles.push('client/package.json proxy configuration');
    }
    
    const requiredDeps = ['react', 'react-dom', 'react-scripts'];
    requiredDeps.forEach(dep => {
        if (clientPackageJson.dependencies && clientPackageJson.dependencies[dep]) {
            console.log(`  ✅ ${dep}: ${clientPackageJson.dependencies[dep]}`);
        } else {
            console.log(`  ❌ ${dep} - MISSING`);
            missingFiles.push(`client dependency: ${dep}`);
        }
    });
} catch (error) {
    console.log('  ❌ Error reading client/package.json');
    missingFiles.push('client/package.json');
}

console.log('');

// Summary
console.log('=' .repeat(60));
console.log('📊 VALIDATION SUMMARY');
console.log('=' .repeat(60));
console.log(`Total Files Checked: ${totalFiles}`);
console.log(`Files Found: ${existingFiles}`);
console.log(`Files Missing: ${totalFiles - existingFiles}`);
console.log(`Success Rate: ${((existingFiles / totalFiles) * 100).toFixed(1)}%`);

if (missingFiles.length === 0) {
    console.log('\n🎉 All files are present! Setup is complete.');
    console.log('\nNext steps:');
    console.log('1. Copy .env.example to .env and configure database');
    console.log('2. Create MySQL database and import schema');
    console.log('3. Run: npm run start-dev');
    console.log('4. Test API: npm run test-enhanced');
} else {
    console.log('\n⚠️  Some files are missing:');
    missingFiles.forEach(file => {
        console.log(`  - ${file}`);
    });
    console.log('\nPlease ensure all files are created before proceeding.');
}

console.log('\n🚀 Ready to launch your custom product e-commerce system!');