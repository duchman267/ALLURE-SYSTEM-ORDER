import React, { useState, useEffect } from 'react';
import './AllureOrderPage.css';

const AllureOrderPage = () => {
    // State management
    const [customerData, setCustomerData] = useState({
        nama_lengkap: '',
        email: '',
        whatsapp: '',
        alamat: ''
    });
    
    const [orderData, setOrderData] = useState({
        product_id: '',
        material_id: '',
        quantity: 50,
        upgrades: []
    });
    
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [availableMaterials, setAvailableMaterials] = useState([]);
    const [availableUpgrades, setAvailableUpgrades] = useState([]);
    const [pricing, setPricing] = useState({
        base_price: 0,
        upgrade_price: 0,
        total_price: 0
    });
    
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Load products on component mount
    useEffect(() => {
        fetchProducts();
    }, []);

    // Calculate pricing when order data changes
    useEffect(() => {
        if (selectedProduct && orderData.material_id && orderData.quantity) {
            calculatePricing();
        }
    }, [selectedProduct, orderData.material_id, orderData.quantity, orderData.upgrades]);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleProductChange = async (productId) => {
        if (!productId) {
            setSelectedProduct(null);
            setAvailableMaterials([]);
            setAvailableUpgrades([]);
            return;
        }

        try {
            const response = await fetch(`/api/products/${productId}/details`);
            const data = await response.json();
            if (data.success) {
                setSelectedProduct(data.data.product);
                setAvailableMaterials(data.data.materials);
                setAvailableUpgrades(data.data.upgrades);
                setOrderData(prev => ({
                    ...prev,
                    product_id: productId,
                    material_id: '',
                    upgrades: []
                }));
            }
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    };

    const calculatePricing = async () => {
        try {
            const response = await fetch('/api/products/calculate-price', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: orderData.product_id,
                    material_id: orderData.material_id,
                    qty: orderData.quantity,
                    upgrade_id: orderData.upgrades.length > 0 ? orderData.upgrades[0] : null
                })
            });
            
            const data = await response.json();
            if (data.success) {
                const breakdown = data.data.breakdown;
                setPricing({
                    base_price: breakdown.product?.subtotal || 0,
                    upgrade_price: breakdown.upgrade?.subtotal || 0,
                    total_price: data.data.total_price
                });
            }
        } catch (error) {
            console.error('Error calculating price:', error);
        }
    };

    const handleUpgradeChange = (upgradeId, isChecked) => {
        setOrderData(prev => ({
            ...prev,
            upgrades: isChecked 
                ? [...prev.upgrades, upgradeId]
                : prev.upgrades.filter(id => id !== upgradeId)
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!customerData.nama_lengkap.trim()) {
            newErrors.nama_lengkap = 'Nama lengkap wajib diisi';
        }
        
        if (!customerData.email.trim()) {
            newErrors.email = 'Email wajib diisi';
        } else if (!/\S+@\S+\.\S+/.test(customerData.email)) {
            newErrors.email = 'Format email tidak valid';
        }
        
        if (!customerData.whatsapp.trim()) {
            newErrors.whatsapp = 'Nomor WhatsApp wajib diisi';
        }
        
        if (!customerData.alamat.trim()) {
            newErrors.alamat = 'Alamat lengkap wajib diisi';
        }
        
        if (!orderData.product_id) {
            newErrors.product_id = 'Pilih produk terlebih dahulu';
        }
        
        if (!orderData.material_id) {
            newErrors.material_id = 'Pilih bahan terlebih dahulu';
        }
        
        if (orderData.quantity < 50) {
            newErrors.quantity = 'Minimum pemesanan 50 pcs';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const orderPayload = {
                nama_pemesan: customerData.nama_lengkap,
                kontak_pemesan: customerData.whatsapp,
                email: customerData.email,
                alamat_kirim: customerData.alamat,
                items: [{
                    product_id: orderData.product_id,
                    material_id: orderData.material_id,
                    qty: orderData.quantity,
                    upgrade_id: orderData.upgrades[0] || null
                }]
            };
            
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload)
            });
            
            const result = await response.json();
            
            if (result.success) {
                setShowSuccess(true);
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert('Terjadi kesalahan: ' + result.message);
            }
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('Terjadi kesalahan saat mengirim pesanan');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="allure-success-page">
                <div className="success-container">
                    <div className="success-icon">✓</div>
                    <h1>Terima Kasih, Pesanan Anda Telah Diterima!</h1>
                    <p>Detail pesanan dan instruksi selanjutnya telah dikirim ke email Anda.</p>
                    <p>Tim kami akan menghubungi Anda dalam 1x24 jam untuk konfirmasi lebih lanjut.</p>
                    <button 
                        className="new-order-btn"
                        onClick={() => {
                            setShowSuccess(false);
                            setCustomerData({ nama_lengkap: '', email: '', whatsapp: '', alamat: '' });
                            setOrderData({ product_id: '', material_id: '', quantity: 50, upgrades: [] });
                            setSelectedProduct(null);
                            setPricing({ base_price: 0, upgrade_price: 0, total_price: 0 });
                        }}
                    >
                        Buat Pesanan Baru
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="allure-order-page">
            <header className="allure-header">
                <div className="container">
                    <h1 className="brand-title">Allure Souvenir</h1>
                    <p className="brand-subtitle">Wujudkan Momen Istimewa Anda</p>
                </div>
            </header>

            <main className="order-main">
                <div className="container">
                    <div className="order-layout">
                        {/* Left Column - Form */}
                        <div className="order-form-section">
                            <form onSubmit={handleSubmit}>
                                {/* Section 1: Customer Information */}
                                <section className="form-section">
                                    <h2 className="section-title">Detail Kontak & Pengiriman</h2>
                                    
                                    <div className="form-group">
                                        <label htmlFor="nama_lengkap">Nama Lengkap</label>
                                        <input
                                            type="text"
                                            id="nama_lengkap"
                                            value={customerData.nama_lengkap}
                                            onChange={(e) => setCustomerData(prev => ({
                                                ...prev, nama_lengkap: e.target.value
                                            }))}
                                            className={errors.nama_lengkap ? 'error' : ''}
                                            placeholder="Masukkan nama lengkap Anda"
                                        />
                                        {errors.nama_lengkap && (
                                            <span className="error-message">{errors.nama_lengkap}</span>
                                        )}
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="email">Email</label>
                                            <input
                                                type="email"
                                                id="email"
                                                value={customerData.email}
                                                onChange={(e) => setCustomerData(prev => ({
                                                    ...prev, email: e.target.value
                                                }))}
                                                className={errors.email ? 'error' : ''}
                                                placeholder="nama@email.com"
                                            />
                                            {errors.email && (
                                                <span className="error-message">{errors.email}</span>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="whatsapp">No. WhatsApp</label>
                                            <input
                                                type="tel"
                                                id="whatsapp"
                                                value={customerData.whatsapp}
                                                onChange={(e) => setCustomerData(prev => ({
                                                    ...prev, whatsapp: e.target.value
                                                }))}
                                                className={errors.whatsapp ? 'error' : ''}
                                                placeholder="08xxxxxxxxxx"
                                            />
                                            {errors.whatsapp && (
                                                <span className="error-message">{errors.whatsapp}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="alamat">Alamat Lengkap</label>
                                        <textarea
                                            id="alamat"
                                            value={customerData.alamat}
                                            onChange={(e) => setCustomerData(prev => ({
                                                ...prev, alamat: e.target.value
                                            }))}
                                            className={errors.alamat ? 'error' : ''}
                                            placeholder="Alamat lengkap untuk pengiriman"
                                            rows="3"
                                        />
                                        {errors.alamat && (
                                            <span className="error-message">{errors.alamat}</span>
                                        )}
                                    </div>
                                </section>

                                {/* Section 2: Product Configuration */}
                                <section className="form-section">
                                    <h2 className="section-title">Atur Pesanan Anda</h2>
                                    
                                    <div className="form-group">
                                        <label htmlFor="product">Pilih Produk</label>
                                        <select
                                            id="product"
                                            value={orderData.product_id}
                                            onChange={(e) => handleProductChange(e.target.value)}
                                            className={errors.product_id ? 'error' : ''}
                                        >
                                            <option value="">-- Pilih Produk --</option>
                                            {products.map(product => (
                                                <option key={product.id} value={product.id}>
                                                    {product.nama_produk}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.product_id && (
                                            <span className="error-message">{errors.product_id}</span>
                                        )}
                                    </div>

                                    {/* Conditional: Material & Quantity */}
                                    {selectedProduct && (
                                        <div className="conditional-section animate-in">
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label htmlFor="material">Pilih Bahan</label>
                                                    <select
                                                        id="material"
                                                        value={orderData.material_id}
                                                        onChange={(e) => setOrderData(prev => ({
                                                            ...prev, material_id: e.target.value
                                                        }))}
                                                        className={errors.material_id ? 'error' : ''}
                                                    >
                                                        <option value="">-- Pilih Bahan --</option>
                                                        {availableMaterials.map(material => (
                                                            <option key={material.material_id} value={material.material_id}>
                                                                {material.nama_bahan}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors.material_id && (
                                                        <span className="error-message">{errors.material_id}</span>
                                                    )}
                                                </div>

                                                <div className="form-group">
                                                    <label htmlFor="quantity">Jumlah Pesanan</label>
                                                    <input
                                                        type="number"
                                                        id="quantity"
                                                        min="50"
                                                        value={orderData.quantity}
                                                        onChange={(e) => setOrderData(prev => ({
                                                            ...prev, quantity: parseInt(e.target.value) || 50
                                                        }))}
                                                        className={errors.quantity ? 'error' : ''}
                                                    />
                                                    <small className="form-hint">min. 50 pcs</small>
                                                    {errors.quantity && (
                                                        <span className="error-message">{errors.quantity}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </section>

                                {/* Section 3: Upgrades */}
                                {availableUpgrades.length > 0 && (
                                    <section className="form-section animate-in">
                                        <h2 className="section-title">Tambahkan Upgrade (Opsional)</h2>
                                        
                                        <div className="upgrade-options">
                                            {availableUpgrades.map(upgrade => (
                                                <label key={upgrade.id} className="upgrade-option">
                                                    <input
                                                        type="checkbox"
                                                        checked={orderData.upgrades.includes(upgrade.id)}
                                                        onChange={(e) => handleUpgradeChange(upgrade.id, e.target.checked)}
                                                    />
                                                    <span className="upgrade-info">
                                                        <span className="upgrade-name">{upgrade.nama_upgrade}</span>
                                                        <span className="upgrade-price">
                                                            + Rp {(upgrade.harga_upgrade * orderData.quantity).toLocaleString()}
                                                        </span>
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </form>
                        </div>

                        {/* Right Column - Price Summary (Sticky) */}
                        <div className="price-summary-section">
                            <div className="price-summary sticky">
                                <h3>Ringkasan Pesanan</h3>
                                
                                {selectedProduct && (
                                    <div className="summary-details">
                                        <div className="summary-item">
                                            <span>Produk:</span>
                                            <span>{selectedProduct.nama_produk}</span>
                                        </div>
                                        
                                        {orderData.quantity > 0 && (
                                            <div className="summary-item">
                                                <span>Jumlah:</span>
                                                <span>{orderData.quantity} pcs</span>
                                            </div>
                                        )}
                                        
                                        <div className="price-breakdown">
                                            <div className="price-item">
                                                <span>Harga Dasar:</span>
                                                <span>Rp {pricing.base_price.toLocaleString()}</span>
                                            </div>
                                            
                                            {pricing.upgrade_price > 0 && (
                                                <div className="price-item">
                                                    <span>Biaya Upgrade:</span>
                                                    <span>Rp {pricing.upgrade_price.toLocaleString()}</span>
                                                </div>
                                            )}
                                            
                                            <div className="price-divider"></div>
                                            
                                            <div className="price-total">
                                                <span>TOTAL AKHIR:</span>
                                                <span>Rp {pricing.total_price.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <button 
                                    type="submit" 
                                    className="submit-order-btn"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !selectedProduct || !orderData.material_id}
                                >
                                    {isSubmitting ? 'Mengirim Pesanan...' : 'Kirim Pesanan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AllureOrderPage;