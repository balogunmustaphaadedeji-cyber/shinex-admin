import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import ShinexLogo from './ShinexLogo';
import { useAuth } from '../context/AuthContext';
import {
  DashboardIcon, UsersIcon, BoxIcon, GridIcon, MegaphoneIcon, CreditCardIcon,
  FlagIcon, MailIcon, ShieldIcon, LogoutIcon, MenuIcon, XIcon
} from './Icons';

const NAV = [
  { section: 'Overview', items: [{ to: '/', label: 'Dashboard', icon: DashboardIcon, end: true }] },
  { section: 'Marketplace', items: [
    { to: '/users', label: 'Users', icon: UsersIcon },
    { to: '/products', label: 'Products', icon: BoxIcon },
    { to: '/categories', label: 'Categories', icon: GridIcon },
  ] },
  { section: 'Growth', items: [
    { to: '/advertisements', label: 'Advertisements', icon: MegaphoneIcon },
    { to: '/payments', label: 'Payments', icon: CreditCardIcon },
  ] },
  { section: 'Trust & Support', items: [
    { to: '/reports', label: 'Reports', icon: FlagIcon },
    { to: '/contact', label: 'Contact Messages', icon: MailIcon },
  ] },
  { section: 'Admin', items: [
    { to: '/admin-management', label: 'Admin Management', icon: ShieldIcon },
  ] }
];

export default function AdminLayout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const doLogout = async () => { await logout(); navigate('/login', { replace: true }); };

  return (
    <div className="shx-shell">
      <aside className={`shx-sidebar${sidebarOpen ? ' is-open' : ''}`}>
        <div className="shx-sidebar__brand">
          <ShinexLogo size={34} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 14.5 }}>SHINEX</div>
            <div style={{ fontSize: 10.5, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)' }}>ADMIN</div>
          </div>
        </div>
        <nav className="shx-sidebar__nav">
          {NAV.map((group) => (
            <div key={group.section}>
              <p className="shx-sidebar__section">{group.section}</p>
              {group.items.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `shx-navlink${isActive ? ' is-active' : ''}`}>
                  <item.icon width={17} height={17} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="shx-sidebar__footer">
          <p style={{ fontSize: 12.5, fontWeight: 700, color: '#fff' }}>{user?.full_name}</p>
          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)' }}>@{user?.username}</p>
          <button className="shx-navlink" style={{ marginTop: 10, width: '100%', border: 'none', cursor: 'pointer' }} onClick={doLogout}>
            <LogoutIcon width={17} height={17} /> Log out
          </button>
        </div>
      </aside>

      <main className="shx-main">
        <div className="shx-topbar">
          <button className="shx-btn shx-btn--ghost" style={{ display: 'none' }} onClick={() => setSidebarOpen((s) => !s)}>
            {sidebarOpen ? <XIcon /> : <MenuIcon />}
          </button>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14.5 }}>{title}</p>
          </div>
          <div />
        </div>
        <div className="shx-content">
          {subtitle && <p className="shx-page-sub shx-mt-8" style={{ marginBottom: 20 }}>{subtitle}</p>}
          {children}
        </div>
      </main>
    </div>
  );
}
