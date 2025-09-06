// Simple API testing script
const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';

async function testAPI() {
    console.log('🧪 Testing Custom Product E-commerce API\n');

    try {
        // Test 1: Health Check
        console.log('1. Testing Health Check...');
        const health = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health:', health.data.message);

        // Test 2: Get Products
        console.log('\n2. Testing Get Products...');
        const products = await axios.get(`${BASE_URL}/products`);
        console.log('✅ Products found:', products.data.data.length);
        
        if (products.data.data.length > 0) {
            const firstProduct = products.data.data[0];
            console.log(`   - First product: ${firstProduct.nama_produk}`);
            console.log(`   - Materials available: ${firstProduct.materials.length}`);
            
            // Test 3: Get Product Details
            console.log('\n3. Testing Product Details...');
            const productDetails = await axios.get(`${BASE_URL}/products/${firstProduct.id}/details`);
            console.log('✅ Product details loaded');
            console.log(`   - Upgrades available: ${productDetails.data.data.upgrades.length}`);

            // Test 4: Calculate Price
            console.log('\n4. Testing Price Calculation...');
            const priceCalc = await axios.post(`${BASE_URL}/products/calculate-price`, {
                product_id: firstProduct.id,
                material_id: firstProduct.materials[0].material_id,
                qty: 10
            });
            console.log('✅ Price calculated:', `Rp ${priceCalc.data.data.total_price.toLocaleString()}`);
        }

        // Test 5: Get Packaging
        console.log('\n5. Testing Get Packaging...');
        const packaging = await axios.get(`${BASE_URL}/packaging`);
        console.log('✅ Packaging options found:', packaging.data.data.length);

        // Test 6: Admin Dashboard
        console.log('\n6. Testing Admin Dashboard...');
        const dashboard = await axios.get(`${BASE_URL}/admin/dashboard`);
        console.log('✅ Dashboard data loaded');
        console.log(`   - Total orders: ${dashboard.data.data.total_orders}`);

        // Test 7: Create Test Order
        console.log('\n7. Testing Order Creation...');
        const testOrder = {
            nama_pemesan: 'Test Customer',
            kontak_pemesan: '081234567890',
            email: 'test@example.com',
            alamat_kirim: 'Jl. Test No. 123, Jakarta',
            items: [{
                product_id: products.data.data[0].id,
                material_id: products.data.data[0].materials[0].material_id,
                qty: 5,
                upgrade_id: null,
                packaging_id: packaging.data.data[0]?.id || null
            }]
        };

        const orderResult = await axios.post(`${BASE_URL}/orders`, testOrder);
        console.log('✅ Test order created:', orderResult.data.data.order_number);
        console.log(`   - Total: Rp ${orderResult.data.data.total_harga.toLocaleString()}`);

        // Test 8: Get Order Details
        console.log('\n8. Testing Get Order Details...');
        const orderDetails = await axios.get(`${BASE_URL}/orders/${orderResult.data.data.order_number}`);
        console.log('✅ Order details retrieved');
        console.log(`   - Items: ${orderDetails.data.data.items.length}`);

        console.log('\n🎉 All API tests passed successfully!');

    } catch (error) {
        console.error('\n❌ API Test Failed:', error.response?.data?.message || error.message);
        if (error.response?.data) {
            console.error('Response:', error.response.data);
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    testAPI();
}

module.exports = { testAPI };