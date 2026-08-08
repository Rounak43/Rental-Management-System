import api from './api';

export const createRental = async (rentalData) => {
  const response = await api.post('/rentals', rentalData);
  return response.data;
};

export const getMyRentals = async () => {
  const response = await api.get('/rentals/my-rentals');
  return response.data;
};

export const getVendorRentals = async () => {
  const response = await api.get('/rentals/vendor-rentals');
  return response.data;
};

export const getAllRentals = async () => {
  const response = await api.get('/rentals');
  return response.data;
};

export const updatePickupStatus = async (id, payload) => {
  const response = await api.patch(`/rentals/${id}/pickup`, payload);
  return response.data;
};

export const updateRentalBookingStatus = async (id, status) => {
  const response = await api.patch(`/rentals/${id}/status`, { status });
  return response.data;
};

export const updateReturnStatus = async (id, payload) => {
  const response = await api.patch(`/rentals/${id}/return`, payload);
  return response.data;
};

export const getRentalReports = async () => {
  const response = await api.get('/rentals/reports/analytics');
  return response.data;
};
