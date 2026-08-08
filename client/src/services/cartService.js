// Cart service wrapper providing standardized operations for components

export const getStoredCart = () => {
  try {
    const data = localStorage.getItem('rental_cart');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveStoredCart = (items) => {
  localStorage.setItem('rental_cart', JSON.stringify(items));
};
