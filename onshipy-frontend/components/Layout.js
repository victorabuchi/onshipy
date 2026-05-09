import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import {
  HomeIcon as PIHome,
  OrderIcon as PIOrder,
  ProductIcon as PIProduct,
  PersonIcon as PIPerson,
  ListBulletedIcon as PIList,
  ChartVerticalIcon as PIChart,
  SearchIcon as PISearch,
  StoreOnlineIcon as PIStore,
  SettingsIcon as PISettings,
} from '@shopify/polaris-icons';

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

const NOTIFICATIONS = [
  { id: 1, type: 'update', title: 'Moms deserve more than one day', desc: 'Create gifts that sell beyond May 10', time: '3 weeks ago', read: false },
  { id: 2, type: 'update', title: 'Videos on a budget [LIVE]', desc: 'Lighting, styling, and editing tips for better product vid...', time: '1 month ago', read: false },
];

export default function Layout({ children, title }) {
  const router = useRouter();
  const [seller, setSeller]     = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [avatarModal, setAvatarModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifTab, setNotifTab] = useState('all');
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const tabsScrollRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // All searchable pages/sections
  const SearchIcon = ({ icon: Icon }) => (
    <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', color: 'rgba(97,97,97,1)' }}>
      <Icon width={18} height={18} fill="rgba(97,97,97,1)" />
    </span>
  );

  const SEARCH_ITEMS = [
    { label: 'Home',             desc: 'Dashboard overview',          href: '/dashboard',                  icon: PIHome },
    { label: 'Orders',           desc: 'Manage your orders',          href: '/orders',                     icon: PIOrder },
    { label: 'Products',         desc: 'Import and manage products',  href: '/products',                   icon: PIProduct },
    { label: 'Inventory',        desc: 'Track product inventory',     href: '/products?section=inventory', icon: PIList },
    { label: 'Customers',        desc: 'View customer accounts',      href: '/customers',                  icon: PIPerson },
    { label: 'Listings',         desc: 'Your priced product listings',href: '/listings',                   icon: PIList },
    { label: 'Analytics',        desc: 'Sales and performance data',  href: '/analytics',                  icon: PIChart },
    { label: 'Browse',           desc: 'Discover brands to resell',   href: '/browse',                     icon: PISearch },
    { label: 'Online Store',     desc: 'Connect your Shopify store',  href: '/online-store',               icon: PIStore },
    { label: 'Settings',         desc: 'Store settings',              href: '/settings',                   icon: PISettings },
    { label: 'General settings', desc: 'Store name, email, URL',      href: '/settings?section=general',   icon: PISettings },
    { label: 'Plan & billing',   desc: 'Upgrade your plan',           href: '/settings?section=plan',      icon: PISettings },
    { label: 'Domains',          desc: 'Manage your domains',         href: '/settings?section=domains',   icon: PIStore },
    { label: 'Notifications',    desc: 'Email notification settings', href: '/settings?section=notifications', icon: PISettings },
    { label: 'Security',         desc: 'Password and sessions',       href: '/settings?section=security',  icon: PISettings },
    { label: 'Payments',         desc: 'Payment providers',           href: '/settings?section=payments',  icon: PISettings },
    { label: 'Users',            desc: 'Your profile',                href: '/settings?section=users',     icon: PIPerson },
    { label: 'Policies',         desc: 'Store policies',              href: '/settings?section=policies',  icon: PIList },
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

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const s = localStorage.getItem('onshipy_seller');
    if (s) { try { setSeller(JSON.parse(s)); } catch {} }
  }, []);

  useEffect(() => { setMenuOpen(false); setProfile(false); setNotifOpen(false); }, [router.pathname]);

  useEffect(() => {
    const fn = e => {
      // Close only if click is completely outside the avatar button AND the dropdown portal
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        // Check if click is inside the portal dropdown (by id)
        const portal = document.getElementById('profile-dropdown-portal');
        if (!portal || !portal.contains(e.target)) {
          setProfile(false);
        }
      }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    const fn = e => {
      const portal = document.getElementById('notif-dropdown-portal');
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        if (!portal || !portal.contains(e.target)) setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifs = notifTab === 'all'
    ? notifications
    : notifications.filter(n => {
        if (notifTab === 'updates') return n.type === 'update';
        if (notifTab === 'orders')  return n.type === 'order';
        if (notifTab === 'account') return n.type === 'account';
        return true;
      });

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

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
    { href: '/wallet', label: 'Wallet' },
  ];

  const icons = {
    '/dashboard':    <PIHome    width={18} height={18} fill="currentColor" />,
    '/orders':       <PIOrder   width={18} height={18} fill="currentColor" />,
    '/products':     <PIProduct width={18} height={18} fill="currentColor" />,
    '/customers':    <PIPerson  width={18} height={18} fill="currentColor" />,
    '/listings':     <PIList    width={18} height={18} fill="currentColor" />,
    '/analytics':    <PIChart   width={18} height={18} fill="currentColor" />,
    '/browse':       <PISearch  width={18} height={18} fill="currentColor" />,
    '/online-store': <PIStore   width={18} height={18} fill="currentColor" />,
    '/wallet':       <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M4.5 4A2.5 2.5 0 0 0 2 6.5V8h16V6.5A2.5 2.5 0 0 0 15.5 4h-11ZM18 9.5H2v4A2.5 2.5 0 0 0 4.5 16h11A2.5 2.5 0 0 0 18 13.5v-4Zm-5.5 2a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"/></svg>,
    '/settings':     <PISettings width={18} height={18} fill="currentColor" />,
  };

  const initials = seller?.full_name
    ? seller.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const NavItem = ({ item }) => {
    const isActive = router.pathname === item.href ||
      (item.href !== '/dashboard' && router.pathname.startsWith(item.href));
    const showSub = isActive && item.sub?.length > 0;
    return (
      <div
        style={{
          borderRadius: 10,
          background: isActive ? '#fff' : 'transparent',
          border: isActive ? '1px solid rgba(0,0,0,0.09)' : '1px solid transparent',
          boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          marginBottom: 2,
          transition: 'background .1s',
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
      >
        <Link href={item.href} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 10px',
          color: isActive ? P.text : P.textSubdued,
          textDecoration: 'none', fontSize: P.fontSize,
          fontWeight: isActive ? '600' : P.fontWeight,
          letterSpacing: P.letterSpacing,
          borderRadius: 10,
        }}>
          <span style={{ flexShrink: 0, color: isActive ? P.text : P.textSubdued, display: 'flex' }}>{icons[item.href]}</span>
          {item.label}
        </Link>
        {showSub && (
          <div style={{ marginLeft: 26, paddingBottom: 4 }}>
            {item.sub.map(s => {
              const subActive = router.asPath === s.href ||
                (router.query.section && `?section=${router.query.section}` === s.href.split('?')[1]);
              return (
                <Link key={s.href} href={s.href} style={{
                  display: 'block', padding: '4px 10px', borderRadius: 6, marginBottom: 1,
                  fontSize: P.fontSize, color: subActive ? P.text : P.textSubdued,
                  fontWeight: subActive ? '600' : P.fontWeight,
                  textDecoration: 'none', letterSpacing: P.letterSpacing,
                  background: subActive ? 'rgba(0,0,0,0.06)' : 'transparent', transition: 'background .1s, color .1s',
                }}
                  onMouseEnter={e => { if (!subActive) { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = P.text; }}}
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

  // Profile dropdown — attaches to topbar avatar (top RIGHT)
  const ProfileDropdown = () => (
    <div ref={profileRef} style={{ position: 'relative' }}>
      {/* Avatar button in topbar */}
      <button
        onClick={() => setProfile(!profileOpen)}
        style={{
          width: 30, height: 30, background: avatarUrl ? 'transparent' : P.green, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: '700', fontSize: 11, cursor: 'pointer',
          border: '2px solid rgba(255,255,255,0.2)', marginLeft: 4,
          outline: 'none', fontFamily: P.font, overflow: 'hidden', padding: 0,
        }}
      >
        {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}/> : initials}
      </button>

      {/* Avatar upload modal */}
      {avatarModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 650, color: P.text, margin: 0 }}>Profile photo</h2>
              <button onClick={() => setAvatarModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: P.textSubdued, padding: 4, display: 'flex' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <p style={{ fontSize: P.fontSize, color: P.textSubdued, marginBottom: 20, lineHeight: 1.6 }}>
              Upload a profile photo. Minimum 512×512 pixels recommended.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, background: avatarUrl ? 'transparent' : P.green, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, flexShrink: 0, overflow: 'hidden', border: `2px solid ${P.border}` }}>
                {avatarUrl ? <img src={avatarUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : initials}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <label style={{ padding: '7px 14px', background: '#fff', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, cursor: 'pointer', color: P.text }}>
                  Upload photo
                  <input type="file" accept="image/png,image/jpg,image/jpeg,image/webp,image/svg+xml" style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) setAvatarUrl(URL.createObjectURL(file));
                    }}
                  />
                </label>
                {avatarUrl && (
                  <button onClick={() => setAvatarUrl(null)} style={{ padding: '7px 14px', background: '#fff', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, cursor: 'pointer', color: '#d82c0d', fontFamily: P.font }}>
                    Remove
                  </button>
                )}
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: P.textSubdued, marginBottom: 20 }}>PNG, JPG, WEBP, or SVG. Minimum 512×512 pixels recommended.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 16, borderTop: `1px solid ${P.border}` }}>
              <button onClick={() => setAvatarModal(false)} style={{ padding: '8px 18px', background: '#fff', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, cursor: 'pointer', fontFamily: P.font, color: P.text }}>Cancel</button>
              <button onClick={() => setAvatarModal(false)} style={{ padding: '8px 18px', background: P.text, color: '#fff', border: 'none', borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, cursor: 'pointer', fontFamily: P.font }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const SidebarNav = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px 0', scrollbarWidth: 'none' }}>
        {mainNav.map(item => <NavItem key={item.href} item={item} />)}
        <SectionLabel label="Sales channels" />
        {salesNav.map(item => <NavItem key={item.href} item={item} />)}
        <SectionLabel label="Account" />
        {accountNav.map(item => <NavItem key={item.href} item={item} />)}
        <div style={{ height: 8 }} />
      </div>
      <div style={{ padding: '0 8px 8px', flexShrink: 0 }}>
        <NavItem item={{ href: '/settings', label: 'Settings' }} />
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>{title ? `${title} | Onshipy` : 'Onshipy'}</title>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html {
          background: #1a1a1a;
        }
        body {
          font-family: ${P.font};
          font-size: ${P.fontSize};
          line-height: ${P.lineHeight};
          font-weight: ${P.fontWeight};
          letter-spacing: ${P.letterSpacing};
          color: ${P.text};
          background: #1a1a1a;
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
          width: ${SIDEBAR_W}px; background: #e3e3e3;
          border-right: 1px solid ${P.border};
          border-top-left-radius: 10px;
          z-index: 400; display: flex; flex-direction: column; overflow: hidden;
        }
        .main-content {
          margin-left: ${SIDEBAR_W}px; margin-top: ${TOPBAR_H}px;
          min-height: calc(100vh - ${TOPBAR_H}px); background: ${P.bg};
          border-top-right-radius: 10px;
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
          .main-content { margin-left: 0; margin-top: 52px; width: 100%; border-top-right-radius: 0; }
        }

        @media (min-width: 768px) and (max-width: 1024px) {
          .topbar-logo { width: 210px; }
          .sidebar { width: 210px; }
          .main-content { margin-left: 210px; }
        }
      `}</style>

      {/* ── DESKTOP TOPBAR ── */}
      <header className="topbar">
        {/* Brand logo + name on left — goes to dashboard or refreshes if already there */}
        <div className="topbar-logo" onClick={() => router.pathname === '/dashboard' ? router.reload() : router.push('/dashboard')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/favicon-32x32.png" alt="Onshipy" width={20} height={20} style={{ filter: 'brightness(0) invert(1)', flexShrink: 0, display: 'block' }} />
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.0625rem', letterSpacing: '-0.02em', fontFamily: '"Space Grotesk", sans-serif' }}>Onshipy</span>
          </div>
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
                  <SearchIcon icon={item.icon}/>
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
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setNotifOpen(o => !o)}
              style={{ background: notifOpen ? 'rgba(255,255,255,0.08)' : 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', padding: 8, borderRadius: 8, position: 'relative' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => { if (!notifOpen) e.currentTarget.style.background = 'none'; }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: 5, right: 5, background: '#d82c0d', color: '#fff', borderRadius: '50%', width: 14, height: 14, fontSize: '0.5625rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, fontFamily: P.font }}>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
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

      {/* Notification dropdown portal */}
      {mounted && notifOpen && createPortal(
        <div id="notif-dropdown-portal" style={{
          position: 'fixed', top: TOPBAR_H + 8, right: 60,
          width: 400, background: '#fff', borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)', border: `1px solid ${P.border}`,
          zIndex: 99999, overflow: 'hidden', fontFamily: P.font,
        }}>
          {/* Header */}
          <div style={{ padding: '14px 16px 12px', borderBottom: `1px solid ${P.border}` }}>
            <div style={{ fontSize: '0.9375rem', fontWeight: 650, color: P.text }}>Notifications</div>
          </div>

          {/* Tabs with scroll arrows */}
          <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: `1px solid ${P.border}` }}>
            <button
              onClick={() => tabsScrollRef.current?.scrollBy({ left: -120, behavior: 'smooth' })}
              style={{ padding: '0 8px', background: 'none', border: 'none', borderRight: `1px solid ${P.border}`, cursor: 'pointer', color: P.textSubdued, flexShrink: 0, display: 'flex', alignItems: 'center' }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div ref={tabsScrollRef} style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', flex: 1 }}>
              {[
                { key: 'all',     label: 'All' },
                { key: 'updates', label: 'Updates', badge: unreadCount || null },
                { key: 'orders',  label: 'Orders & Products' },
                { key: 'account', label: 'Account' },
              ].map(tab => (
                <button key={tab.key} onClick={() => setNotifTab(tab.key)} style={{
                  padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: P.fontSize, color: notifTab === tab.key ? P.text : P.textSubdued,
                  fontWeight: notifTab === tab.key ? 600 : 400,
                  borderBottom: notifTab === tab.key ? `2px solid ${P.text}` : '2px solid transparent',
                  whiteSpace: 'nowrap', fontFamily: P.font, flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: 5, marginBottom: -1,
                }}>
                  {tab.label}
                  {tab.badge > 0 && (
                    <span style={{ background: '#d82c0d', color: '#fff', borderRadius: 10, padding: '1px 5px', fontSize: '0.625rem', fontWeight: 700, lineHeight: 1.5 }}>{tab.badge}</span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => tabsScrollRef.current?.scrollBy({ left: 120, behavior: 'smooth' })}
              style={{ padding: '0 8px', background: 'none', border: 'none', borderLeft: `1px solid ${P.border}`, cursor: 'pointer', color: P.textSubdued, flexShrink: 0, display: 'flex', alignItems: 'center' }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          {/* Notification items */}
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {filteredNotifs.length === 0 ? (
              <div style={{ padding: '40px 16px', textAlign: 'center', color: P.textSubdued, fontSize: P.fontSize }}>
                No notifications in this category
              </div>
            ) : filteredNotifs.map((notif, i) => (
              <div key={notif.id}
                onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))}
                style={{ padding: '14px 16px', borderBottom: i < filteredNotifs.length - 1 ? `1px solid ${P.border}` : 'none', cursor: 'pointer', background: notif.read ? 'transparent' : '#fafafa', transition: 'background .1s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f3f3f3'}
                onMouseLeave={e => e.currentTarget.style.background = notif.read ? 'transparent' : '#fafafa'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="#d82c0d"><path d="M6.5 0l1.2 3.8H11l-2.7 2 1 3.3L6.5 7 3.7 9.1l1-3.3L2 3.8h3.3z"/></svg>
                    <span style={{ fontSize: '0.75rem', color: '#d82c0d', fontWeight: 600 }}>
                      {notif.type === 'update' ? 'Updates' : notif.type === 'order' ? 'Orders & Products' : 'Account'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: P.textSubdued }}>{notif.time}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  {!notif.read && <span style={{ color: '#d82c0d', fontSize: 7, marginTop: 5, flexShrink: 0 }}>●</span>}
                  <div>
                    <div style={{ fontSize: P.fontSize, fontWeight: 600, color: P.text, marginBottom: 2 }}>{notif.title}</div>
                    <div style={{ fontSize: '0.75rem', color: P.textSubdued, lineHeight: 1.5 }}>{notif.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 16px', borderTop: `1px solid ${P.border}` }}>
            <button
              onClick={() => {}}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: P.fontSize, color: P.green, fontFamily: P.font, padding: 0, fontWeight: 500 }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
            >
              See all notifications
            </button>
            <button
              onClick={markAllRead}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: P.fontSize, color: P.green, fontFamily: P.font, padding: 0, fontWeight: 500 }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
            >
              Mark all as read
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Profile dropdown — inlined portal, NOT a sub-component */}
      {mounted && profileOpen && createPortal(
        <div id="profile-dropdown-portal" style={{
          position: 'fixed', top: TOPBAR_H + 8, right: 14,
          width: 268, background: '#fff', borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)', border: '1px solid rgba(227,227,227,1)',
          zIndex: 99999,
        }}>
          <div style={{ padding: '12px 14px', background: '#f7f7f7', borderBottom: '1px solid rgba(227,227,227,1)', borderRadius: '12px 12px 0 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                onMouseDown={e => { e.preventDefault(); setProfile(false); setAvatarModal(true); }}
                style={{ width: 38, height: 38, background: avatarUrl ? 'transparent' : P.green, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0, cursor: 'pointer', overflow: 'hidden' }}
              >
                {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : initials}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '0.8125rem', color: 'rgba(48,48,48,1)' }}>{seller?.full_name || 'User'}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(97,97,97,1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seller?.email}</div>
                <span
                  onMouseDown={e => { e.preventDefault(); setProfile(false); router.push('/settings?section=plan'); }}
                  style={{ fontSize: '0.6875rem', color: '#008060', fontWeight: '700', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer', display: 'inline-block' }}
                >{seller?.plan || 'free'} plan</span>
              </div>
            </div>
          </div>
          {[
            { label: 'Your profile',   href: '/settings?section=users' },
            { label: 'Store settings', href: '/settings' },
            { label: 'Billing & plan', href: '/settings?section=plan' },
            { label: 'Create store',   href: '/online-store' },
          ].map((item, i, arr) => (
            <div key={i}
              onMouseDown={e => { e.preventDefault(); setProfile(false); router.push(item.href); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', fontSize: '0.8125rem', color: 'rgba(48,48,48,1)', borderBottom: i < arr.length - 1 ? '1px solid rgba(227,227,227,1)' : 'none', cursor: 'pointer', userSelect: 'none', background: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f7f7f7'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span>{item.label}</span>
              <svg width="12" height="12" fill="none" stroke="rgba(97,97,97,1)" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(227,227,227,1)' }}>
            <div
              onMouseDown={e => { e.preventDefault(); setProfile(false); handleLogout(); }}
              style={{ padding: '11px 14px', fontSize: '0.8125rem', color: '#d82c0d', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: 8, borderRadius: '0 0 12px 12px', userSelect: 'none', background: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fff4f4'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Log out
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}