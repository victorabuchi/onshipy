import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function Layout({ children, title }) {
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

  const mainNav = [
    { href: '/dashboard', label: 'Home', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { href: '/orders', label: 'Orders', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
    { href: '/products', label: 'Products', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> },
    { href: '/customers', label: 'Customers', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg> },
    { href: '/listings', label: 'Listings', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
    { href: '/analytics', label: 'Analytics', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
    { href: '/browse', label: 'Browse', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  ];

  const salesNav = [
    { href: '/online-store', label: 'Online Store', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg> },
  ];

  const accountNav = [
    { href: '/wallet', label: 'Wallet', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
    { href: '/plans', label: 'Onshipy Plans', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
    { href: '/settings', label: 'Settings', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
  ];

  const initials = seller?.full_name
    ? seller.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const NavItem = ({ item }) => {
    const active = router.pathname === item.href ||
      (item.href !== '/dashboard' && router.pathname.startsWith(item.href));
    return (
      <Link href={item.href} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '7px 10px', borderRadius: 7, marginBottom: 1,
        background: active ? '#f3f4f6' : 'transparent',
        color: active ? '#111' : '#4b5563',
        textDecoration: 'none', fontSize: 13.5,
        fontWeight: active ? 600 : 400,
        transition: 'background .12s, color .12s',
      }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f9fafb'; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ flexShrink: 0, color: active ? '#111' : '#6b7280' }}>{item.icon}</span>
        {item.label}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Store switcher */}
      <div ref={storeRef} style={{ padding: '10px 10px 8px', borderBottom: '1px solid #f3f4f6', flexShrink: 0, position: 'relative' }}>
        <div
          onClick={() => setStoreOpen(!storeOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
            background: storeOpen ? '#f3f4f6' : 'transparent',
            transition: 'background .12s'
          }}
          onMouseEnter={e => { if (!storeOpen) e.currentTarget.style.background = '#f9fafb'; }}
          onMouseLeave={e => { if (!storeOpen) e.currentTarget.style.background = storeOpen ? '#f3f4f6' : 'transparent'; }}
        >
          <div style={{
            width: 28, height: 28, background: '#008060', borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0
          }}>
            {seller?.store_name?.[0]?.toUpperCase() || 'O'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#111', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {seller?.store_name || 'My Store'}
            </div>
            <div style={{ color: '#9ca3af', fontSize: 11 }}>onshipy.com</div>
          </div>
          <svg width="13" height="13" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24"
            style={{ flexShrink: 0, transform: storeOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>

        {storeOpen && (
          <div style={{
            position: 'absolute', top: '100%', left: 8, right: 8,
            background: '#fff', borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid #e5e7eb',
            overflow: 'hidden', zIndex: 500, marginTop: 4
          }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Current store</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, background: '#008060', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11 }}>
                  {seller?.store_name?.[0]?.toUpperCase() || 'O'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#111' }}>{seller?.store_name || 'My Store'}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>onshipy.com</div>
                </div>
              </div>
            </div>
            {[
              { label: 'Add another store', href: '/online-store', icon: '+' },
              { label: 'Store settings', href: '/settings', icon: '⚙' },
            ].map((item, i) => (
              <Link key={i} href={item.href} onClick={() => setStoreOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', fontSize: 13, color: '#111',
                textDecoration: 'none', borderBottom: i === 0 ? '1px solid #f3f4f6' : 'none',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px 0', scrollbarWidth: 'none' }}>

        {mainNav.map(item => <NavItem key={item.href} item={item} />)}

        <div style={{ margin: '10px 4px 6px', borderTop: '1px solid #f3f4f6' }} />
        <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 10px 5px' }}>
          Sales channels
        </div>
        {salesNav.map(item => <NavItem key={item.href} item={item} />)}

        <button
          onClick={() => router.push('/online-store')}
          style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '6px 10px', borderRadius: 7, width: '100%',
            background: 'transparent', border: '1px dashed #d1d5db',
            color: '#9ca3af', fontSize: 13, cursor: 'pointer',
            fontFamily: 'inherit', marginTop: 4, marginBottom: 4
          }}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add sales channel
        </button>

        <div style={{ margin: '6px 4px', borderTop: '1px solid #f3f4f6' }} />
        <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 10px 5px' }}>
          Account
        </div>
        {accountNav.map(item => <NavItem key={item.href} item={item} />)}

        <div style={{ height: 16 }} />
      </div>

      {/* User profile bottom */}
      <div ref={profileRef} style={{ padding: '8px', borderTop: '1px solid #f3f4f6', flexShrink: 0, position: 'relative' }}>
        <div
          onClick={() => setProfileOpen(!profileOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
            background: profileOpen ? '#f3f4f6' : 'transparent',
            transition: 'background .12s'
          }}
          onMouseEnter={e => { if (!profileOpen) e.currentTarget.style.background = '#f9fafb'; }}
          onMouseLeave={e => { if (!profileOpen) e.currentTarget.style.background = profileOpen ? '#f3f4f6' : 'transparent'; }}
        >
          <div style={{
            width: 30, height: 30, background: '#008060', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 11, flexShrink: 0
          }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#111', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seller?.full_name || 'User'}</div>
            <div style={{ color: '#9ca3af', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seller?.email || ''}</div>
          </div>
          <svg width="12" height="12" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24"
            style={{ flexShrink: 0, transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </div>

        {profileOpen && (
          <div style={{
            position: 'absolute', bottom: 58, left: 8, right: 8,
            background: '#fff', borderRadius: 10,
            boxShadow: '0 -4px 24px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb',
            overflow: 'hidden', zIndex: 500
          }}>
            <div style={{ padding: '12px 14px', background: '#f9fafb', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: '#008060', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{initials}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#111' }}>{seller?.full_name}</div>
                <div style={{ fontSize: 11, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seller?.email}</div>
                <div style={{ fontSize: 10, color: '#008060', fontWeight: 700, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{seller?.plan || 'free'} plan</div>
              </div>
            </div>
            {[
              { label: 'Your profile', href: '/settings?section=users' },
              { label: 'Store settings', href: '/settings' },
              { label: 'Billing & plan', href: '/plans' },
            ].map((item, i) => (
              <Link key={i} href={item.href} onClick={() => setProfileOpen(false)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', fontSize: 13, color: '#111',
                textDecoration: 'none', borderBottom: '1px solid #f3f4f6',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {item.label}
                <svg width="12" height="12" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
              </Link>
            ))}
            <button onClick={handleLogout} style={{
              width: '100%', padding: '10px 14px', background: 'none', border: 'none',
              textAlign: 'left', fontSize: 13, color: '#dc2626', cursor: 'pointer',
              fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit'
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Log out
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>{title ? `${title} — Onshipy` : 'Onshipy'}</title>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <meta name="theme-color" content="#ffffff" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; min-height: 100vh; background: #f1f2f4; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
        .layout-wrap { display: flex; min-height: 100vh; }

        /* ── Desktop topbar (Shopify-style black bar) ── */
        .desk-topbar {
          display: flex; align-items: center;
          position: fixed; top: 0; left: 220px; right: 0; height: 52px;
          background: #1a1a1a; z-index: 300;
          padding: 0 20px; gap: 12px;
          border-bottom: 1px solid #2a2a2a;
        }
        .desk-topbar-search {
          flex: 1; max-width: 360px;
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 0 12px; height: 32px; cursor: pointer;
        }
        .desk-topbar-search span { font-size: 13px; color: rgba(255,255,255,0.4); }
        .desk-topbar-search kbd { font-size: 11px; color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.08); padding: 1px 6px; border-radius: 4px; margin-left: 'auto'; }

        /* ── Sidebar ── */
        .sidebar {
          width: 220px; flex-shrink: 0;
          background: #fff; border-right: 1px solid #e5e7eb;
          position: fixed; top: 0; left: 0; bottom: 0; z-index: 400;
          display: flex; flex-direction: column;
        }
        .sidebar-logo {
          height: 52px; display: flex; align-items: center;
          padding: 0 14px; border-bottom: 1px solid #f3f4f6; flex-shrink: 0;
          gap: 9px;
        }

        /* ── Main content ── */
        .main-content {
          margin-left: 220px; flex: 1; min-height: 100vh;
          width: calc(100% - 220px);
          padding-top: 52px;
          background: #f1f2f4;
        }

        /* ── Mobile topbar ── */
        .mob-topbar { display: none; }
        .overlay { display: none; }

        a { text-decoration: none; }

        @media (max-width: 767px) {
          .desk-topbar { display: none; }
          .sidebar { transform: translateX(-100%); transition: transform .25s ease; width: 260px; }
          .sidebar.open { transform: translateX(0); box-shadow: 4px 0 20px rgba(0,0,0,0.12); }
          .main-content { margin-left: 0; width: 100%; padding-top: 52px; }
          .mob-topbar {
            display: flex; align-items: center; justify-content: space-between;
            padding: 0 16px; height: 52px;
            background: #1a1a1a;
            position: fixed; top: 0; left: 0; right: 0; z-index: 300;
          }
          .overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 350; }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .sidebar { width: 200px; }
          .main-content { margin-left: 200px; width: calc(100% - 200px); }
          .desk-topbar { left: 200px; }
        }
      `}</style>

      <div className="layout-wrap">
        {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}

        {/* Sidebar */}
        <aside className={`sidebar${menuOpen ? ' open' : ''}`}>
          {/* Logo row */}
          <div className="sidebar-logo">
            <img src="/favicon.png" alt="Onshipy" style={{ width: 26, height: 26, objectFit: 'contain' }} />
            <span style={{ fontWeight: 700, fontSize: 15, color: '#111', letterSpacing: '-0.3px' }}>Onshipy</span>
          </div>
          <SidebarContent />
        </aside>

        {/* Desktop topbar */}
        <div className="desk-topbar">
          <div className="desk-topbar-search">
            <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span>Search</span>
            <kbd style={{ marginLeft: 'auto' }}>⌘K</kbd>
          </div>
          <div style={{ flex: 1 }} />
          {/* Topbar actions */}
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex', padding: 6, borderRadius: 6 }}
            title="Notifications"
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
          </button>
          {/* Avatar */}
          <div
            onClick={() => router.push('/settings')}
            style={{
              width: 30, height: 30, background: '#008060', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 11, cursor: 'pointer',
              border: '2px solid rgba(255,255,255,0.15)'
            }}
          >{initials}</div>
        </div>

        {/* Mobile topbar */}
        <header className="mob-topbar">
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 6, display: 'flex' }}>
            {menuOpen
              ? <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              : <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            }
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/favicon.png" alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Onshipy</span>
          </div>
          <div style={{ width: 30, height: 30, background: '#008060', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}
            onClick={() => router.push('/settings')}>{initials}</div>
        </header>

        {/* Page content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </>
  );
}