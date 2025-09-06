import React, { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import './PackagingSelection.css';

const PackagingSelection = ({ orderData, onPackagingComplete }) => {
    const [packagingOptions, setPackagingOptions] = useState([]);
    const [selectedPackaging, setSelectedPackaging] = useState(null);
    const [selectedDesign, setSelectedDesign] = useState(null);
    const [customDesignFile, setCustomDesignFile] = useState(null);
    const [totalPrice, setTotalPrice] = useState(orderData.total_price);

    useEffect(() => {
        fetchPackaging();
    }, []);

    useEffect(() => {
        calculateTotalPrice();
    }, [selectedPackaging]);

    const fetchPackaging = async () => {
        try {
            const response = await fetch('/api/packaging');
            const data = await response.json();
            if (data.success) {
                setPackagingOptions(data.data);
            }
        } catch (error) {
            console.error('Error fetching packaging:', error);
        }
    };

    const calculateTotalPrice = async () => {
        if (!selectedPackaging) {
            setTotalPrice(orderData.total_price);
            return;
        }

        try {
            const response = await fetch('/api/products/calculate-price', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: orderData.product.id,
                    material_id: orderData.material_id,
                    qty: orderData.quantity,
                    upgrade_id: orderData.upgrade_id,
                    packaging_id: selectedPackaging
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

    const handlePackagingChange = (packagingId) => {
        setSelectedPackaging(packagingId);
        setSelectedDesign(null);
        setCustomDesignFile(null);
    };

    const handleDesignChange = (designId) => {
        setSelectedDesign(designId);
        setCustomDesignFile(null);
    };

    const handleCustomDesignUploadComplete = (uploadData) => {
        if (uploadData) {
            setCustomDesignFile({
                name: uploadData.originalname,
                url: uploadData.url,
                filename: uploadData.filename
            });
            setSelectedDesign(null);
        } else {
            setCustomDesignFile(null);
        }
    };

    const handleContinue = () => {
        const packagingData = {
            ...orderData,
            packaging_id: selectedPackaging,
            design_id: selectedDesign,
            custom_design_file: customDesignFile,
            final_total_price: totalPrice
        };
        
        onPackagingComplete(packagingData);
    };

    const selectedPackagingData = packagingOptions.find(p => p.id === selectedPackaging);

    return (
        <div className="packaging-selection">
            <h2>Pilihan Packaging</h2>
            
            <div className="order-summary">
                <h3>Ringkasan Pesanan:</h3>
                <p>{orderData.product.nama_produk} - {orderData.quantity} pcs</p>
                <p>Harga sebelum packaging: Rp {orderData.total_price.toLocaleString()}</p>
            </div>

            <div className="packaging-options">
                <h3>Pilih Packaging:</h3>
                {packagingOptions.map(packaging => (
                    <div key={packaging.id} className="packaging-option">
                        <label>
                            <input
                                type="radio"
                                name="packaging"
                                value={packaging.id}
                                checked={selectedPackaging === packaging.id}
                                onChange={() => handlePackagingChange(packaging.id)}
                            />
                            <div className="packaging-info">
                                <img src={packaging.gambar_url} alt={packaging.nama_packaging} />
                                <div>
                                    <h4>{packaging.nama_packaging}</h4>
                                    <p>{packaging.deskripsi}</p>
                                    <p className="price">+Rp {packaging.harga_packaging.toLocaleString()}</p>
                                </div>
                            </div>
                        </label>
                    </div>
                ))}
            </div>

            {selectedPackagingData && (
                <div className="design-selection">
                    <h3>Pilih Desain untuk {selectedPackagingData.nama_packaging}:</h3>
                    
                    <div className="design-options">
                        {selectedPackagingData.designs.map(design => (
                            <div key={design.design_id} className="design-option">
                                <label>
                                    <input
                                        type="radio"
                                        name="design"
                                        value={design.design_id}
                                        checked={selectedDesign === design.design_id}
                                        onChange={() => handleDesignChange(design.design_id)}
                                    />
                                    <div className="design-preview">
                                        <img src={design.preview_url} alt={design.nama_desain} />
                                        <p>{design.nama_desain}</p>
                                    </div>
                                </label>
                            </div>
                        ))}
                    </div>

                    <div className="custom-design">
                        <h4>Atau Upload Desain Custom:</h4>
                        <FileUpload
                            type="design"
                            accept="image/jpeg,image/png,application/pdf"
                            maxSize={5}
                            onUploadComplete={handleCustomDesignUploadComplete}
                        />
                    </div>
                </div>
            )}

            <div className="price-update">
                <h3>Total Harga: Rp {totalPrice.toLocaleString()}</h3>
                {selectedPackagingData && (
                    <p>Termasuk packaging: Rp {selectedPackagingData.harga_packaging.toLocaleString()}</p>
                )}
            </div>

            <div className="navigation-buttons">
                <button 
                    className="continue-btn" 
                    onClick={handleContinue}
                    disabled={!selectedPackaging || (!selectedDesign && !customDesignFile)}
                >
                    Lanjut ke Checkout
                </button>
            </div>
        </div>
    );
};

export default PackagingSelection;