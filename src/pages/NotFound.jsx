import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="shx-state" style={{ minHeight: '100vh', justifyContent: 'center' }}>
      <p className="shx-state__title">Page not found</p>
      <Link to="/" className="shx-btn shx-btn--primary">Back to dashboard</Link>
    </div>
  );
}
