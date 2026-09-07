import { api } from './client';
import { qs } from './qs';

export const listPayments = (params) => api.get(`/admin/payments${qs(params)}`);
export const getPayment = (id) => api.get(`/admin/payments/${id}`).then((r) => r.data);
export const getPaymentStats = () => api.get('/admin/payments/stats').then((r) => r.data);
