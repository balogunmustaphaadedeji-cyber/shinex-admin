import { api } from './client';
import { qs } from './qs';

export const listMessages = (params) => api.get(`/admin/contact${qs(params)}`);
export const getMessage = (id) => api.get(`/admin/contact/${id}`).then((r) => r.data);
export const setMessageStatus = (id, status) => api.patch(`/admin/contact/${id}/status`, { status });
export const deleteMessage = (id) => api.del(`/admin/contact/${id}`);
