import { api } from './client';
import { qs } from './qs';

export const listAds = (params) => api.get(`/admin/advertisements${qs(params)}`);
export const getAd = (id) => api.get(`/admin/advertisements/${id}`).then((r) => r.data);
export const approveAd = (id) => api.patch(`/admin/advertisements/${id}/approve`, {});
export const rejectAd = (id, reason) => api.patch(`/admin/advertisements/${id}/reject`, { reason });
export const pauseAd = (id) => api.patch(`/admin/advertisements/${id}/pause`, {});
export const deleteAd = (id) => api.del(`/admin/advertisements/${id}`);

export const listDurations = () => api.get('/admin/durations').then((r) => r.data);
export const createDuration = (payload) => api.post('/admin/durations', payload).then((r) => r.data);
export const updateDuration = (id, payload) => api.put(`/admin/durations/${id}`, payload).then((r) => r.data);
export const deleteDuration = (id) => api.del(`/admin/durations/${id}`);
