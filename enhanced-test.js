// Enhanced API testing with comprehensive scenarios
const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';

class APITester {
    constructor() {
        this.testResults = [];
        this.totalTests = 0;
        this.passedTests = 0;
    }

    async runTest(testName, testFunction) {
        this.totalTests++;
        console.log(`\n🧪 ${this.totalTests}. ${testName}...`);
        
        try {
            await testFunction();
            this.passedTests++;
            console.log(`✅ PASSED: ${testName}`);
            this.testResults.push({ name: testName, status: 'PASSED' });
        } catch (error) {
            console.log(`❌ FAILED: ${testName}`);
            console.log(`   Error: ${error.message}`);
            this.testResults.push({ name: testName, status: 'FAILED', error: error.message });
        }
    }

    async testHealthCheck() {
        const response = await axios.get(`${BASE_URL}/health`);
        if (response.data.success !== true) {
            throw new Error('Health check failed');
        }
    }

    async testGetProducts() {
        const response = await axios.get(`${BASE_URL}/products`);
        if (!response.data.success || !Array.isArray(response.data.data)) {
            throw new Error('Products endpoint failed');
        }
        if (response.data.data.length === 0) {
            throw new Error('No products found');
        }
        console.log(`   Found ${response.data.data.length} products`);
    }

    async testProductDetails() {
        const products = await axios.get(`${BASE_URL}/products`);
        const firstProduct = products.data.data[0];
        
        const response = await axios.get(`${BASE_URL}/products/${firstProduct.id}/details`);
        if (!response.data.success) {
            throw new Error('Product details failed');
        }
        
        const details = response.data.data;
        if (!details.product || !details.materials || !details.upgrades) {
            throw new Error('Incomplete product details');
        }
        console.log(`   Product: ${details.product.nama_produk}`);
        console.log(`   Materials: ${details.materials.length}`);
        console.log(`   Upgrades: ${details.upgrades.length}`);
    }

    async testPriceCalculation() {
        const products = await axios.get(`${BASE_URL}/products`);
        const firstProduct = products.data.data[0];
        
        const response = await axios.post(`${BASE_URL}/products/calculate-price`, {
            product_id: firstProduct.id,
            material_id: firstProduct.materials[0].material_id,
            qty: 10
        });
        
        if (!response.data.success || !response.data.data.total_price) {
            throw new Error('Price calculation failed');
        }
        console.log(`   Price for 10 pcs: Rp ${response.data.data.total_price.toLocaleString()}`);
    }

    async testPriceCalculationWithUpgrade() {
        const products = await axios.get(`${BASE_URL}/products`);
        const firstProduct = products.data.data[0];
        
        const productDetails = await axios.get(`${BASE_URL}/products/${firstProduct.id}/details`);
        const upgrades = productDetails.data.data.upgrades;
        
        if (upgrades.length === 0) {
            console.log('   No upgrades available for this product');
            return;
        }

        const response = await axios.post(`${BASE_URL}/products/calculate-price`, {
            product_id: firstProduct.id,
            material_id: firstProduct.materials[0].material_id,
            qty: 10,
            upgrade_id: upgrades[0].id
        });
        
        if (!response.data.success) {
            throw new Error('Price calculation with upgrade failed');
        }
        console.log(`   Price with ${upgrades[0].nama_upgrade}: Rp ${response.data.data.total_price.toLocaleString()}`);
    }

    async testGetPackaging() {
        const response = await axios.get(`${BASE_URL}/packaging`);
        if (!response.data.success || !Array.isArray(response.data.data)) {
            throw new Error('Packaging endpoint failed');
        }
        console.log(`   Found ${response.data.data.length} packaging options`);
    }

    async testCreateOrder() {
        const products = await axios.get(`${BASE_URL}/products`);
        const packaging = await axios.get(`${BASE_URL}/packaging`);
        
        const firstProduct = products.data.data[0];
        const firstPackaging = packaging.data.data[0];

        const testOrder = {
            nama_pemesan: 'Test Customer Enhanced',
            kontak_pemesan: '081234567890',
            email: 'enhanced-test@example.com',
            alamat_kirim: 'Jl. Test Enhanced No. 123, Jakarta',
            items: [{
                product_id: firstProduct.id,
                material_id: firstProduct.materials[0].material_id,
                qty: 5,
                upgrade_id: null,
                packaging_id: firstPackaging?.id || null,
                teks_logo: 'Test Logo Text',
                logo_custom_url: null,
                desain_packaging_id: null,
                desain_custom_url: null
            }]
        };

        const response = await axios.post(`${BASE_URL}/orders`, testOrder);
        if (!response.data.success || !response.data.data.order_number) {
            throw new Error('Order creation failed');
        }
        
        console.log(`   Order created: ${response.data.data.order_number}`);
        console.log(`   Total: Rp ${response.data.data.total_harga.toLocaleString()}`);
        
        // Store order number for next test
        this.lastOrderNumber = response.data.data.order_number;
        this.lastOrderId = response.data.data.order_id;
    }

    async testGetOrderDetails() {
        if (!this.lastOrderNumber) {
            throw new Error('No order number from previous test');
        }

        const response = await axios.get(`${BASE_URL}/orders/${this.lastOrderNumber}`);
        if (!response.data.success) {
            throw new Error('Get order details failed');
        }
        
        const order = response.data.data.order;
        const items = response.data.data.items;
        
        console.log(`   Order: ${order.order_number}`);
        console.log(`   Customer: ${order.nama_pemesan}`);
        console.log(`   Items: ${items.length}`);
    }

    async testAdminDashboard() {
        const response = await axios.get(`${BASE_URL}/admin/dashboard`);
        if (!response.data.success) {
            throw new Error('Admin dashboard failed');
        }
        
        const data = response.data.data;
        console.log(`   Total orders: ${data.total_orders}`);
        console.log(`   Revenue: Rp ${data.revenue?.total_revenue?.toLocaleString() || '0'}`);
    }

    async testAdminOrders() {
        const response = await axios.get(`${BASE_URL}/admin/orders?limit=5`);
        if (!response.data.success) {
            throw new Error('Admin orders failed');
        }
        
        const orders = response.data.data.orders;
        console.log(`   Retrieved ${orders.length} orders`);
    }

    async testUpdateOrderStatus() {
        if (!this.lastOrderId) {
            throw new Error('No order ID from previous test');
        }

        const response = await axios.put(`${BASE_URL}/admin/orders/${this.lastOrderId}/status`, {
            status: 'confirmed'
        });
        
        if (!response.data.success) {
            throw new Error('Update order status failed');
        }
        console.log(`   Order status updated to: confirmed`);
    }

    async testAnalytics() {
        const response = await axios.get(`${BASE_URL}/analytics/sales?period=30`);
        if (!response.data.success) {
            throw new Error('Analytics failed');
        }
        
        const data = response.data.data;
        console.log(`   Product performance entries: ${data.product_performance.length}`);
        console.log(`   Material stats entries: ${data.material_stats.length}`);
    }

    async testNotifications() {
        if (!this.lastOrderId) {
            console.log('   Skipping notification test (no order ID)');
            return;
        }

        const response = await axios.post(`${BASE_URL}/notifications/order-status`, {
            order_id: this.lastOrderId,
            new_status: 'processing',
            message: 'Your order is now being processed!'
        });
        
        if (!response.data.success) {
            throw new Error('Notification failed');
        }
        console.log(`   Notification sent for order: ${response.data.data.order_number}`);
    }

    async testInvalidEndpoints() {
        try {
            await axios.get(`${BASE_URL}/products/99999/details`);
            throw new Error('Should have failed for invalid product ID');
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('   Correctly returned 404 for invalid product');
            } else {
                throw error;
            }
        }
    }

    async testPriceCalculationEdgeCases() {
        // Test with invalid quantity
        try {
            await axios.post(`${BASE_URL}/products/calculate-price`, {
                product_id: 1,
                material_id: 1,
                qty: 0
            });
            throw new Error('Should have failed for qty = 0');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('   Correctly handled qty = 0');
            } else {
                throw error;
            }
        }
    }

    async runAllTests() {
        console.log('🚀 Starting Enhanced API Testing Suite\n');
        console.log('=' .repeat(60));

        // Basic functionality tests
        await this.runTest('Health Check', () => this.testHealthCheck());
        await this.runTest('Get Products', () => this.testGetProducts());
        await this.runTest('Get Product Details', () => this.testProductDetails());
        await this.runTest('Price Calculation', () => this.testPriceCalculation());
        await this.runTest('Price Calculation with Upgrade', () => this.testPriceCalculationWithUpgrade());
        await this.runTest('Get Packaging', () => this.testGetPackaging());
        
        // Order management tests
        await this.runTest('Create Order', () => this.testCreateOrder());
        await this.runTest('Get Order Details', () => this.testGetOrderDetails());
        
        // Admin functionality tests
        await this.runTest('Admin Dashboard', () => this.testAdminDashboard());
        await this.runTest('Admin Orders List', () => this.testAdminOrders());
        await this.runTest('Update Order Status', () => this.testUpdateOrderStatus());
        
        // Analytics and notifications
        await this.runTest('Sales Analytics', () => this.testAnalytics());
        await this.runTest('Send Notification', () => this.testNotifications());
        
        // Error handling tests
        await this.runTest('Invalid Product ID', () => this.testInvalidEndpoints());
        await this.runTest('Price Calculation Edge Cases', () => this.testPriceCalculationEdgeCases());

        // Print summary
        console.log('\n' + '=' .repeat(60));
        console.log('📊 TEST SUMMARY');
        console.log('=' .repeat(60));
        console.log(`Total Tests: ${this.totalTests}`);
        console.log(`Passed: ${this.passedTests}`);
        console.log(`Failed: ${this.totalTests - this.passedTests}`);
        console.log(`Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);

        if (this.passedTests === this.totalTests) {
            console.log('\n🎉 All tests passed! API is working perfectly.');
        } else {
            console.log('\n⚠️  Some tests failed. Check the details above.');
            console.log('\nFailed tests:');
            this.testResults
                .filter(result => result.status === 'FAILED')
                .forEach(result => {
                    console.log(`  - ${result.name}: ${result.error}`);
                });
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tester = new APITester();
    tester.runAllTests().catch(error => {
        console.error('\n💥 Test suite crashed:', error.message);
        process.exit(1);
    });
}

module.exports = APITester;