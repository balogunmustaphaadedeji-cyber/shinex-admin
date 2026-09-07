import { api } from './client';
import { qs } from './qs';

export const listReports = (params) => api.get(`/admin/reports${qs(params)}`);
export const getReport = (id) => api.get(`/admin/reports/${id}`).then((r) => r.data);
export const resolveReport = (id, admin_notes) => api.patch(`/admin/reports/${id}/resolve`, { admin_notes });
export const dismissReport = (id, admin_notes) => api.patch(`/admin/reports/${id}/dismiss`, { admin_notes });
