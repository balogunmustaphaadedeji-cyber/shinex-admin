import { api } from './client';

export const listCategories = () => api.get('/admin/categories').then((r) => r.data);
export const createCategory = (payload) => api.post('/admin/categories', payload).then((r) => r.data);
export const updateCategory = (id, payload) => api.put(`/admin/categories/${id}`, payload).then((r) => r.data);
export const deleteCategory = (id) => api.del(`/admin/categories/${id}`);
