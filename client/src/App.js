import React, { useState } from 'react';
import ProductList from './components/ProductList';
import Customization from './components/Customization';
import PackagingSelection from './components/PackagingSelection';
import Checkout from './components/Checkout';
import OrderSuccess from './components/OrderSuccess';
import OrderTracking from './components/OrderTracking';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' or 'tracking'
  const [currentStep, setCurrentStep] = useState(1);
  const [orderData, setOrderData] = useState({});

  const handleProductSelect = (productData) => {
    setOrderData(productData);
    setCurrentStep(2);
  };

  const handleCustomizationComplete = (customizationData) => {
    setOrderData(customizationData);
    setCurrentStep(3);
  };

  const handlePackagingComplete = (packagingData) => {
    setOrderData(packagingData);
    setCurrentStep(4);
  };

  const handleOrderComplete = (orderResult) => {
    setOrderData({ ...orderData, orderResult });
    setCurrentStep(5);
  };

  const handleStartOver = () => {
    setOrderData({});
    setCurrentStep(1);
    setCurrentView('home');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ProductList onProductSelect={handleProductSelect} />;
      case 2:
        return <Customization productData={orderData} onCustomizationComplete={handleCustomizationComplete} />;
      case 3:
        return <PackagingSelection orderData={orderData} onPackagingComplete={handlePackagingComplete} />;
      case 4:
        return <Checkout orderData={orderData} onOrderComplete={handleOrderComplete} />;
      case 5:
        return <OrderSuccess orderData={orderData} onStartOver={handleStartOver} />;
      default:
        return <ProductList onProductSelect={handleProductSelect} />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>Custom Product Store</h1>
          <nav className="main-nav">
            <button 
              className={`nav-btn ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentView('home')}
            >
              Pesan Produk
            </button>
            <button 
              className={`nav-btn ${currentView === 'tracking' ? 'active' : ''}`}
              onClick={() => setCurrentView('tracking')}
            >
              Lacak Pesanan
            </button>
          </nav>
        </div>
        
        {currentView === 'home' && (
          <div className="step-indicator">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1. Produk</div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2. Customization</div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3. Packaging</div>
            <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>4. Checkout</div>
            <div className={`step ${currentStep >= 5 ? 'active' : ''}`}>5. Selesai</div>
          </div>
        )}
      </header>
      
      <main className="App-main">
        {currentView === 'home' ? renderStep() : <OrderTracking />}
      </main>
    </div>
  );
}

export default App;