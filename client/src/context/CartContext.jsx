import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { showToast } = useNotification();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('ras_wedding_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ras_wedding_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  const addToCart = (car, options = {}) => {
    if (!car || !car._id) return;
    setCartItems((prev) => {
      const exists = prev.find((item) => item.car._id === car._id);
      if (exists) {
        showToast(`${car.brand} ${car.name} is already in your Wedding Fleet.`, 'info');
        return prev;
      }
      showToast(`Added ${car.brand} ${car.name} to Wedding Fleet! 🚗`, 'success');
      return [
        ...prev,
        {
          car,
          driverRequired: options.driverRequired !== undefined ? options.driverRequired : true,
          decorationPackageId: options.decorationPackageId || 'none',
          decorationPackageName: options.decorationPackageName || 'Standard Car',
          customTotal: options.customTotal || (car.pricing?.perDay || car.pricing?.basePrice || 5000),
          notes: options.notes || '',
        },
      ];
    });
  };

  const removeFromCart = (carId) => {
    setCartItems((prev) => prev.filter((item) => item.car._id !== carId));
    showToast('Vehicle removed from Wedding Fleet.', 'info');
  };

  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem('ras_wedding_cart');
    } catch (e) {}
  };

  const isCarInCart = (carId) => {
    return cartItems.some((item) => item.car._id === carId);
  };

  const cartCount = cartItems.length;

  const totalAmount = cartItems.reduce((sum, item) => {
    const base = item.car.pricing?.perDay || item.car.pricing?.basePrice || 5000;
    return sum + (item.customTotal || base);
  }, 0);

  const totalAdvance = cartItems.reduce((sum, item) => {
    const base = item.car.pricing?.perDay || item.car.pricing?.basePrice || 5000;
    const price = item.customTotal || base;
    const advType = item.car.advancePayment?.type || 'percentage';
    const advVal = item.car.advancePayment?.value || 20;
    const adv = advType === 'percentage' ? Math.round((price * advVal) / 100) : advVal;
    return sum + adv;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        isCarInCart,
        cartCount,
        totalAmount,
        totalAdvance,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
