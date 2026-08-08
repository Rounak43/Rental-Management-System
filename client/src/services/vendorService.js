import api from './api';

export const getVendorDashboard = async () => {
  const response = await api.get('/vendor/dashboard');
  return response.data;
};

export const getMyProducts = async () => {
  const response = await api.get('/products/vendor/my-products');
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const getVendorRentals = async () => {
  const response = await api.get('/rentals/vendor-rentals');
  return response.data;
};
