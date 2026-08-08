import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const addToCart = (product, rentalDays) => {
    // Add logic skeleton
    const itemIndex = cartItems.findIndex((item) => item.product.id === product.id);
    if (itemIndex >= 0) {
      const updated = [...cartItems];
      updated[itemIndex].rentalDays = rentalDays;
      setCartItems(updated);
      localStorage.setItem('cart', JSON.stringify(updated));
    } else {
      const updated = [...cartItems, { product, rentalDays }];
      setCartItems(updated);
      localStorage.setItem('cart', JSON.stringify(updated));
    }
  };

  const removeFromCart = (productId) => {
    const updated = cartItems.filter((item) => item.product.id !== productId);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
