import { api } from './client';
import { qs } from './qs';

export const listUsers = (params) => api.get(`/admin/users${qs(params)}`);
export const getUser = (id) => api.get(`/admin/users/${id}`).then((r) => r.data);
export const suspendUser = (id, reason) => api.patch(`/admin/users/${id}/suspend`, { reason });
export const unsuspendUser = (id) => api.patch(`/admin/users/${id}/unsuspend`, {});
export const setAdmin = (id, is_admin) => api.patch(`/admin/users/${id}/set-admin`, { is_admin });
export const deleteUser = (id) => api.del(`/admin/users/${id}`);
