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

  // Exact Shopify-matching nav colors
  const NAV_TEXT = '#1a1a1a';
  const NAV_TEXT_MUTED = '#6b7280';
  const NAV_ACTIVE_BG = '#e3e3e3';
  const NAV_HOVER_BG = '#f1f1f1';
  const SECTION_LABEL = '#6d7175';
  const GREEN = '#008060';

  const mainNav = [
    { href: '/dashboard', label: 'Home', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10', type: 'path' },
    { href: '/orders', label: 'Orders', icon: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0', type: 'path' },
    { href: '/products', label: 'Products', icon: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z', type: 'path' },
    { href: '/customers', label: 'Customers', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75', type: 'path' },
    { href: '/listings', label: 'Listings', icon: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01', type: 'path' },
    { href: '/analytics', label: 'Analytics', icon: 'M18 20V10M12 20V4M6 20v-6', type: 'path' },
    { href: '/browse', label: 'Browse', icon: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z', type: 'path' },
  ];
  const salesNav = [
    { href: '/online-store', label: 'Online Store', icon: 'M12 2a10 10 0 100 20A10 10 0 0012 2zM2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20', type: 'path' },
  ];
  const accountNav = [
    { href: '/wallet', label: 'Wallet', icon: 'M1 4h22a2 2 0 012 2v12a2 2 0 01-2 2H1a2 2 0 01-2-2V6a2 2 0 012-2zM1 10h22', type: 'path' },
    { href: '/plans', label: 'Onshipy Plans', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', type: 'path' },
    { href: '/settings', label: 'Settings', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z', type: 'path' },
  ];

  const initials = seller?.full_name
    ? seller.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const Icon = ({ d }) => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {d.split(' M').map((segment, i) => (
        <path key={i} d={i === 0 ? segment : 'M' + segment} fill="none"/>
      ))}
    </svg>
  );

  const NavItem = ({ item }) => {
    const active = router.pathname === item.href ||
      (item.href !== '/dashboard' && router.pathname.startsWith(item.href));
    return (
      <Link href={item.href} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '7px 12px', borderRadius: 8, marginBottom: 1,
        background: active ? NAV_ACTIVE_BG : 'transparent',
        color: active ? NAV_TEXT : NAV_TEXT,
        textDecoration: 'none',
        fontSize: 13.5,
        fontWeight: active ? 600 : 400,
        letterSpacing: '-0.1px',
        transition: 'background .1s',
      }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = NAV_HOVER_BG; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ flexShrink: 0, color: active ? NAV_TEXT : '#5c5f62', display: 'flex' }}>
          <Icon d={item.icon} />
        </span>
        <span>{item.label}</span>
      </Link>
    );
  };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Store switcher */}
      <div ref={storeRef} style={{ padding: '8px 8px 6px', borderBottom: '1px solid #e1e3e5', flexShrink: 0, position: 'relative' }}>
        <div
          onClick={() => setStoreOpen(!storeOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
            background: storeOpen ? NAV_ACTIVE_BG : 'transparent',
          }}
          onMouseEnter={e => { if (!storeOpen) e.currentTarget.style.background = NAV_HOVER_BG; }}
          onMouseLeave={e => { if (!storeOpen) e.currentTarget.style.background = storeOpen ? NAV_ACTIVE_BG : 'transparent'; }}
        >
          <div style={{
            width: 28, height: 28, background: GREEN, borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0
          }}>
            {seller?.store_name?.[0]?.toUpperCase() || 'N'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: NAV_TEXT, fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.1px' }}>
              {seller?.store_name || 'My Store'}
            </div>
            <div style={{ color: NAV_TEXT_MUTED, fontSize: 11 }}>onshipy.com</div>
          </div>
          <svg width="12" height="12" fill="none" stroke="#5c5f62" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, transform: storeOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>

        {storeOpen && (
          <div style={{ position: 'absolute', top: '100%', left: 8, right: 8, background: '#fff', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid #e1e3e5', overflow: 'hidden', zIndex: 500, marginTop: 4 }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid #f1f1f1', background: '#f9fafb' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: SECTION_LABEL, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Current store</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 26, height: 26, background: GREEN, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11 }}>
                  {seller?.store_name?.[0]?.toUpperCase() || 'N'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#111' }}>{seller?.store_name}</div>
                  <div style={{ fontSize: 11, color: NAV_TEXT_MUTED }}>onshipy.com</div>
                </div>
              </div>
            </div>
            {[
              { label: 'Add another store', href: '/online-store' },
              { label: 'Store settings', href: '/settings' },
            ].map((item, i) => (
              <Link key={i} href={item.href} onClick={() => setStoreOpen(false)}
                style={{ display: 'block', padding: '10px 14px', fontSize: 13, color: NAV_TEXT, textDecoration: 'none', borderBottom: i === 0 ? '1px solid #f1f1f1' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >{item.label}</Link>
            ))}
          </div>
        )}
      </div>

      {/* Main nav */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 6px 0', scrollbarWidth: 'none' }}>
        {mainNav.map(item => <NavItem key={item.href} item={item} />)}

        <div style={{ margin: '8px 6px 4px', borderTop: '1px solid #e1e3e5' }} />
        <div style={{ fontSize: 11, fontWeight: 600, color: SECTION_LABEL, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '2px 12px 5px' }}>
          Sales channels
        </div>
        {salesNav.map(item => <NavItem key={item.href} item={item} />)}

        <button onClick={() => router.push('/online-store')} style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '6px 12px', borderRadius: 8, width: '100%',
          background: 'transparent', border: '1px dashed #c9cccf',
          color: '#6d7175', fontSize: 13, cursor: 'pointer',
          fontFamily: 'inherit', marginTop: 3, marginBottom: 2
        }}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add sales channel
        </button>

        <div style={{ margin: '8px 6px 4px', borderTop: '1px solid #e1e3e5' }} />
        <div style={{ fontSize: 11, fontWeight: 600, color: SECTION_LABEL, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '2px 12px 5px' }}>
          Account
        </div>
        {accountNav.map(item => <NavItem key={item.href} item={item} />)}
        <div style={{ height: 16 }} />
      </div>

      {/* User profile */}
      <div ref={profileRef} style={{ padding: '6px 6px', borderTop: '1px solid #e1e3e5', flexShrink: 0, position: 'relative' }}>
        <div
          onClick={() => setProfileOpen(!profileOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
            background: profileOpen ? NAV_ACTIVE_BG : 'transparent',
          }}
          onMouseEnter={e => { if (!profileOpen) e.currentTarget.style.background = NAV_HOVER_BG; }}
          onMouseLeave={e => { if (!profileOpen) e.currentTarget.style.background = profileOpen ? NAV_ACTIVE_BG : 'transparent'; }}
        >
          <div style={{ width: 28, height: 28, background: GREEN, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: NAV_TEXT, fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.1px' }}>{seller?.full_name || 'User'}</div>
            <div style={{ color: NAV_TEXT_MUTED, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seller?.email || ''}</div>
          </div>
          <svg width="12" height="12" fill="none" stroke="#5c5f62" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </div>

        {profileOpen && (
          <div style={{ position: 'absolute', bottom: 58, left: 6, right: 6, background: '#fff', borderRadius: 10, boxShadow: '0 -4px 24px rgba(0,0,0,0.1)', border: '1px solid #e1e3e5', overflow: 'hidden', zIndex: 500 }}>
            <div style={{ padding: '12px 14px', background: '#f9fafb', borderBottom: '1px solid #f1f1f1', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, background: GREEN, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{initials}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#111', letterSpacing: '-0.1px' }}>{seller?.full_name}</div>
                <div style={{ fontSize: 11, color: NAV_TEXT_MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seller?.email}</div>
                <div style={{ fontSize: 10, color: GREEN, fontWeight: 700, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{seller?.plan || 'free'} plan</div>
              </div>
            </div>
            {[
              { label: 'Your profile', href: '/settings?section=users' },
              { label: 'Store settings', href: '/settings' },
              { label: 'Billing & plan', href: '/plans' },
            ].map((item, i) => (
              <Link key={i} href={item.href} onClick={() => setProfileOpen(false)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', fontSize: 13, color: NAV_TEXT, textDecoration: 'none', borderBottom: '1px solid #f1f1f1', letterSpacing: '-0.1px' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {item.label}
                <svg width="12" height="12" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
              </Link>
            ))}
            <button onClick={handleLogout} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: 13, color: '#d82c0d', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit', letterSpacing: '-0.1px' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fff4f4'}
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
        html, body {
          width: 100%; min-height: 100vh; background: #f1f2f4;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          font-size: 14px; color: #1a1a1a; -webkit-font-smoothing: antialiased;
        }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #c9cccf; border-radius: 4px; }
        .layout-wrap { display: flex; min-height: 100vh; }
        .sidebar {
          width: 220px; flex-shrink: 0;
          background: #fff;
          border-right: 1px solid #e1e3e5;
          position: fixed; top: 0; left: 0; bottom: 0; z-index: 400;
          display: flex; flex-direction: column;
        }
        .sidebar-logo {
          height: 52px; display: flex; align-items: center;
          padding: 0 16px; border-bottom: 1px solid #e1e3e5;
          flex-shrink: 0; gap: 9px;
        }
        .desk-topbar {
          display: flex; align-items: center;
          position: fixed; top: 0; left: 220px; right: 0; height: 52px;
          background: #1a1a1a; z-index: 300;
          padding: 0 20px; gap: 12px;
          border-bottom: 1px solid #2a2a2a;
        }
        .topbar-search {
          flex: 1; max-width: 400px;
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 0 12px; height: 34px; cursor: pointer;
          transition: background .15s;
        }
        .topbar-search:hover { background: rgba(255,255,255,0.1); }
        .main-content {
          margin-left: 220px; flex: 1; min-height: 100vh;
          width: calc(100% - 220px); padding-top: 52px;
          background: #f1f2f4;
        }
        .mob-topbar { display: none; }
        .overlay { display: none; }
        a { text-decoration: none; color: inherit; }
        @media (max-width: 767px) {
          .desk-topbar { display: none; }
          .sidebar { transform: translateX(-100%); transition: transform .25s ease; width: 260px; }
          .sidebar.open { transform: translateX(0); box-shadow: 4px 0 20px rgba(0,0,0,0.15); }
          .main-content { margin-left: 0; width: 100%; padding-top: 52px; }
          .mob-topbar { display: flex; align-items: center; justify-content: space-between; padding: 0 16px; height: 52px; background: #1a1a1a; position: fixed; top: 0; left: 0; right: 0; z-index: 300; }
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

        <aside className={`sidebar${menuOpen ? ' open' : ''}`}>
          <div className="sidebar-logo">
            <img src="/favicon.png" alt="Onshipy" style={{ width: 24, height: 24, objectFit: 'contain' }} />
            <span style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a', letterSpacing: '-0.3px' }}>Onshipy</span>
          </div>
          <SidebarContent />
        </aside>

        {/* Desktop topbar */}
        <div className="desk-topbar">
          <div className="topbar-search">
            <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', flex: 1 }}>Search</span>
            <div style={{ display: 'flex', gap: 3 }}>
              <kbd style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 4 }}>CTRL</kbd>
              <kbd style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 4 }}>K</kbd>
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex', padding: '6px', borderRadius: 6 }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
          </button>
          <div onClick={() => router.push('/settings')} style={{ width: 30, height: 30, background: GREEN, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, cursor: 'pointer', border: '2px solid rgba(255,255,255,0.15)' }}>
            {initials}
          </div>
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
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px' }}>Onshipy</span>
          </div>
          <div style={{ width: 30, height: 30, background: GREEN, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}
            onClick={() => router.push('/settings')}>{initials}</div>
        </header>

        <main className="main-content">{children}</main>
      </div>
    </>
  );
}