import React, { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import './Customization.css';

const Customization = ({ productData, onCustomizationComplete }) => {
    const [upgrades, setUpgrades] = useState([]);
    const [selectedUpgrade, setSelectedUpgrade] = useState(null);
    const [customText, setCustomText] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [totalPrice, setTotalPrice] = useState(productData.base_price);

    useEffect(() => {
        fetchUpgrades();
    }, []);

    useEffect(() => {
        calculateTotalPrice();
    }, [selectedUpgrade]);

    const fetchUpgrades = async () => {
        try {
            const response = await fetch(`/api/products/${productData.product.id}/details`);
            const data = await response.json();
            if (data.success) {
                setUpgrades(data.data.upgrades);
            }
        } catch (error) {
            console.error('Error fetching upgrades:', error);
        }
    };

    const calculateTotalPrice = async () => {
        try {
            const response = await fetch('/api/products/calculate-price', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: productData.product.id,
                    material_id: productData.material_id,
                    qty: productData.quantity,
                    upgrade_id: selectedUpgrade
                })
            });
            
            const data = await response.json();
            if (data.success) {
                setTotalPrice(data.data.total_price);
            }
        } catch (error) {
            console.error('Error calculating price:', error);
        }
    };

    const handleUpgradeChange = (upgradeId) => {
        setSelectedUpgrade(upgradeId === selectedUpgrade ? null : upgradeId);
    };

    const handleLogoUploadComplete = (uploadData) => {
        if (uploadData) {
            setLogoFile({
                name: uploadData.originalname,
                url: uploadData.url,
                filename: uploadData.filename
            });
        } else {
            setLogoFile(null);
        }
    };

    const handleContinue = () => {
        const customizationData = {
            ...productData,
            upgrade_id: selectedUpgrade,
            custom_text: customText,
            logo_file: logoFile,
            total_price: totalPrice
        };
        
        onCustomizationComplete(customizationData);
    };

    return (
        <div className="customization">
            <h2>Customization & Marking</h2>
            
            <div className="product-summary">
                <h3>{productData.product.nama_produk}</h3>
                <p>Jumlah: {productData.quantity} pcs</p>
                <p>Harga dasar: Rp {productData.base_price.toLocaleString()}</p>
            </div>

            <div className="marking-options">
                <h3>Pilihan Marking:</h3>
                {upgrades.map(upgrade => (
                    <div key={upgrade.id} className="upgrade-option">
                        <label>
                            <input
                                type="checkbox"
                                checked={selectedUpgrade === upgrade.id}
                                onChange={() => handleUpgradeChange(upgrade.id)}
                            />
                            <span className="upgrade-name">{upgrade.nama_upgrade}</span>
                            <span className="upgrade-price">
                                +Rp {(upgrade.harga_upgrade * productData.quantity).toLocaleString()}
                            </span>
                        </label>
                        <p className="upgrade-desc">{upgrade.deskripsi}</p>
                    </div>
                ))}
            </div>

            {(selectedUpgrade === 2 || selectedUpgrade === 3) && ( // Laser atau Sablon
                <div className="custom-input">
                    <h3>Input Customization:</h3>
                    
                    <div className="text-input">
                        <label>Teks Custom (contoh: "D dan W"):</label>
                        <input
                            type="text"
                            value={customText}
                            onChange={(e) => setCustomText(e.target.value)}
                            placeholder="Masukkan teks yang ingin di-marking"
                        />
                    </div>

                    <div className="logo-upload">
                        <label>Upload Logo Custom:</label>
                        <FileUpload
                            type="logo"
                            accept="image/jpeg,image/png"
                            maxSize={5}
                            onUploadComplete={handleLogoUploadComplete}
                        />
                    </div>
                </div>
            )}

            <div className="price-update">
                <h3>Total Harga: Rp {totalPrice.toLocaleString()}</h3>
                {selectedUpgrade && (
                    <p>Termasuk biaya marking: Rp {upgrades.find(u => u.id === selectedUpgrade)?.harga_upgrade * productData.quantity || 0}</p>
                )}
            </div>

            <div className="navigation-buttons">
                <button className="continue-btn" onClick={handleContinue}>
                    Lanjut ke Packaging
                </button>
            </div>
        </div>
    );
};

export default Customization;