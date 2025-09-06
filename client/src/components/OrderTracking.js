import React, { useState } from 'react';
import './OrderTracking.css';

const OrderTracking = () => {
    const [orderNumber, setOrderNumber] = useState('');
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!orderNumber.trim()) {
            setError('Please enter order number');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/orders/${orderNumber}`);
            const data = await response.json();

            if (data.success) {
                setOrderData(data.data);
            } else {
                setError(data.message || 'Order not found');
                setOrderData(null);
            }
        } catch (error) {
            console.error('Error fetching order:', error);
            setError('Error fetching order details');
            setOrderData(null);
        } finally {
            setLoading(false);
        }
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

    const getStatusText = (status) => {
        const texts = {
            'pending': 'Menunggu Konfirmasi',
            'confirmed': 'Dikonfirmasi',
            'processing': 'Sedang Diproses',
            'shipped': 'Dikirim',
            'delivered': 'Diterima',
            'cancelled': 'Dibatalkan'
        };
        return texts[status] || status;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="order-tracking">
            <h2>Lacak Pesanan</h2>
            
            <div className="search-section">
                <div className="search-input">
                    <input
                        type="text"
                        placeholder="Masukkan nomor pesanan (contoh: ORD-1234567890-ABC12)"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button onClick={handleSearch} disabled={loading}>
                        {loading ? 'Mencari...' : 'Lacak'}
                    </button>
                </div>
                
                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                    </div>
                )}
            </div>

            {orderData && (
                <div className="order-result">
                    <div className="order-header">
                        <h3>Pesanan #{orderData.order.order_number}</h3>
                        <div 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(orderData.order.status) }}
                        >
                            {getStatusText(orderData.order.status)}
                        </div>
                    </div>

                    <div className="order-info">
                        <div className="info-section">
                            <h4>Informasi Pemesan</h4>
                            <p><strong>Nama:</strong> {orderData.order.nama_pemesan}</p>
                            <p><strong>Kontak:</strong> {orderData.order.kontak_pemesan}</p>
                            <p><strong>Email:</strong> {orderData.order.email}</p>
                            <p><strong>Tanggal Pesan:</strong> {formatDate(orderData.order.created_at)}</p>
                        </div>

                        <div className="info-section">
                            <h4>Alamat Pengiriman</h4>
                            <p>{orderData.order.alamat_kirim}</p>
                        </div>
                    </div>

                    <div className="order-items">
                        <h4>Detail Pesanan</h4>
                        {orderData.items.map((item, index) => (
                            <div key={index} className="order-item">
                                <div className="item-info">
                                    <h5>{item.nama_produk}</h5>
                                    <p>Bahan: {item.nama_bahan}</p>
                                    <p>Jumlah: {item.qty} pcs</p>
                                    {item.nama_upgrade && <p>Marking: {item.nama_upgrade}</p>}
                                    {item.teks_logo && <p>Teks: "{item.teks_logo}"</p>}
                                    {item.nama_packaging && <p>Packaging: {item.nama_packaging}</p>}
                                    {item.nama_desain && <p>Desain: {item.nama_desain}</p>}
                                </div>
                                <div className="item-price">
                                    <p>Rp {item.subtotal.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="order-total">
                        <h3>Total: Rp {orderData.order.harga_total.toLocaleString()}</h3>
                    </div>

                    <div className="status-timeline">
                        <h4>Status Pesanan</h4>
                        <div className="timeline">
                            <div className={`timeline-item ${['pending', 'confirmed', 'processing', 'shipped', 'delivered'].includes(orderData.order.status) ? 'completed' : ''}`}>
                                <div className="timeline-dot"></div>
                                <div className="timeline-content">
                                    <h5>Pesanan Diterima</h5>
                                    <p>Pesanan Anda telah diterima dan menunggu konfirmasi</p>
                                </div>
                            </div>
                            
                            <div className={`timeline-item ${['confirmed', 'processing', 'shipped', 'delivered'].includes(orderData.order.status) ? 'completed' : ''}`}>
                                <div className="timeline-dot"></div>
                                <div className="timeline-content">
                                    <h5>Pesanan Dikonfirmasi</h5>
                                    <p>Pesanan telah dikonfirmasi dan pembayaran diverifikasi</p>
                                </div>
                            </div>
                            
                            <div className={`timeline-item ${['processing', 'shipped', 'delivered'].includes(orderData.order.status) ? 'completed' : ''}`}>
                                <div className="timeline-dot"></div>
                                <div className="timeline-content">
                                    <h5>Sedang Diproses</h5>
                                    <p>Produk sedang dalam tahap produksi</p>
                                </div>
                            </div>
                            
                            <div className={`timeline-item ${['shipped', 'delivered'].includes(orderData.order.status) ? 'completed' : ''}`}>
                                <div className="timeline-dot"></div>
                                <div className="timeline-content">
                                    <h5>Dikirim</h5>
                                    <p>Pesanan telah dikirim ke alamat tujuan</p>
                                </div>
                            </div>
                            
                            <div className={`timeline-item ${orderData.order.status === 'delivered' ? 'completed' : ''}`}>
                                <div className="timeline-dot"></div>
                                <div className="timeline-content">
                                    <h5>Diterima</h5>
                                    <p>Pesanan telah diterima customer</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderTracking;