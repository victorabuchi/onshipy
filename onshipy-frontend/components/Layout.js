import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

const P = {
  bg:               '#f1f1f1',
  surface:          '#ffffff',
  surfaceHover:     '#f7f7f7',
  surfaceSecondary: '#f7f7f7',
  border:           'rgba(227,227,227,1)',
  text:             'rgba(48,48,48,1)',
  textSubdued:      'rgba(97,97,97,1)',
  green:            '#008060',
  font:             '"Inter var","Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
  fontSize:         '0.8125rem',
  lineHeight:       '1.25rem',
  fontWeight:       '450',
  letterSpacing:    '-0.00833em',
};

export default function Layout({ children, title }) {
  const router = useRouter();
  const [seller, setSeller] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const s = localStorage.getItem('onshipy_seller');
    if (s) { try { setSeller(JSON.parse(s)); } catch {} }
  }, []);

  useEffect(() => { setMenuOpen(false); setProfileOpen(false); }, [router.pathname]);

  useEffect(() => {
    const fn = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
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
    { href: '/dashboard', label: 'Home' },
    { href: '/orders',    label: 'Orders' },
    { href: '/products',  label: 'Products' },
    { href: '/customers', label: 'Customers' },
    { href: '/listings',  label: 'Listings' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/browse',    label: 'Browse' },
  ];
  const salesNav   = [{ href: '/online-store', label: 'Online Store' }];
  const accountNav = [
    { href: '/wallet',   label: 'Wallet' },
    { href: '/plans',    label: 'Onshipy Plans' },
    { href: '/settings', label: 'Settings' },
  ];

  const icons = {
    '/dashboard':    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M6.5 3A3.5 3.5 0 0 0 3 6.5v7A3.5 3.5 0 0 0 6.5 17h7a3.5 3.5 0 0 0 3.5-3.5v-7A3.5 3.5 0 0 0 13.5 3h-7ZM4.5 6.5A2 2 0 0 1 6.5 4.5h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-7Z"/><path d="M7.5 9.75a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75ZM7.5 12.25a.75.75 0 0 1 .75-.75h2a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1-.75-.75Z"/></svg>,
    '/orders':       <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M7.5 3.5a.75.75 0 0 0-1.5 0v.75H4.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-11a1 1 0 0 0-1-1H14V3.5a.75.75 0 0 0-1.5 0v.75h-5V3.5ZM5 6.75h10v9H5v-9Zm5 2a.75.75 0 0 1 .75.75v1.75h1.75a.75.75 0 0 1 0 1.5H10.75V14.5a.75.75 0 0 1-1.5 0v-1.75H7.5a.75.75 0 0 1 0-1.5h1.75V9.5A.75.75 0 0 1 10 8.75Z"/></svg>,
    '/products':     <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10.4 2.143a1 1 0 0 0-.8 0l-7 3.11A1 1 0 0 0 2 6.167V13.833a1 1 0 0 0 .6.924l7 3.11a1 1 0 0 0 .8 0l7-3.11A1 1 0 0 0 18 13.833V6.167a1 1 0 0 0-.6-.924l-7-3.11ZM10 3.65l5.514 2.45L10 8.55 4.486 6.1 10 3.65ZM3.5 7.365 9.25 9.9v6.183l-5.75-2.556V7.365Zm7.25 8.718V9.9l5.75-2.535v6.162l-5.75 2.556Z"/></svg>,
    '/customers':    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M13 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-1.5 0a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z"/><path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2ZM3.5 10a6.5 6.5 0 1 1 11.573 4.089c-.46-.707-1.197-1.323-2.183-1.768C11.862 11.814 10.963 11.5 10 11.5s-1.862.314-2.89.821c-.986.445-1.723 1.06-2.183 1.768A6.476 6.476 0 0 1 3.5 10Z"/></svg>,
    '/listings':     <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M3.25 4a.75.75 0 0 0 0 1.5h13.5a.75.75 0 0 0 0-1.5H3.25ZM3.25 8a.75.75 0 0 0 0 1.5h13.5a.75.75 0 0 0 0-1.5H3.25ZM3.25 12a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z"/></svg>,
    '/analytics':    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M4.5 12.25a.75.75 0 0 1 .75.75v3.25a.75.75 0 0 1-1.5 0V13a.75.75 0 0 1 .75-.75ZM10 8.5a.75.75 0 0 1 .75.75v7a.75.75 0 0 1-1.5 0V9.25A.75.75 0 0 1 10 8.5ZM15.5 4.5a.75.75 0 0 1 .75.75v11a.75.75 0 0 1-1.5 0v-11a.75.75 0 0 1 .75-.75Z"/></svg>,
    '/browse':       <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M8.5 3a5.5 5.5 0 1 0 3.17 9.98l3.674 3.675a.75.75 0 1 0 1.06-1.06L12.731 12.23A5.5 5.5 0 0 0 8.5 3Zm-4 5.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"/></svg>,
    '/online-store': <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M3.5 4A1.5 1.5 0 0 0 2 5.5v9A1.5 1.5 0 0 0 3.5 16h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 16.5 4h-13ZM3.5 5.5h13V8h-13V5.5Zm0 4h13v5h-13v-5Z"/></svg>,
    '/wallet':       <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5.5A2.5 2.5 0 0 1 4.5 3h11A2.5 2.5 0 0 1 18 5.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 2 14.5v-9Zm2.5-1a1 1 0 0 0-1 1V7h13V5.5a1 1 0 0 0-1-1h-11ZM3.5 8.5v6a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-6h-13Zm7.5 2.5a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"/></svg>,
    '/plans':        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1.5a.75.75 0 0 1 .676.426l1.872 3.793 4.187.608a.75.75 0 0 1 .416 1.279l-3.03 2.953.715 4.17a.75.75 0 0 1-1.088.79L10 13.347l-3.748 1.97a.75.75 0 0 1-1.088-.79l.715-4.17-3.03-2.953a.75.75 0 0 1 .416-1.28l4.187-.607L9.324 1.926A.75.75 0 0 1 10 1.5Z"/></svg>,
    '/settings':     <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M11.013 2.513a1.75 1.75 0 0 0-2.027 0l-1.5 1.134a1.75 1.75 0 0 1-.59.28l-1.84.44a1.75 1.75 0 0 0-1.433 1.79l.065 1.9a1.75 1.75 0 0 1-.165.67l-.8 1.7a1.75 1.75 0 0 0 .492 2.21l1.49 1.147a1.75 1.75 0 0 1 .485.572l.84 1.716a1.75 1.75 0 0 0 2.127.817l1.78-.608a1.75 1.75 0 0 1 1.13 0l1.78.608a1.75 1.75 0 0 0 2.127-.817l.84-1.716a1.75 1.75 0 0 1 .485-.572l1.49-1.147a1.75 1.75 0 0 0 .492-2.21l-.8-1.7a1.75 1.75 0 0 1-.165-.67l.065-1.9a1.75 1.75 0 0 0-1.434-1.79l-1.84-.44a1.75 1.75 0 0 1-.59-.28l-1.499-1.134ZM10 7.25a2.75 2.75 0 1 0 0 5.5 2.75 2.75 0 0 0 0-5.5Z"/></svg>,
  };

  const initials = seller?.full_name
    ? seller.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const NavItem = ({ item }) => {
    const active = router.pathname === item.href ||
      (item.href !== '/dashboard' && router.pathname.startsWith(item.href));
    return (
      <Link href={item.href} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '7px 12px', borderRadius: 10, marginBottom: 2,
        background: active ? '#e8e8e8' : 'transparent',
        color: P.text, textDecoration: 'none',
        fontSize: P.fontSize, fontWeight: active ? '600' : P.fontWeight,
        letterSpacing: P.letterSpacing, lineHeight: '1.5rem',
        transition: 'background .12s',
      }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f0f0f0'; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ flexShrink: 0, display: 'flex', width: 20, height: 20, alignItems: 'center', justifyContent: 'center', color: active ? P.text : P.textSubdued }}>
          {icons[item.href]}
        </span>
        {item.label}
      </Link>
    );
  };

  const SectionLabel = ({ label }) => (
    <div style={{ fontSize: '0.6875rem', fontWeight: '600', color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 12px 4px' }}>
      {label}
    </div>
  );

  const Divider = () => <div style={{ height: 1, background: P.border, margin: '4px 8px' }} />;

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px 0', scrollbarWidth: 'none' }}>
        {mainNav.map(item => <NavItem key={item.href} item={item} />)}
        <Divider />
        <SectionLabel label="Sales channels" />
        {salesNav.map(item => <NavItem key={item.href} item={item} />)}
        <button onClick={() => router.push('/online-store')} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 12px', borderRadius: 10, width: '100%',
          background: 'transparent', border: `1px dashed ${P.border}`,
          color: P.textSubdued, fontSize: P.fontSize, cursor: 'pointer',
          fontFamily: P.font, marginTop: 4, letterSpacing: P.letterSpacing,
        }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add sales channel
        </button>
        <Divider />
        <SectionLabel label="Account" />
        {accountNav.map(item => <NavItem key={item.href} item={item} />)}
        <div style={{ height: 16 }} />
      </div>

      {/* Profile */}
      <div ref={profileRef} style={{ padding: '6px', borderTop: `1px solid ${P.border}`, flexShrink: 0, position: 'relative' }}>
        <div onClick={() => setProfileOpen(!profileOpen)} style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '7px 10px', borderRadius: 10, cursor: 'pointer',
          background: profileOpen ? '#e8e8e8' : 'transparent', transition: 'background .12s'
        }}
          onMouseEnter={e => { if (!profileOpen) e.currentTarget.style.background = '#f0f0f0'; }}
          onMouseLeave={e => { if (!profileOpen) e.currentTarget.style.background = profileOpen ? '#e8e8e8' : 'transparent'; }}
        >
          <div style={{ width: 28, height: 28, background: P.green, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: P.text, fontSize: P.fontSize, fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seller?.full_name || 'User'}</div>
            <div style={{ color: P.textSubdued, fontSize: '0.6875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seller?.email || ''}</div>
          </div>
          <svg width="12" height="12" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </div>

        {profileOpen && (
          <div style={{ position: 'absolute', bottom: 58, left: 6, right: 6, background: P.surface, borderRadius: 10, boxShadow: '0 -4px 24px rgba(0,0,0,0.1)', border: `1px solid ${P.border}`, overflow: 'hidden', zIndex: 600 }}>
            <div style={{ padding: '10px 12px', background: P.surfaceSecondary, borderBottom: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: P.green, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{initials}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: '600', fontSize: P.fontSize, color: P.text }}>{seller?.full_name}</div>
                <div style={{ fontSize: '0.6875rem', color: P.textSubdued, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seller?.email}</div>
                <div style={{ fontSize: '0.6875rem', color: P.green, fontWeight: '600', marginTop: 1, textTransform: 'uppercase' }}>{seller?.plan || 'free'} plan</div>
              </div>
            </div>
            {[
              { label: 'Your profile', href: '/settings' },
              { label: 'Store settings', href: '/settings' },
              { label: 'Billing & plan', href: '/plans' },
            ].map((item, i) => (
              <Link key={i} href={item.href} onClick={() => setProfileOpen(false)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 12px', fontSize: P.fontSize, color: P.text, textDecoration: 'none',
                borderBottom: `1px solid ${P.border}`,
              }}
                onMouseEnter={e => e.currentTarget.style.background = P.surfaceHover}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {item.label}
                <svg width="12" height="12" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
              </Link>
            ))}
            <button onClick={handleLogout} style={{
              width: '100%', padding: '9px 12px', background: 'none', border: 'none',
              textAlign: 'left', fontSize: P.fontSize, color: '#d82c0d', cursor: 'pointer',
              fontWeight: '500', display: 'flex', alignItems: 'center', gap: 8, fontFamily: P.font,
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#fff4f4'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html {
          font-size: 100%;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
          scrollbar-width: thin;
        }
        html, body {
          font-family: ${P.font};
          font-size: ${P.fontSize};
          line-height: ${P.lineHeight};
          font-weight: ${P.fontWeight};
          letter-spacing: ${P.letterSpacing};
          color: ${P.text};
          /* Black outer background — this is what peeks around the curved corners */
          background: #1a1a1a;
          min-height: 100vh;
          -webkit-tap-highlight-color: rgba(0,0,0,0);
        }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #c9cccf; border-radius: 4px; }

        .layout-wrap {
          display: flex;
          min-height: 100vh;
          /* Black shows at the very edges */
          background: #1a1a1a;
        }

        /* ── SIDEBAR ──────────────────────────────────────────────────── */
        /* The sidebar sits on the black background
           Its inner white card creates the curved right edge */
        .sidebar {
          width: 248px;
          flex-shrink: 0;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 400;
          display: flex;
          flex-direction: column;
          /* No background — black body bg shows through */
          background: transparent;
          padding: 0;
        }

        /* Black topbar section of sidebar — holds the wordmark */
        .sidebar-topbar {
          height: 56px;
          display: flex;
          align-items: center;
          padding: 0 16px;
          flex-shrink: 0;
          /* Matches the black page background */
          background: transparent;
        }

        /* White nav card — rounded on BOTH top corners */
        .sidebar-nav {
          flex: 1;
          background: #ffffff;
          /* Both top corners curved — right one faces the content */
          border-radius: 0 14px 0 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          /* Subtle shadow to lift it off the black */
          box-shadow: 2px 0 0 rgba(227,227,227,0.5);
        }

        /* ── TOPBAR ───────────────────────────────────────────────────── */
        .desk-topbar {
          display: flex;
          align-items: center;
          position: fixed;
          top: 0; left: 248px; right: 0;
          height: 56px;
          /* Black — same as page background so it blends */
          background: #1a1a1a;
          z-index: 500;
          padding: 0 20px;
          gap: 0;
        }

        .topbar-center {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* Pill search bar */
        .topbar-search {
          width: 100%; max-width: 480px;
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.13);
          border-radius: 624px;
          padding: 0 14px; height: 34px;
          cursor: text;
          transition: background .15s, border-color .15s;
        }
        .topbar-search:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.2);
        }

        .topbar-right {
          display: flex; align-items: center;
          justify-content: flex-end; gap: 4px;
        }

        /* ── MAIN CONTENT ─────────────────────────────────────────────── */
        .main-content {
          margin-left: 248px;
          flex: 1;
          min-height: 100vh;
          width: calc(100% - 248px);
          padding-top: 56px;
          /* Light grey content area */
          background: #f1f1f1;
          /* TOP-LEFT corner curved to match sidebar-nav's top-right curve */
          border-radius: 14px 0 0 0;
          /* No border — the curve against black creates the visual separation */
        }

        /* ── MOBILE ───────────────────────────────────────────────────── */
        .mob-topbar { display: none; }
        .overlay { display: none; }
        a { text-decoration: none; color: inherit; }

        @media (max-width: 767px) {
          .desk-topbar { display: none; }
          .sidebar {
            transform: translateX(-100%);
            transition: transform .25s ease;
            width: 270px;
            background: #1a1a1a;
          }
          .sidebar.open {
            transform: translateX(0);
            box-shadow: 4px 0 30px rgba(0,0,0,0.6);
          }
          .main-content {
            margin-left: 0; width: 100%;
            padding-top: 52px;
            border-radius: 0;
          }
          .mob-topbar {
            display: flex; align-items: center; justify-content: space-between;
            padding: 0 16px; height: 52px;
            background: #1a1a1a;
            position: fixed; top: 0; left: 0; right: 0; z-index: 500;
          }
          .overlay {
            display: block; position: fixed; inset: 0;
            background: rgba(0,0,0,0.5); z-index: 350;
          }
        }

        @media (min-width: 768px) and (max-width: 1024px) {
          .sidebar { width: 210px; }
          .desk-topbar { left: 210px; }
          .main-content { margin-left: 210px; width: calc(100% - 210px); }
        }
      `}</style>

      <div className="layout-wrap">
        {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar${menuOpen ? ' open' : ''}`}>
          {/* Black header — wordmark on dark bg */}
          <div className="sidebar-topbar">
            <span style={{
              color: '#ffffff', fontWeight: 750, fontSize: '1rem',
              letterSpacing: '-0.03em', fontFamily: P.font,
            }}>Onshipy</span>
          </div>
          {/* White nav card with curved top corners */}
          <div className="sidebar-nav">
            <SidebarContent />
          </div>
        </aside>

        {/* ── DESKTOP TOPBAR ── */}
        <div className="desk-topbar">
          <div className="topbar-center">
            <div className="topbar-search">
              <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span style={{ fontSize: P.fontSize, color: 'rgba(255,255,255,0.38)', flex: 1, letterSpacing: P.letterSpacing }}>Search</span>
              <div style={{ display: 'flex', gap: 2 }}>
                <kbd style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.22)', background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: 3, fontFamily: P.font }}>CTRL</kbd>
                <kbd style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.22)', background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: 3, fontFamily: P.font }}>K</kbd>
              </div>
            </div>
          </div>
          <div className="topbar-right">
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.55)', display: 'flex', padding: 8, borderRadius: 8 }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
              title="Notifications"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
            </button>
            <div onClick={() => router.push('/settings')} style={{
              width: 30, height: 30, background: P.green, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: '700', fontSize: 11, cursor: 'pointer',
              border: '2px solid rgba(255,255,255,0.15)',
            }}>
              {initials}
            </div>
          </div>
        </div>

        {/* ── MOBILE TOPBAR ── */}
        <header className="mob-topbar">
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', padding: 6, display: 'flex' }}>
            {menuOpen
              ? <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              : <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            }
          </button>
          <span style={{ color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: '-0.02em' }}>Onshipy</span>
          <div onClick={() => router.push('/settings')} style={{ width: 30, height: 30, background: P.green, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
            {initials}
          </div>
        </header>

        {/* ── MAIN CONTENT ── */}
        <main className="main-content">{children}</main>
      </div>
    </>
  );
}