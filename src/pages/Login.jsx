import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ShinexLogo from '../components/ShinexLogo';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #0B3D24, #06210F)' }}>
      <div className="shx-card" style={{ width: 380, padding: 32, background: '#fff' }}>
        <div className="shx-flex" style={{ flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <ShinexLogo size={56} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 800, fontSize: 18 }}>SHINEX Admin</p>
            <p className="shx-muted shx-text-sm">Sign in with your administrator account</p>
          </div>
        </div>
        <form onSubmit={submit}>
          <div className="shx-field">
            <label className="shx-label" htmlFor="email">Email</label>
            <input id="email" type="email" className="shx-input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="shx-field">
            <label className="shx-label" htmlFor="password">Password</label>
            <input id="password" type="password" className="shx-input" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          {error && <p className="shx-error-text shx-mt-8" style={{ marginBottom: 12 }}>{error}</p>}
          <button className="shx-btn shx-btn--primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="shx-muted shx-text-sm shx-mt-24" style={{ textAlign: 'center' }}>
          Admin access is controlled entirely by the SHINEX backend — there's no separate admin login system.
        </p>
      </div>
    </div>
  );
}
