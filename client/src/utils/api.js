// API utility functions for consistent error handling and data formatting

const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:8080/api';

class APIClient {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }

    // Products
    async getProducts() {
        return this.request('/products');
    }

    async getProductDetails(productId) {
        return this.request(`/products/${productId}/details`);
    }

    async calculatePrice(priceData) {
        return this.request('/products/calculate-price', {
            method: 'POST',
            body: JSON.stringify(priceData),
        });
    }

    // Packaging
    async getPackaging() {
        return this.request('/packaging');
    }

    async getPackagingDesigns(packagingId) {
        return this.request(`/packaging/${packagingId}/designs`);
    }

    // Orders
    async createOrder(orderData) {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
    }

    async getOrder(orderNumber) {
        return this.request(`/orders/${orderNumber}`);
    }

    // File Upload
    async uploadFile(type, file, onProgress = null) {
        const formData = new FormData();
        formData.append(type, file);

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            if (onProgress) {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const progress = Math.round((event.loaded / event.total) * 100);
                        onProgress(progress);
                    }
                });
            }

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        resolve(response);
                    } else {
                        reject(new Error(response.message || 'Upload failed'));
                    }
                } else {
                    reject(new Error('Upload failed'));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Upload failed'));
            });

            xhr.open('POST', `${this.baseURL}/upload/${type}`);
            xhr.send(formData);
        });
    }

    // Admin endpoints
    async getAdminDashboard() {
        return this.request('/admin/dashboard');
    }

    async getAdminOrders(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/admin/orders${queryString ? '?' + queryString : ''}`);
    }

    async updateOrderStatus(orderId, status) {
        return this.request(`/admin/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    }

    // Analytics
    async getSalesAnalytics(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/analytics/sales${queryString ? '?' + queryString : ''}`);
    }

    async getCustomerAnalytics() {
        return this.request('/analytics/customers');
    }

    async getInventoryAnalytics() {
        return this.request('/analytics/inventory');
    }

    // Notifications
    async sendOrderNotification(notificationData) {
        return this.request('/notifications/order-status', {
            method: 'POST',
            body: JSON.stringify(notificationData),
        });
    }
}

// Create singleton instance
const apiClient = new APIClient();

// Export individual functions for easier use
export const {
    getProducts,
    getProductDetails,
    calculatePrice,
    getPackaging,
    getPackagingDesigns,
    createOrder,
    getOrder,
    uploadFile,
    getAdminDashboard,
    getAdminOrders,
    updateOrderStatus,
    getSalesAnalytics,
    getCustomerAnalytics,
    getInventoryAnalytics,
    sendOrderNotification,
} = apiClient;

export default apiClient;