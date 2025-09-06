import React, { useState, useEffect } from 'react';
import './ProductList.css';

const ProductList = ({ onProductSelect }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [currentPrice, setCurrentPrice] = useState(0);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProductChange = async (productId) => {
        const product = products.find(p => p.id === parseInt(productId));
        setSelectedProduct(product);
        setSelectedMaterial(null);
        setCurrentPrice(0);
        
        if (product && product.materials.length > 0) {
            // Auto-select first material
            setSelectedMaterial(product.materials[0].material_id);
            await calculatePrice(productId, product.materials[0].material_id, quantity);
        }
    };

    const handleMaterialChange = async (materialId) => {
        setSelectedMaterial(parseInt(materialId));
        if (selectedProduct) {
            await calculatePrice(selectedProduct.id, materialId, quantity);
        }
    };

    const handleQuantityChange = async (newQty) => {
        const qty = Math.max(1, parseInt(newQty) || 1);
        setQuantity(qty);
        
        if (selectedProduct && selectedMaterial) {
            await calculatePrice(selectedProduct.id, selectedMaterial, qty);
        }
    };

    const calculatePrice = async (productId, materialId, qty) => {
        try {
            const response = await fetch('/api/products/calculate-price', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: productId,
                    material_id: materialId,
                    qty: qty
                })
            });
            
            const data = await response.json();
            if (data.success) {
                setCurrentPrice(data.data.total_price);
            }
        } catch (error) {
            console.error('Error calculating price:', error);
        }
    };

    const handleContinue = () => {
        if (selectedProduct && selectedMaterial && quantity > 0) {
            onProductSelect({
                product: selectedProduct,
                material_id: selectedMaterial,
                quantity: quantity,
                base_price: currentPrice
            });
        }
    };

    if (loading) {
        return <div className="loading">Loading products...</div>;
    }

    return (
        <div className="product-list">
            <h2>Pilih Produk & Bahan</h2>
            
            <div className="product-selection">
                <label>Produk:</label>
                <select onChange={(e) => handleProductChange(e.target.value)} value={selectedProduct?.id || ''}>
                    <option value="">-- Pilih Produk --</option>
                    {products.map(product => (
                        <option key={product.id} value={product.id}>
                            {product.nama_produk}
                        </option>
                    ))}
                </select>
            </div>

            {selectedProduct && (
                <>
                    <div className="product-info">
                        <img src={selectedProduct.gambar_url} alt={selectedProduct.nama_produk} />
                        <p>{selectedProduct.deskripsi}</p>
                        <p className="price-range">
                            Harga: Rp {selectedProduct.price_range?.min_price?.toLocaleString()} - 
                            Rp {selectedProduct.price_range?.max_price?.toLocaleString()}
                        </p>
                    </div>

                    <div className="material-selection">
                        <label>Bahan:</label>
                        <select onChange={(e) => handleMaterialChange(e.target.value)} value={selectedMaterial || ''}>
                            <option value="">-- Pilih Bahan --</option>
                            {selectedProduct.materials.map(material => (
                                <option key={material.material_id} value={material.material_id}>
                                    {material.nama_bahan}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="quantity-selection">
                        <label>Jumlah:</label>
                        <input 
                            type="number" 
                            min="1" 
                            value={quantity}
                            onChange={(e) => handleQuantityChange(e.target.value)}
                        />
                    </div>

                    {currentPrice > 0 && (
                        <div className="price-display">
                            <h3>Total Harga: Rp {currentPrice.toLocaleString()}</h3>
                            <p>Harga per pcs: Rp {(currentPrice / quantity).toLocaleString()}</p>
                        </div>
                    )}

                    <button 
                        className="continue-btn"
                        onClick={handleContinue}
                        disabled={!selectedMaterial || quantity < 1}
                    >
                        Lanjut ke Customization
                    </button>
                </>
            )}
        </div>
    );
};

export default ProductList;