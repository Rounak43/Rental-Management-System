import api from './api';

export const createRental = async (rentalData) => {
  const response = await api.post('/rentals', rentalData);
  return response.data;
};

export const getMyRentals = async () => {
  const response = await api.get('/rentals/my-rentals');
  return response.data;
};

export const getAllRentals = async () => {
  const response = await api.get('/rentals');
  return response.data;
};

export const updatePickupStatus = async (id, statusData) => {
  const response = await api.patch(`/rentals/${id}/pickup`, statusData);
  return response.data;
};

export const updateReturnStatus = async (id, statusData) => {
  const response = await api.patch(`/rentals/${id}/return`, statusData);
  return response.data;
};

export const fetchRentalAnalytics = async () => {
  const response = await api.get('/rentals/reports/analytics');
  return response.data;
};
