import api from './api';

export const fetchAllUsers = async (params = {}) => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const deleteUserAccount = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

export const bulkDeleteAllCustomerVendorAccounts = async () => {
  const response = await api.delete('/users/bulk/delete-all');
  return response.data;
};

export const updateUserProfile = async (userData) => {
  const response = await api.put('/users/profile', userData);
  return response.data;
};
