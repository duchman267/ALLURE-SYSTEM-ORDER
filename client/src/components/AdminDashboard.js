import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [orders, setOrders] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchDashboardData();
        fetchOrders();
        fetchAnalytics();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('/api/admin/dashboard');
            const data = await response.json();
            if (data.success) {
                setDashboardData(data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/admin/orders?limit=10');
            const data = await response.json();
            if (data.success) {
                setOrders(data.data.orders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const response = await fetch('/api/analytics/sales?period=30');
            const data = await response.json();
            if (data.success) {
                setAnalytics(data.data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch(`/api/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();
            if (data.success) {
                // Send notification
                await fetch('/api/notifications/order-status', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        order_id: orderId,
                        new_status: newStatus
                    })
                });

                // Refresh orders
                fetchOrders();
                alert('Order status updated successfully!');
            } else {
                alert('Error updating order status: ' + data.message);
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Error updating order status');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': '#ffc107',
            'confirmed': '#17a2b8',
            'processing': '#fd7e14',
            'shipped': '#6f42c1',
            'delivered': '#28a745',
            'cancelled': '#dc3545'
        };
        return colors[status] || '#6c757d';
    };

    if (loading) {
        return <div className="admin-loading">Loading dashboard...</div>;
    }

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <div className="tab-navigation">
                    <button 
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        Orders
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                        onClick={() => setActiveTab('analytics')}
                    >
                        Analytics
                    </button>
                </div>
            </div>

            {activeTab === 'overview' && dashboardData && (
                <div className="overview-tab">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <h3>Total Orders</h3>
                            <div className="stat-number">{dashboardData.total_orders}</div>
                        </div>
                        <div className="stat-card">
                            <h3>Total Revenue</h3>
                            <div className="stat-number">
                                Rp {dashboardData.revenue?.total_revenue?.toLocaleString() || '0'}
                            </div>
                        </div>
                        <div className="stat-card">
                            <h3>Average Order</h3>
                            <div className="stat-number">
                                Rp {dashboardData.revenue?.avg_order_value?.toLocaleString() || '0'}
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-sections">
                        <div className="section">
                            <h3>Orders by Status</h3>
                            <div className="status-list">
                                {dashboardData.orders_by_status.map(item => (
                                    <div key={item.status} className="status-item">
                                        <span 
                                            className="status-dot"
                                            style={{ backgroundColor: getStatusColor(item.status) }}
                                        ></span>
                                        <span className="status-name">{item.status}</span>
                                        <span className="status-count">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="section">
                            <h3>Popular Products</h3>
                            <div className="product-list">
                                {dashboardData.popular_products.map((product, index) => (
                                    <div key={index} className="product-item">
                                        <span className="product-name">{product.nama_produk}</span>
                                        <span className="product-stats">
                                            {product.total_qty} pcs ({product.order_count} orders)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="orders-tab">
                    <h3>Recent Orders</h3>
                    <div className="orders-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Order Number</th>
                                    <th>Customer</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id}>
                                        <td>{order.order_number}</td>
                                        <td>
                                            <div>
                                                <div>{order.nama_pemesan}</div>
                                                <div className="customer-email">{order.email}</div>
                                            </div>
                                        </td>
                                        <td>Rp {order.harga_total.toLocaleString()}</td>
                                        <td>
                                            <span 
                                                className="status-badge"
                                                style={{ backgroundColor: getStatusColor(order.status) }}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>{formatDate(order.created_at)}</td>
                                        <td>
                                            <select 
                                                value={order.status}
                                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                className="status-select"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'analytics' && analytics && (
                <div className="analytics-tab">
                    <h3>Sales Analytics (Last 30 Days)</h3>
                    
                    <div className="analytics-sections">
                        <div className="section">
                            <h4>Product Performance</h4>
                            <div className="analytics-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Orders</th>
                                            <th>Quantity</th>
                                            <th>Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics.product_performance.map((product, index) => (
                                            <tr key={index}>
                                                <td>{product.nama_produk}</td>
                                                <td>{product.orders_count}</td>
                                                <td>{product.total_quantity}</td>
                                                <td>Rp {product.total_revenue.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="section">
                            <h4>Material Usage</h4>
                            <div className="material-stats">
                                {analytics.material_stats.map((material, index) => (
                                    <div key={index} className="material-item">
                                        <span className="material-name">{material.nama_bahan}</span>
                                        <span className="material-usage">
                                            {material.total_quantity} pcs ({material.orders_count} orders)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;