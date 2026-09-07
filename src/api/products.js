import { api } from './client';
import { qs } from './qs';

export const listProducts = (params) => api.get(`/admin/products${qs(params)}`);
export const getProduct = (id) => api.get(`/admin/products/${id}`).then((r) => r.data);
export const approveProduct = (id) => api.patch(`/admin/products/${id}/approve`, {});
export const rejectProduct = (id, reason) => api.patch(`/admin/products/${id}/reject`, { reason });
export const deleteProduct = (id) => api.del(`/admin/products/${id}`);
