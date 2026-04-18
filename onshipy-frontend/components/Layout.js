import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Layout({ children }) {
  const router = useRouter();
  const [seller, setSeller] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const profileRef = useRef(null);
  const storeRef = useRef(null);

  useEffect(() => {
    const s = localStorage.getItem('onshipy_seller');
    if (s) { try { setSeller(JSON.parse(s)); } catch {} }
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
    setStoreOpen(false);
  }, [router.pathname]);

  useEffect(() => {
    const fn = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (storeRef.current && !storeRef.current.contains(e.target)) setStoreOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('onshipy_token');
    localStorage.removeItem('onshipy_seller');
    router.push('/login');
  };

  const nav = [
    { href: '/dashboard', label: 'Home', icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { href: '/browse', label: 'Browse', icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
    { href: '/orders', label: 'Orders', icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
    { href: '/products', label: 'Products', icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> },
    { href: '/listings', label: 'Listings', icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
    { href: '/customers', label: 'Customers', icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
    { href: '/analytics', label: 'Analytics', icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
    { href: '/online-store', label: 'Online Store', icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg> },
    { href: '/settings', label: 'Settings', icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
  ];

  const initials = seller?.full_name
    ? seller.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const storeInitial = seller?.store_name?.[0]?.toUpperCase() || 'O';

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; min-height: 100vh; background: #f1f2f4; }

        .layout { display: flex; min-height: 100vh; min-height: 100dvh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }

        .sidebar {
          width: 224px;
          flex-shrink: 0;
          background: #1a1a2e;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 400;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .main {
          margin-left: 224px;
          flex: 1;
          min-height: 100vh;
          width: calc(100% - 224px);
          display: flex;
          flex-direction: column;
          background: #f1f2f4;
        }

        .topbar { display: none; }
        .overlay { display: none; }

        .nav-link { display: flex; align-items: center; gap: 9px; padding: 8px 12px; border-radius: 7px; margin-bottom: 2px; text-decoration: none; font-size: 13.5px; transition: background 0.12s, color 0.12s; }
        .nav-link:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.85) !important; }

        @media (max-width: 767px) {
          .sidebar { transform: translateX(-100%); transition: transform 0.25s ease; width: 260px; }
          .sidebar.open { transform: translateX(0); }
          .main { margin-left: 0; width: 100%; }
          .topbar { display: flex; align-items: center; justify-content: space-between; padding: 0 16px; height: 54px; background: #1a1a2e; position: sticky; top: 0; z-index: 300; flex-shrink: 0; }
          .overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 350; }
        }

        @media (min-width: 768px) and (max-width: 1024px) {
          .sidebar { width: 200px; }
          .main { margin-left: 200px; width: calc(100% - 200px); }
        }
      `}</style>

      <div className="layout">

        {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}

        {/* Sidebar */}
        <aside className={`sidebar${menuOpen ? ' open' : ''}`}>

          {/* Store header — clickable */}
          <div ref={storeRef} style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'relative', flexShrink: 0 }}>
            <div
              onClick={() => setStoreOpen(!storeOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.12s' }}
            >
              <div style={{ width: '30px', height: '30px', background: '#00a47c', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '12px', flexShrink: 0 }}>
                {storeInitial}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#fff', fontWeight: '600', fontSize: '12.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {seller?.store_name || 'My Store'}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  onshipy.com
                </div>
              </div>
              <svg width="13" height="13" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, transform: storeOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
            </div>

            {storeOpen && (
              <div style={{ position: 'absolute', top: '100%', left: '8px', right: '8px', background: '#fff', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.18)', overflow: 'hidden', zIndex: 500, marginTop: '4px' }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Current store</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', background: '#00a47c', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '11px' }}>{storeInitial}</div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '13px', color: '#111' }}>{seller?.store_name || 'My Store'}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>onshipy.com</div>
                    </div>
                  </div>
                </div>
                <Link href="/online-store" onClick={() => setStoreOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', fontSize: '13px', color: '#111', textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add another store
                </Link>
                <Link href="/settings?section=general" onClick={() => setStoreOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', fontSize: '13px', color: '#111', textDecoration: 'none' }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                  Store settings
                </Link>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
            {nav.map(item => {
              const active = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-link"
                  style={{
                    background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                    fontWeight: active ? '500' : '400',
                  }}
                >
                  <span style={{ flexShrink: 0, opacity: active ? 1 : 0.65 }}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User profile — clickable */}
          <div ref={profileRef} style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, position: 'relative' }}>
            <div
              onClick={() => setProfileOpen(!profileOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 10px', borderRadius: '7px', cursor: 'pointer', background: profileOpen ? 'rgba(255,255,255,0.08)' : 'transparent', transition: 'background 0.12s' }}
            >
              {/* Avatar with initials */}
              <div style={{ width: '30px', height: '30px', background: '#00a47c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '11px', flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#fff', fontSize: '12.5px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seller?.full_name || 'User'}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seller?.email || ''}</div>
              </div>
              <svg width="13" height="13" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="18 15 12 9 6 15"/></svg>
            </div>

            {profileOpen && (
              <div style={{ position: 'absolute', bottom: '68px', left: '8px', right: '8px', background: '#fff', borderRadius: '10px', boxShadow: '0 -4px 24px rgba(0,0,0,0.18)', overflow: 'hidden', zIndex: 500 }}>
                {/* Profile header */}
                <div style={{ padding: '14px 16px', background: '#f9fafb', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#00a47c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '15px', flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: '#111' }}>{seller?.full_name}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seller?.email}</div>
                    <div style={{ fontSize: '10px', color: '#00a47c', fontWeight: '700', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{seller?.plan || 'free'} plan</div>
                  </div>
                </div>
                {[
                  { label: 'Your profile', href: '/settings?section=users' },
                  { label: 'Store settings', href: '/settings?section=general' },
                  { label: 'Billing & plan', href: '/settings?section=billing' },
                ].map((item, i) => (
                  <Link key={i} href={item.href} onClick={() => { setProfileOpen(false); setMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', fontSize: '13px', color: '#111', textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }}>
                    {item.label}
                    <svg width="13" height="13" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                  </Link>
                ))}
                <button onClick={handleLogout} style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#dc2626', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main */}
        <div className="main">

          {/* Mobile topbar */}
          <header className="topbar">
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: '6px', display: 'flex' }}>
              {menuOpen
                ? <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>

            <span style={{ color: '#fff', fontWeight: '700', fontSize: '17px', letterSpacing: '-0.3px' }}>Onshipy</span>

            {/* Clickable avatar on mobile */}
            <div onClick={() => router.push('/settings?section=users')} style={{ width: '34px', height: '34px', background: '#00a47c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '12px', cursor: 'pointer', flexShrink: 0 }}>
              {initials}
            </div>
          </header>

          {/* Page */}
          <div style={{ flex: 1, overflowX: 'hidden' }}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}