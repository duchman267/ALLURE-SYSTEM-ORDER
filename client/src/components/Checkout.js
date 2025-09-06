import React, { useState } from 'react';
import './Checkout.css';

const Checkout = ({ orderData, onOrderComplete }) => {
    const [customerData, setCustomerData] = useState({
        nama_pemesan: '',
        kontak_pemesan: '',
        email: '',
        alamat_kirim: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (field, value) => {
        setCustomerData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmitOrder = async () => {
        // Validasi form
        if (!customerData.nama_pemesan || !customerData.kontak_pemesan || 
            !customerData.email || !customerData.alamat_kirim) {
            alert('Mohon lengkapi semua data pemesan');
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare order data
            const orderPayload = {
                ...customerData,
                items: [{
                    product_id: orderData.product.id,
                    material_id: orderData.material_id,
                    qty: orderData.quantity,
                    upgrade_id: orderData.upgrade_id,
                    packaging_id: orderData.packaging_id,
                    teks_logo: orderData.custom_text,
                    logo_custom_url: orderData.logo_file ? 'uploaded_logo.jpg' : null, // In real app, upload file first
                    desain_packaging_id: orderData.design_id,
                    desain_custom_url: orderData.custom_design_file ? 'uploaded_design.jpg' : null
                }]
            };

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderPayload)
            });

            const result = await response.json();

            if (result.success) {
                onOrderComplete(result.data);
            } else {
                alert('Error creating order: ' + result.message);
            }
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('Error submitting order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="checkout">
            <h2>Checkout</h2>
            
            <div className="order-summary">
                <h3>Ringkasan Pesanan:</h3>
                <div className="summary-item">
                    <p><strong>{orderData.product.nama_produk}</strong></p>
                    <p>Jumlah: {orderData.quantity} pcs</p>
                    {orderData.upgrade_id && <p>Marking: Ya</p>}
                    {orderData.custom_text && <p>Teks: "{orderData.custom_text}"</p>}
                    {orderData.logo_file && <p>Logo custom: {orderData.logo_file.name}</p>}
                    {orderData.packaging_id && <p>Packaging: Ya</p>}
                    {orderData.custom_design_file && <p>Desain custom: {orderData.custom_design_file.name}</p>}
                </div>
                <div className="total-price">
                    <h3>Total: Rp {orderData.final_total_price.toLocaleString()}</h3>
                </div>
            </div>

            <div className="customer-form">
                <h3>Data Pemesan:</h3>
                
                <div className="form-group">
                    <label>Nama Pemesan:</label>
                    <input
                        type="text"
                        value={customerData.nama_pemesan}
                        onChange={(e) => handleInputChange('nama_pemesan', e.target.value)}
                        placeholder="Masukkan nama lengkap"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Kontak (WhatsApp/Telepon):</label>
                    <input
                        type="tel"
                        value={customerData.kontak_pemesan}
                        onChange={(e) => handleInputChange('kontak_pemesan', e.target.value)}
                        placeholder="08xxxxxxxxxx"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={customerData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="email@example.com"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Alamat Pengiriman:</label>
                    <textarea
                        value={customerData.alamat_kirim}
                        onChange={(e) => handleInputChange('alamat_kirim', e.target.value)}
                        placeholder="Alamat lengkap untuk pengiriman"
                        rows="4"
                        required
                    />
                </div>
            </div>

            <div className="checkout-actions">
                <button 
                    className="submit-order-btn"
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Memproses Pesanan...' : 'Konfirmasi Pesanan'}
                </button>
            </div>
        </div>
    );
};

export default Checkout;