import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Layout({ children }) {
  const router = useRouter();
  const [seller, setSeller] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const s = localStorage.getItem('onshipy_seller');
    if (s) setSeller(JSON.parse(s));
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [router.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('onshipy_token');
    localStorage.removeItem('onshipy_seller');
    router.push('/login');
  };

  const nav = [
    { href: '/dashboard', label: 'Home', icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { href: '/browse', label: 'Browse', icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
    { href: '/orders', label: 'Orders', icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
    { href: '/products', label: 'Products', icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> },
    { href: '/listings', label: 'Listings', icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
    { href: '/customers', label: 'Customers', icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
    { href: '/analytics', label: 'Analytics', icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
    { href: '/online-store', label: 'Online Store', icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg> },
    { href: '/settings', label: 'Settings', icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
  ];

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; height: 100%; overflow-x: hidden; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f2f4; }

        .app-wrapper {
          display: flex;
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
        }

        /* ── SIDEBAR ── */
        .sidebar {
          width: 240px;
          flex-shrink: 0;
          background: #1a1a2e;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 400;
          overflow-y: auto;
        }

        /* ── MAIN ── */
        .main-content {
          margin-left: 240px;
          flex: 1;
          min-height: 100vh;
          min-height: 100dvh;
          width: calc(100% - 240px);
          display: flex;
          flex-direction: column;
          background: #f1f2f4;
        }

        .topbar { display: none; }
        .overlay { display: none; }

        /* ── MOBILE ── */
        @media (max-width: 767px) {
          .sidebar {
            left: -240px;
            transition: left 0.25s ease;
          }
          .sidebar.sidebar--open {
            left: 0;
          }
          .main-content {
            margin-left: 0;
            width: 100%;
          }
          .topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            height: 56px;
            background: #1a1a2e;
            position: sticky;
            top: 0;
            z-index: 300;
            width: 100%;
            flex-shrink: 0;
          }
          .overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.55);
            z-index: 350;
          }
        }

        /* ── TABLET ── */
        @media (min-width: 768px) and (max-width: 1023px) {
          .sidebar { width: 200px; }
          .main-content { margin-left: 200px; width: calc(100% - 200px); }
        }

        /* nav link hover */
        .nav-link:hover {
          background: rgba(255,255,255,0.07) !important;
          color: rgba(255,255,255,0.85) !important;
        }

        /* scrollbar */
        .sidebar::-webkit-scrollbar { width: 4px; }
        .sidebar::-webkit-scrollbar-track { background: transparent; }
        .sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
      `}</style>

      <div className="app-wrapper">

        {/* Overlay (mobile only) */}
        {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}

        {/* Sidebar */}
        <aside className={`sidebar${menuOpen ? ' sidebar--open' : ''}`}>

          {/* Store name */}
          <div style={{ padding: '14px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px' }}>
              <div style={{ width: '30px', height: '30px', background: '#00a47c', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>
                {seller?.store_name?.[0]?.toUpperCase() || 'O'}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: '600', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {seller?.store_name || 'My Store'}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>onshipy.com</div>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
            {nav.map(item => {
              const active = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-link"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '9px 12px', borderRadius: '7px', marginBottom: '2px',
                    background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                    textDecoration: 'none', fontSize: '13.5px',
                    fontWeight: active ? '500' : '400',
                    transition: 'background 0.12s, color 0.12s',
                  }}
                >
                  <span style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User profile */}
          <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, position: 'relative' }} ref={profileRef}>
            <div
              onClick={() => setProfileOpen(!profileOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '7px', cursor: 'pointer', background: profileOpen ? 'rgba(255,255,255,0.08)' : 'transparent', transition: 'background 0.12s' }}
            >
              <div style={{ width: '30px', height: '30px', background: '#00a47c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '12px', flexShrink: 0 }}>
                {seller?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ color: '#fff', fontSize: '13px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seller?.full_name || 'User'}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seller?.email || ''}</div>
              </div>
              <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="18 15 12 9 6 15"/></svg>
            </div>

            {profileOpen && (
              <div style={{ position: 'absolute', bottom: '68px', left: '8px', right: '8px', background: '#fff', borderRadius: '10px', boxShadow: '0 -4px 24px rgba(0,0,0,0.18)', overflow: 'hidden', zIndex: 500 }}>
                <div style={{ padding: '12px 14px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', background: '#00a47c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>
                      {seller?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', color: '#111' }}>{seller?.full_name}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seller?.email}</div>
                      <div style={{ fontSize: '10px', color: '#00a47c', fontWeight: '700', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{seller?.plan || 'free'} plan</div>
                    </div>
                  </div>
                </div>
                {[
                  { label: 'Your profile', href: '/settings' },
                  { label: 'Store settings', href: '/settings' },
                  { label: 'Billing', href: '/settings' },
                ].map((item, i) => (
                  <Link key={i} href={item.href} onClick={() => { setProfileOpen(false); setMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', fontSize: '13px', color: '#111', textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }}>
                    {item.label}
                    <svg width="13" height="13" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                  </Link>
                ))}
                <button onClick={handleLogout} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#dc2626', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main area */}
        <div className="main-content">

          {/* Mobile top bar */}
          <header className="topbar">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '6px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Menu"
            >
              {menuOpen
                ? <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>

            <span style={{ color: '#fff', fontWeight: '700', fontSize: '17px', letterSpacing: '-0.3px' }}>Onshipy</span>

            <Link href="/settings" style={{ textDecoration: 'none' }}>
              <div style={{ width: '34px', height: '34px', background: '#00a47c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '13px' }}>
                {seller?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
            </Link>
          </header>

          {/* Page content */}
          <div style={{ flex: 1, overflowX: 'hidden' }}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}