import React, { createContext, useState, useEffect, useContext } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const local = localStorage.getItem('rental_cart');
      return local ? JSON.parse(local) : [];
    } catch (e) {
      return [];
    }
  });

  const [savedItems, setSavedItems] = useState(() => {
    try {
      const local = localStorage.getItem('rental_saved_for_later');
      return local ? JSON.parse(local) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('rental_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('rental_saved_for_later', JSON.stringify(savedItems));
  }, [savedItems]);

  const addToCart = (product, config = {}, duration = { days: 1 }, quantity = 1) => {
    if (!product) return;

    const prodId = product._id || product.id || `prod_${Date.now()}`;
    const normalizedProduct = {
      ...product,
      _id: prodId,
      id: prodId,
      title: product.title || product.name || 'Rental Item',
      pricePerDay: Number(product.pricePerDay || product.price || 100),
      securityDeposit: Number(product.securityDeposit || product.deposit || 300),
      image: product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500'
    };

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          (item.product?._id === prodId || item.product?.id === prodId) &&
          JSON.stringify(item.config || {}) === JSON.stringify(config || {})
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += (quantity || 1);
        return updated;
      }

      const dailyRate = normalizedProduct.pricePerDay;
      const deposit = normalizedProduct.securityDeposit;

      return [
        ...prev,
        {
          id: `${prodId}_${Date.now()}`,
          product: normalizedProduct,
          config: config || {},
          duration: duration || { days: 1 },
          dailyRate,
          deposit,
          quantity: quantity || 1,
          addedAt: new Date().toISOString()
        }
      ];
    });
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty < 1) return removeFromCart(cartItemId);
    setCartItems((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQty } : item))
    );
  };

  const removeFromCart = (cartItemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const saveForLater = (cartItemId) => {
    const itemToSave = cartItems.find((item) => item.id === cartItemId);
    if (itemToSave) {
      removeFromCart(cartItemId);
      setSavedItems((prev) => [...prev, itemToSave]);
    }
  };

  const moveToCart = (savedItemId) => {
    const itemToMove = savedItems.find((item) => item.id === savedItemId);
    if (itemToMove) {
      setSavedItems((prev) => prev.filter((item) => item.id !== savedItemId));
      setCartItems((prev) => [...prev, itemToMove]);
    }
  };

  const removeSavedItem = (savedItemId) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== savedItemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Price calculations
  const calculateTotals = () => {
    let subtotal = 0;
    let totalDeposit = 0;

    cartItems.forEach((item) => {
      const days = item.duration?.days || 1;
      const itemConfigExtra = Object.values(item.config || {}).reduce(
        (acc, val) => acc + (val.extraPrice || 0),
        0
      );
      const itemDailyPrice = (item.dailyRate || 100) + itemConfigExtra;
      const itemRentalTotal = itemDailyPrice * days * (item.quantity || 1);

      subtotal += itemRentalTotal;
      totalDeposit += (item.deposit || 0) * (item.quantity || 1);
    });

    const tax = Math.round(subtotal * 0.18); // 18% GST
    const deliveryFee = subtotal > 0 ? 150 : 0;
    const discount = subtotal > 2000 ? 200 : 0;
    const grandTotal = subtotal + totalDeposit + tax + deliveryFee - discount;

    return {
      subtotal,
      totalDeposit,
      tax,
      deliveryFee,
      discount,
      grandTotal,
      itemCount: cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0)
    };
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        savedItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        saveForLater,
        moveToCart,
        removeSavedItem,
        clearCart,
        calculateTotals
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export default CartContext;
