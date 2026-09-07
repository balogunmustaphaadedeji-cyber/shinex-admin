import { api, setToken } from './client';

export async function login({ email, password }) {
  const res = await api.post('/auth/login', { email, password });
  if (res?.data?.token) setToken(res.data.token);
  return res.data;
}
export async function me() {
  const res = await api.get('/auth/me');
  return res.data.user;
}
export async function logout() {
  try { await api.post('/auth/logout'); } finally { setToken(null); }
}
