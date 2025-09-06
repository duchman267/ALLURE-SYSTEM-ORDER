import React from 'react';
import './OrderSuccess.css';

const OrderSuccess = ({ orderData, onStartOver }) => {
    const { orderResult } = orderData;

    return (
        <div className="order-success">
            <div className="success-icon">
                <div className="checkmark">✓</div>
            </div>
            
            <h2>Pesanan Berhasil Dibuat!</h2>
            
            <div className="order-details">
                <h3>Detail Pesanan:</h3>
                <p><strong>Nomor Pesanan:</strong> {orderResult.order_number}</p>
                <p><strong>Total Harga:</strong> Rp {orderResult.total_harga.toLocaleString()}</p>
            </div>

            <div className="next-steps">
                <h3>Langkah Selanjutnya:</h3>
                <ul>
                    <li>Tim kami akan menghubungi Anda dalam 1x24 jam</li>
                    <li>Konfirmasi detail pesanan dan pembayaran</li>
                    <li>Proses produksi dimulai setelah pembayaran</li>
                    <li>Estimasi pengerjaan 3-7 hari kerja</li>
                </ul>
            </div>

            <div className="contact-info">
                <h3>Butuh Bantuan?</h3>
                <p>WhatsApp: +62 812-3456-7890</p>
                <p>Email: info@customstore.com</p>
            </div>

            <button className="new-order-btn" onClick={onStartOver}>
                Buat Pesanan Baru
            </button>
        </div>
    );
};

export default OrderSuccess;