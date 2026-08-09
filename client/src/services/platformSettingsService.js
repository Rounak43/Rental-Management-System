import api from './api';

export const getPlatformSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

export const updatePlatformSettings = async (data) => {
  const response = await api.put('/settings', data);
  return response.data;
};
