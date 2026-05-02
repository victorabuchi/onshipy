import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

const P = {
  bg:            '#f1f1f1',
  surface:       '#ffffff',
  border:        'rgba(227,227,227,1)',
  text:          'rgba(48,48,48,1)',
  textSubdued:   'rgba(97,97,97,1)',
  green:         '#008060',
  font:          '"Inter var","Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
  fontSize:      '0.8125rem',
  lineHeight:    '1.25rem',
  fontWeight:    '450',
  letterSpacing: '-0.00833em',
};

const SIDEBAR_W = 248;
const TOPBAR_H  = 56;

export default function Layout({ children, title }) {
  const router = useRouter();
  const [seller, setSeller]     = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfile] = useState(false);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // All searchable pages/sections
  // Polaris SVG icons for search results (no emojis)
  const SearchIcon = ({ path }) => (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="rgba(97,97,97,1)" style={{ flexShrink: 0 }}>
      <path d={path}/>
    </svg>
  );
  const ICON_HOME    = "M6.5 3A3.5 3.5 0 0 0 3 6.5v7A3.5 3.5 0 0 0 6.5 17h7a3.5 3.5 0 0 0 3.5-3.5v-7A3.5 3.5 0 0 0 13.5 3h-7Z";
  const ICON_ORDER   = "M7.5 3.5a.75.75 0 0 0-1.5 0v.75H4.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-11a1 1 0 0 0-1-1H14V3.5a.75.75 0 0 0-1.5 0v.75h-5V3.5Z";
  const ICON_PRODUCT = "M10.4 2.143a1 1 0 0 0-.8 0l-7 3.11A1 1 0 0 0 2 6.167V13.833a1 1 0 0 0 .6.924l7 3.11a1 1 0 0 0 .8 0l7-3.11A1 1 0 0 0 18 13.833V6.167a1 1 0 0 0-.6-.924l-7-3.11Z";
  const ICON_PERSON  = "M13 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-1.5 0a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0ZM10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2ZM3.5 10a6.5 6.5 0 1 1 11.573 4.089c-.46-.707-1.197-1.323-2.183-1.768C11.862 11.814 10.963 11.5 10 11.5s-1.862.314-2.89.821c-.986.445-1.723 1.06-2.183 1.768A6.476 6.476 0 0 1 3.5 10Z";
  const ICON_LIST    = "M3.25 4a.75.75 0 0 0 0 1.5h13.5a.75.75 0 0 0 0-1.5H3.25ZM3.25 8a.75.75 0 0 0 0 1.5h13.5a.75.75 0 0 0 0-1.5H3.25ZM3.25 12a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z";
  const ICON_CHART   = "M4.5 12.25a.75.75 0 0 1 .75.75v3.25a.75.75 0 0 1-1.5 0V13a.75.75 0 0 1 .75-.75ZM10 8.5a.75.75 0 0 1 .75.75v7a.75.75 0 0 1-1.5 0V9.25A.75.75 0 0 1 10 8.5ZM15.5 4.5a.75.75 0 0 1 .75.75v11a.75.75 0 0 1-1.5 0v-11a.75.75 0 0 1 .75-.75Z";
  const ICON_SEARCH  = "M8.5 3a5.5 5.5 0 1 0 3.17 9.98l3.674 3.675a.75.75 0 1 0 1.06-1.06L12.731 12.23A5.5 5.5 0 0 0 8.5 3Zm-4 5.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z";
  const ICON_STORE   = "M3.5 4A1.5 1.5 0 0 0 2 5.5v9A1.5 1.5 0 0 0 3.5 16h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 16.5 4h-13Z";
  const ICON_WALLET  = "M2 5.5A2.5 2.5 0 0 1 4.5 3h11A2.5 2.5 0 0 1 18 5.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 2 14.5v-9Z";
  const ICON_SETTING = "M11.013 2.513a1.75 1.75 0 0 0-2.027 0l-1.5 1.134a1.75 1.75 0 0 1-.59.28l-1.84.44a1.75 1.75 0 0 0-1.433 1.79l.065 1.9a1.75 1.75 0 0 1-.165.67l-.8 1.7a1.75 1.75 0 0 0 .492 2.21l1.49 1.147a1.75 1.75 0 0 1 .485.572l.84 1.716a1.75 1.75 0 0 0 2.127.817l1.78-.608a1.75 1.75 0 0 1 1.13 0l1.78.608a1.75 1.75 0 0 0 2.127-.817l.84-1.716a1.75 1.75 0 0 1 .485-.572l1.49-1.147a1.75 1.75 0 0 0 .492-2.21l-.8-1.7a1.75 1.75 0 0 1-.165-.67l.065-1.9a1.75 1.75 0 0 0-1.434-1.79l-1.84-.44a1.75 1.75 0 0 1-.59-.28l-1.499-1.134ZM10 7.25a2.75 2.75 0 1 0 0 5.5 2.75 2.75 0 0 0 0-5.5Z";

  const SEARCH_ITEMS = [
    { label: 'Home', desc: 'Dashboard overview', href: '/dashboard', icon: ICON_HOME },
    { label: 'Orders', desc: 'Manage your orders', href: '/orders', icon: ICON_ORDER },
    { label: 'Products', desc: 'Import and manage products', href: '/products', icon: ICON_PRODUCT },
    { label: 'Inventory', desc: 'Track product inventory', href: '/products?section=inventory', icon: ICON_LIST },
    { label: 'Customers', desc: 'View customer accounts', href: '/customers', icon: ICON_PERSON },
    { label: 'Listings', desc: 'Your priced product listings', href: '/listings', icon: ICON_LIST },
    { label: 'Analytics', desc: 'Sales and performance data', href: '/analytics', icon: ICON_CHART },
    { label: 'Browse', desc: 'Discover brands to resell', href: '/browse', icon: ICON_SEARCH },
    { label: 'Online Store', desc: 'Connect your Shopify store', href: '/online-store', icon: ICON_STORE },
    { label: 'Wallet', desc: 'Billing and payments', href: '/wallet', icon: ICON_WALLET },
    { label: 'Settings', desc: 'Store settings', href: '/settings', icon: ICON_SETTING },
    { label: 'General settings', desc: 'Store name, email, URL', href: '/settings?section=general', icon: ICON_SETTING },
    { label: 'Plan & billing', desc: 'Upgrade your plan', href: '/settings?section=plan', icon: ICON_WALLET },
    { label: 'Domains', desc: 'Manage your domains', href: '/settings?section=domains', icon: ICON_STORE },
    { label: 'Notifications', desc: 'Email notification settings', href: '/settings?section=notifications', icon: ICON_SETTING },
    { label: 'Security', desc: 'Password and sessions', href: '/settings?section=security', icon: ICON_SETTING },
    { label: 'Payments', desc: 'Payment providers', href: '/settings?section=payments', icon: ICON_WALLET },
    { label: 'Users', desc: 'Your profile', href: '/settings?section=users', icon: ICON_PERSON },
    { label: 'Policies', desc: 'Store policies', href: '/settings?section=policies', icon: ICON_LIST },
  ];

  const searchResults = searchQuery.length > 0
    ? SEARCH_ITEMS.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  useEffect(() => {
    const fn = e => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    const s = localStorage.getItem('onshipy_seller');
    if (s) { try { setSeller(JSON.parse(s)); } catch {} }
  }, []);

  useEffect(() => { setMenuOpen(false); setProfile(false); }, [router.pathname]);

  useEffect(() => {
    const fn = e => {
      // Use setTimeout so click handlers fire before we close the dropdown
      setTimeout(() => {
        if (profileRef.current && !profileRef.current.contains(e.target)) setProfile(false);
      }, 150);
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
    { href: '/products',  label: 'Products', sub: [
      { href: '/products?section=inventory',       label: 'Inventory' },
      { href: '/products?section=purchase_orders', label: 'Purchase orders' },
      { href: '/products?section=transfers',       label: 'Transfers' },
      { href: '/products?section=gift_cards',      label: 'Gift cards' },
    ]},
    { href: '/customers', label: 'Customers' },
    { href: '/listings',  label: 'Listings' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/browse',    label: 'Browse' },
  ];
  const salesNav   = [{ href: '/online-store', label: 'Online Store' }];
  const accountNav = [
    { href: '/wallet',   label: 'Wallet' },
    { href: '/settings', label: 'Settings' },
  ];

  const icons = {
    '/dashboard':    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M6.5 3A3.5 3.5 0 0 0 3 6.5v7A3.5 3.5 0 0 0 6.5 17h7a3.5 3.5 0 0 0 3.5-3.5v-7A3.5 3.5 0 0 0 13.5 3h-7ZM4.5 6.5A2 2 0 0 1 6.5 4.5h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-7Z"/><path d="M7.5 9.75a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75ZM7.5 12.25a.75.75 0 0 1 .75-.75h2a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1-.75-.75Z"/></svg>,
    '/orders':       <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M7.5 3.5a.75.75 0 0 0-1.5 0v.75H4.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-11a1 1 0 0 0-1-1H14V3.5a.75.75 0 0 0-1.5 0v.75h-5V3.5Z"/></svg>,
    '/products':     <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M10.4 2.143a1 1 0 0 0-.8 0l-7 3.11A1 1 0 0 0 2 6.167V13.833a1 1 0 0 0 .6.924l7 3.11a1 1 0 0 0 .8 0l7-3.11A1 1 0 0 0 18 13.833V6.167a1 1 0 0 0-.6-.924l-7-3.11Z"/></svg>,
    '/customers':    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M13 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-1.5 0a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z"/><path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2ZM3.5 10a6.5 6.5 0 1 1 11.573 4.089c-.46-.707-1.197-1.323-2.183-1.768C11.862 11.814 10.963 11.5 10 11.5s-1.862.314-2.89.821c-.986.445-1.723 1.06-2.183 1.768A6.476 6.476 0 0 1 3.5 10Z"/></svg>,
    '/listings':     <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M3.25 4a.75.75 0 0 0 0 1.5h13.5a.75.75 0 0 0 0-1.5H3.25ZM3.25 8a.75.75 0 0 0 0 1.5h13.5a.75.75 0 0 0 0-1.5H3.25ZM3.25 12a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z"/></svg>,
    '/analytics':    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M4.5 12.25a.75.75 0 0 1 .75.75v3.25a.75.75 0 0 1-1.5 0V13a.75.75 0 0 1 .75-.75ZM10 8.5a.75.75 0 0 1 .75.75v7a.75.75 0 0 1-1.5 0V9.25A.75.75 0 0 1 10 8.5ZM15.5 4.5a.75.75 0 0 1 .75.75v11a.75.75 0 0 1-1.5 0v-11a.75.75 0 0 1 .75-.75Z"/></svg>,
    '/browse':       <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M8.5 3a5.5 5.5 0 1 0 3.17 9.98l3.674 3.675a.75.75 0 1 0 1.06-1.06L12.731 12.23A5.5 5.5 0 0 0 8.5 3Zm-4 5.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"/></svg>,
    '/online-store': <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M3.5 4A1.5 1.5 0 0 0 2 5.5v9A1.5 1.5 0 0 0 3.5 16h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 16.5 4h-13Z"/></svg>,
    '/wallet':       <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5.5A2.5 2.5 0 0 1 4.5 3h11A2.5 2.5 0 0 1 18 5.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 2 14.5v-9Z"/></svg>,
    '/settings':     <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M11.013 2.513a1.75 1.75 0 0 0-2.027 0l-1.5 1.134a1.75 1.75 0 0 1-.59.28l-1.84.44a1.75 1.75 0 0 0-1.433 1.79l.065 1.9a1.75 1.75 0 0 1-.165.67l-.8 1.7a1.75 1.75 0 0 0 .492 2.21l1.49 1.147a1.75 1.75 0 0 1 .485.572l.84 1.716a1.75 1.75 0 0 0 2.127.817l1.78-.608a1.75 1.75 0 0 1 1.13 0l1.78.608a1.75 1.75 0 0 0 2.127-.817l.84-1.716a1.75 1.75 0 0 1 .485-.572l1.49-1.147a1.75 1.75 0 0 0 .492-2.21l-.8-1.7a1.75 1.75 0 0 1-.165-.67l.065-1.9a1.75 1.75 0 0 0-1.434-1.79l-1.84-.44a1.75 1.75 0 0 1-.59-.28l-1.499-1.134ZM10 7.25a2.75 2.75 0 1 0 0 5.5 2.75 2.75 0 0 0 0-5.5Z"/></svg>,
  };

  const initials = seller?.full_name
    ? seller.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const NavItem = ({ item }) => {
    const isActive = router.pathname === item.href ||
      (item.href !== '/dashboard' && router.pathname.startsWith(item.href));
    const showSub = isActive && item.sub?.length > 0;
    return (
      <div>
        <Link href={item.href} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 10px', borderRadius: 8, marginBottom: 1,
          background: isActive ? '#e3e3e3' : 'transparent',
          color: isActive ? P.text : P.textSubdued,
          textDecoration: 'none', fontSize: P.fontSize,
          fontWeight: isActive ? '600' : P.fontWeight,
          letterSpacing: P.letterSpacing, transition: 'background .1s, color .1s',
        }}
          onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#ebebeb'; e.currentTarget.style.color = P.text; }}}
          onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = P.textSubdued; }}}
        >
          <span style={{ flexShrink: 0, color: isActive ? P.text : P.textSubdued, display: 'flex' }}>{icons[item.href]}</span>
          {item.label}
        </Link>
        {showSub && (
          <div style={{ marginLeft: 26, marginBottom: 2 }}>
            {item.sub.map(s => {
              const subActive = router.asPath === s.href ||
                (router.query.section && `?section=${router.query.section}` === s.href.split('?')[1]);
              return (
                <Link key={s.href} href={s.href} style={{
                  display: 'block', padding: '4px 10px', borderRadius: 6, marginBottom: 1,
                  fontSize: P.fontSize, color: subActive ? P.text : P.textSubdued,
                  fontWeight: subActive ? '600' : P.fontWeight,
                  textDecoration: 'none', letterSpacing: P.letterSpacing,
                  background: subActive ? '#e3e3e3' : 'transparent', transition: 'background .1s, color .1s',
                }}
                  onMouseEnter={e => { if (!subActive) { e.currentTarget.style.background = '#ebebeb'; e.currentTarget.style.color = P.text; }}}
                  onMouseLeave={e => { if (!subActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = P.textSubdued; }}}
                >{s.label}</Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const SectionLabel = ({ label }) => (
    <div style={{ fontSize: '0.6875rem', fontWeight: '600', color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 10px 3px' }}>
      {label}
    </div>
  );

  const Divider = () => <div style={{ height: 1, background: P.border, margin: '6px 0' }} />;

  // Profile dropdown — attaches to topbar avatar (top RIGHT)
  const ProfileDropdown = () => (
    <div ref={profileRef} style={{ position: 'relative' }}>
      {/* Avatar button in topbar */}
      <button
        onClick={() => setProfile(!profileOpen)}
        style={{
          width: 30, height: 30, background: P.green, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: '700', fontSize: 11, cursor: 'pointer',
          border: '2px solid rgba(255,255,255,0.2)', marginLeft: 4,
          outline: 'none', fontFamily: P.font,
        }}
      >
        {initials}
      </button>

      {/* Dropdown — fixed position, top-right, fully clickable */}
      {profileOpen && (
        <div style={{
          position: 'fixed', top: TOPBAR_H + 8, right: 14,
          width: 260, background: P.surface, borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)', border: `1px solid ${P.border}`,
          zIndex: 9999, overflow: 'visible', pointerEvents: 'auto',
        }}>
          {/* User info header */}
          <div style={{ padding: '12px 14px', background: '#f7f7f7', borderBottom: `1px solid ${P.border}`, borderRadius: '12px 12px 0 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, background: P.green, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{initials}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: '600', fontSize: P.fontSize, color: P.text }}>{seller?.full_name || 'User'}</div>
                <div style={{ fontSize: '0.75rem', color: P.textSubdued, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seller?.email}</div>
                <div style={{ fontSize: '0.6875rem', color: P.green, fontWeight: '600', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{seller?.plan || 'free'} plan</div>
              </div>
            </div>
          </div>

          {/* Menu items — using div+onClick for guaranteed clickability */}
          {[
            { label: 'Your profile',   href: '/settings?section=users' },
            { label: 'Store settings', href: '/settings' },
            { label: 'Billing & plan', href: '/settings?section=plan' },
          ].map((item, i) => (
            <div key={i}
              onClick={() => { setProfile(false); router.push(item.href); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 14px', fontSize: P.fontSize, color: P.text,
                borderBottom: `1px solid ${P.border}`, cursor: 'pointer',
                pointerEvents: 'auto', userSelect: 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f7f7f7'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span>{item.label}</span>
              <svg width="12" height="12" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          ))}
          <div
            onClick={() => { setProfile(false); handleLogout(); }}
            style={{
              padding: '11px 14px', fontSize: P.fontSize, color: '#d82c0d', cursor: 'pointer',
              fontWeight: '500', display: 'flex', alignItems: 'center', gap: 8,
              borderRadius: '0 0 12px 12px', pointerEvents: 'auto', userSelect: 'none',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#fff4f4'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Log out
          </div>
        </div>
      )}
    </div>
  );

  // Sidebar nav — profile at BOTTOM (just name+email display, like Shopify image 4)
  const SidebarNav = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Scrollable nav */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px 0', scrollbarWidth: 'none' }}>
        {mainNav.map(item => <NavItem key={item.href} item={item} />)}
        <Divider />
        <SectionLabel label="Sales channels" />
        {salesNav.map(item => <NavItem key={item.href} item={item} />)}
        <Divider />
        <SectionLabel label="Account" />
        {accountNav.map(item => <NavItem key={item.href} item={item} />)}
        <div style={{ height: 8 }} />
      </div>


    </div>
  );

  return (
    <>
      <Head>
        <title>{title ? `${title} — Onshipy` : 'Onshipy'}</title>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
          font-family: ${P.font};
          font-size: ${P.fontSize};
          line-height: ${P.lineHeight};
          font-weight: ${P.fontWeight};
          letter-spacing: ${P.letterSpacing};
          color: ${P.text};
          background: ${P.bg};
          min-height: 100vh;
          overflow-x: hidden;
          max-width: 100vw;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        a { text-decoration: none; color: inherit; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #c9cccf; border-radius: 4px; }

        .topbar {
          position: fixed; top: 0; left: 0; right: 0;
          height: ${TOPBAR_H}px; background: #1a1a1a;
          z-index: 500; display: flex; align-items: center; padding: 0;
        }
        .topbar-logo {
          width: ${SIDEBAR_W}px; flex-shrink: 0;
          padding: 0 16px; display: flex; align-items: center;
        }
        .topbar-search-wrap {
          flex: 1; display: flex; justify-content: center;
          padding: 0 16px; min-width: 0;
        }
        .topbar-search {
          width: 100%; max-width: 480px;
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.13);
          border-radius: 624px; padding: 0 14px; height: 34px; cursor: text;
        }
        .topbar-actions {
          display: flex; align-items: center; gap: 4px;
          padding: 0 16px; flex-shrink: 0;
        }
        .sidebar {
          position: fixed; top: ${TOPBAR_H}px; left: 0; bottom: 0;
          width: ${SIDEBAR_W}px; background: ${P.surface};
          border-right: 1px solid ${P.border};
          z-index: 400; display: flex; flex-direction: column; overflow: hidden;
        }
        .main-content {
          margin-left: ${SIDEBAR_W}px; padding-top: ${TOPBAR_H}px;
          min-height: 100vh; background: ${P.bg};
          min-width: 0; overflow-x: hidden;
        }
        .mob-topbar { display: none; }
        .overlay { display: none; }

        @media (max-width: 767px) {
          .topbar { display: none; }
          .mob-topbar {
            display: flex; align-items: center;
            padding: 0 12px; height: 52px; gap: 0;
            background: #1a1a1a;
            position: fixed; top: 0; left: 0; right: 0; z-index: 500;
          }
          .sidebar {
            top: 0; width: 280px;
            transform: translateX(-100%);
            transition: transform .25s ease; z-index: 600;
          }
          .sidebar.open { transform: translateX(0); box-shadow: 4px 0 30px rgba(0,0,0,0.3); }
          .overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 550; }
          .main-content { margin-left: 0; padding-top: 52px; width: 100%; }
        }

        @media (min-width: 768px) and (max-width: 1024px) {
          .topbar-logo { width: 210px; }
          .sidebar { width: 210px; }
          .main-content { margin-left: 210px; }
        }
      `}</style>

      {/* ── DESKTOP TOPBAR ── */}
      <header className="topbar">
        {/* "Onshipy" text on left — clicking goes to dashboard */}
        <div className="topbar-logo" onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer' }}>
          <span style={{ color: '#fff', fontWeight: 750, fontSize: '1rem', letterSpacing: '-0.03em', fontFamily: P.font }}>Onshipy</span>
        </div>
        <div className="topbar-search-wrap" ref={searchRef} style={{ position: 'relative' }}>
          <div className="topbar-search" onClick={() => setSearchOpen(true)}>
            <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search pages, settings..."
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: P.fontSize, color: '#fff', fontFamily: P.font, letterSpacing: P.letterSpacing }}
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSearchOpen(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 2, display: 'flex' }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
            {!searchQuery && <div style={{ display: 'flex', gap: 2 }}>
              <kbd style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.22)', background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: 3, fontFamily: P.font }}>CTRL</kbd>
              <kbd style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.22)', background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: 3, fontFamily: P.font }}>K</kbd>
            </div>}
          </div>
          {/* Search results dropdown */}
          {searchOpen && searchResults.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6, background: P.surface, borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.15)', border: `1px solid ${P.border}`, overflow: 'hidden', zIndex: 800 }}>
              {searchResults.map((item, i) => (
                <div key={i} onClick={() => { router.push(item.href); setSearchQuery(''); setSearchOpen(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', borderBottom: i < searchResults.length - 1 ? `1px solid ${P.border}` : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f7f7f7'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <SearchIcon path={item.icon}/>
                  <div>
                    <div style={{ fontSize: P.fontSize, fontWeight: 500, color: P.text }}>{item.label}</div>
                    <div style={{ fontSize: '0.75rem', color: P.textSubdued }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {searchOpen && searchQuery && searchResults.length === 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6, background: P.surface, borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.15)', border: `1px solid ${P.border}`, padding: '16px 14px', zIndex: 800, fontSize: P.fontSize, color: P.textSubdued }}>
              No results for "{searchQuery}"
            </div>
          )}
        </div>
        {/* Actions — notification + profile avatar (profile dropdown top-right) */}
        <div className="topbar-actions">
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.55)', display: 'flex', padding: 8, borderRadius: 8 }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
          </button>
          {/* Profile avatar — opens dropdown from top-right */}
          <ProfileDropdown />
        </div>
      </header>

      {/* ── MOBILE TOPBAR ── */}
      <header className="mob-topbar">
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', padding: 6, display: 'flex', flexShrink: 0 }}>
          {menuOpen
            ? <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            : <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          }
        </button>
        <div style={{ flex: 1, margin: '0 10px', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 624, padding: '0 12px', height: 34 }}>
          <svg width="13" height="13" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)' }}>Search</span>
        </div>
        <ProfileDropdown />
      </header>

      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}

      <aside className={`sidebar${menuOpen ? ' open' : ''}`}>
        <SidebarNav />
      </aside>

      <main className="main-content">{children}</main>
    </>
  );
}