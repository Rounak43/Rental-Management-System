import api from './api';

export const getVendorDashboard = async () => {
  const response = await api.get('/vendor/dashboard');
  return response.data;
};
