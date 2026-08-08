import api from './api';

export const processPayment = async (paymentData) => {
  const response = await api.post('/payments/process', paymentData);
  return response.data;
};

export const getPayments = async () => {
  const response = await api.get('/payments');
  return response.data;
};

export const refundDeposit = async (id, refundData) => {
  const response = await api.post(`/payments/${id}/refund-deposit`, refundData);
  return response.data;
};

export const getVendorPayments = async () => {
  const response = await api.get('/payments/vendor');
  return response.data;
};
