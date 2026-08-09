import api from './api';

export const getVendorDashboard = async () => {
  const response = await api.get('/vendor/dashboard');
  return response.data;
};

export const getVendorAnalytics = async () => {
  const response = await api.get('/vendor/analytics');
  return response.data;
};

export const getVendorProfile = async () => {
  const response = await api.get('/vendor/profile');
  return response.data;
};

export const updateVendorProfile = async (profileData) => {
  const response = await api.put('/vendor/profile', profileData);
  return response.data;
};

export const uploadVendorLogo = async (formData) => {
  const response = await api.post('/vendor/upload-logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const uploadVendorAvatar = async (formData) => {
  const response = await api.post('/vendor/upload-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const changeVendorPassword = async (currentPassword, newPassword) => {
  const response = await api.put('/vendor/change-password', { currentPassword, newPassword });
  return response.data;
};
