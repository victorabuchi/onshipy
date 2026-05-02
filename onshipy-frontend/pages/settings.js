import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/router';
import Head from 'next/head';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const P = {
  bg: '#f1f1f1', surface: '#fff', border: 'rgba(227,227,227,1)',
  text: 'rgba(48,48,48,1)', textSubdued: 'rgba(97,97,97,1)',
  green: '#008060', font: '"Inter var","Inter",-apple-system,BlinkMacSystemFont,sans-serif',
  fontSize: '0.8125rem', fontWeight: '450', letterSpacing: '-0.00833em',
};

// Polaris-style SVG icons for each setting section
const ICONS = {
  general:           <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1a9 9 0 1 0 0 18A9 9 0 0 0 10 1Zm0 1.5a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15ZM10 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-.75 3.75a.75.75 0 0 0 0 1.5h.25v3.25h-.25a.75.75 0 0 0 0 1.5h2a.75.75 0 0 0 0-1.5h-.25v-4a.75.75 0 0 0-.75-.75h-1Z"/></svg>,
  plan:              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4Zm2-.5a.5.5 0 0 0-.5.5v12a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V4a.5.5 0 0 0-.5-.5H5ZM7 7.75A.75.75 0 0 1 7.75 7h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 7 7.75Zm0 3A.75.75 0 0 1 7.75 10h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 7 10.75Zm0 3A.75.75 0 0 1 7.75 13h2.5a.75.75 0 0 1 0 1.5h-2.5A.75.75 0 0 1 7 13.75Z"/></svg>,
  billing:           <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5.5A2.5 2.5 0 0 1 4.5 3h11A2.5 2.5 0 0 1 18 5.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 2 14.5v-9Zm2.5-1a1 1 0 0 0-1 1V7h13V5.5a1 1 0 0 0-1-1h-11ZM3.5 8.5v6a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-6h-13Zm7.5 2.5a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"/></svg>,
  users:             <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M13 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-1.5 0a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z"/><path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2ZM3.5 10a6.5 6.5 0 1 1 11.573 4.089c-.46-.707-1.197-1.323-2.183-1.768C11.862 11.814 10.963 11.5 10 11.5s-1.862.314-2.89.821c-.986.445-1.723 1.06-2.183 1.768A6.476 6.476 0 0 1 3.5 10Z"/></svg>,
  payments:          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M15.5 2h-11A2.5 2.5 0 0 0 2 4.5v11A2.5 2.5 0 0 0 4.5 18h11a2.5 2.5 0 0 0 2.5-2.5v-11A2.5 2.5 0 0 0 15.5 2ZM3.5 4.5A1 1 0 0 1 4.5 3.5h11a1 1 0 0 1 1 1v1h-13v-1Zm-1 2.5h15v8.5a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1V7Zm3.75 3.5a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5h-5.5Z"/></svg>,
  checkout:          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M4.5 3A1.5 1.5 0 0 0 3 4.5v.75c0 .414.336.75.75.75H4v9A1.5 1.5 0 0 0 5.5 16.5h9a1.5 1.5 0 0 0 1.5-1.5V6h.25A.75.75 0 0 0 17 5.25V4.5A1.5 1.5 0 0 0 15.5 3h-11Zm0 1.5h11v.5H4.5v-.5Zm1 2h9v8.5H5.5V6.5Zm3 2a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z"/></svg>,
  'customer-accounts':<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M7.5 3a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM4.5 7.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM12.5 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1 15.25a6.25 6.25 0 0 1 12.5 0 .75.75 0 0 1-1.5 0A4.75 4.75 0 0 0 2.5 15.25a.75.75 0 0 1-1.5 0Zm12.5-1a5.25 5.25 0 0 1 5 5.5.75.75 0 0 1-1.5 0 3.75 3.75 0 0 0-3.5-3.75.75.75 0 0 1 0-1.5v-.25Z"/></svg>,
  shipping:          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M2.5 5A1.5 1.5 0 0 0 1 6.5v7A1.5 1.5 0 0 0 2.5 15h.535a2.5 2.5 0 0 0 4.93 0h5.07a2.5 2.5 0 0 0 4.93 0H18a1 1 0 0 0 1-1v-3.382a1.5 1.5 0 0 0-.224-.79l-2-3.236A1.5 1.5 0 0 0 15.5 6H13V5.5A.5.5 0 0 0 12.5 5h-10ZM13 7.5h2.5l2 3.236V13.5h-.535a2.5 2.5 0 0 0-4.965 0H13V7.5ZM5.5 14a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm9 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/></svg>,
  taxes:             <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1a9 9 0 1 0 0 18A9 9 0 0 0 10 1ZM3.5 10a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Zm9.78-3.03a.75.75 0 0 0-1.06-1.06L6.97 12.16a.75.75 0 1 0 1.06 1.06l5.25-5.25ZM8 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm5 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/></svg>,
  locations:         <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1a7 7 0 0 1 7 7c0 3.866-7 11-7 11S3 11.866 3 8a7 7 0 0 1 7-7Zm0 1.5A5.5 5.5 0 0 0 4.5 8c0 2.9 5.5 8.855 5.5 8.855S15.5 10.9 15.5 8A5.5 5.5 0 0 0 10 2.5ZM10 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z"/></svg>,
  notifications:     <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1.75a6.25 6.25 0 0 0-6.25 6.25v2.063l-.864 1.726A1.75 1.75 0 0 0 4.45 14.25h2.3a3.25 3.25 0 0 0 6.5 0h2.3a1.75 1.75 0 0 0 1.564-2.461l-.864-1.726V8A6.25 6.25 0 0 0 10 1.75Zm2 12.5a1.75 1.75 0 0 1-3.5 0h3.5Z"/></svg>,
  domains:           <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1a9 9 0 1 0 0 18A9 9 0 0 0 10 1Zm5.47 5.5h-2.644a11.65 11.65 0 0 0-.95-2.833A7.517 7.517 0 0 1 15.47 6.5ZM10 2.5c.43 0 1.167.763 1.764 2.418.178.493.324 1.027.437 1.582H7.799c.113-.555.259-1.09.437-1.582C8.833 3.263 9.57 2.5 10 2.5ZM6.124 3.667A11.65 11.65 0 0 0 5.174 6.5H2.53a7.517 7.517 0 0 1 3.594-2.833ZM2.05 8h3.027C5.026 8.49 5 9.004 5 9.5v1H2.05A7.5 7.5 0 0 1 2.05 8ZM2.05 12H5v.5c0 .496.026 1.01.077 1.5H2.05a7.499 7.499 0 0 1 0-2ZM6.577 14A9.61 9.61 0 0 1 6.5 12.5v-3h7v3c0 .512-.026 1.015-.077 1.5H6.577Zm.162 1.5H13.261c-.113.555-.259 1.09-.437 1.582C12.227 18.737 11.43 19.5 10 19.5c-.43 0-1.167-.763-1.764-2.418A9.653 9.653 0 0 1 6.739 15.5ZM14.5 12.5c0 .512-.026 1.015-.077 1.5h-1.846c.051-.485.077-.988.077-1.5v-3H15v1a9.612 9.612 0 0 1-.5 2Zm2.95-2h-2.373c.05-.49.077-1.004.077-1.5V8H18a7.5 7.5 0 0 1-.55 2.5Z"/></svg>,
  languages:         <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1a9 9 0 1 0 0 18A9 9 0 0 0 10 1ZM3.5 8.5h3.013A15.76 15.76 0 0 1 6.5 10c0 .518.014 1.024.043 1.5H3.5a6.475 6.475 0 0 1 0-3ZM6.576 13h2.617c.15.815.361 1.543.624 2.155A7.513 7.513 0 0 1 6.576 13Zm6.848 0a7.514 7.514 0 0 1-3.241 2.155c.263-.612.475-1.34.624-2.155h2.617Zm.543-1.5c.03-.476.044-.982.044-1.5 0-.518-.014-1.024-.043-1.5H16.5a6.475 6.475 0 0 1 0 3h-2.533Zm-.543-4.5h-2.617A10.5 10.5 0 0 0 10 4.845 10.5 10.5 0 0 0 9.193 7H6.576A7.513 7.513 0 0 1 13.424 7ZM9.193 13h1.614c-.15.815-.36 1.543-.623 2.155A10.5 10.5 0 0 1 9.193 13Zm0-6h1.614c-.15-.815-.36-1.543-.623-2.155A10.5 10.5 0 0 0 9.193 7Z"/></svg>,
  policies:          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 1A1.5 1.5 0 0 0 4 2.5v15A1.5 1.5 0 0 0 5.5 19h9a1.5 1.5 0 0 0 1.5-1.5v-15A1.5 1.5 0 0 0 14.5 1h-9ZM5.5 2.5h9v15h-9v-15ZM7 6.75A.75.75 0 0 1 7.75 6h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 7 6.75Zm0 3A.75.75 0 0 1 7.75 9h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 7 9.75Zm0 3A.75.75 0 0 1 7.75 12h2.5a.75.75 0 0 1 0 1.5h-2.5A.75.75 0 0 1 7 12.75Z"/></svg>,
  security:          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10.243 2.1a.75.75 0 0 0-.486 0l-7 2.625A.75.75 0 0 0 2.25 5.5C2.25 12.233 5.818 16.8 9.757 18.9a.75.75 0 0 0 .486 0C14.182 16.8 17.75 12.233 17.75 5.5a.75.75 0 0 0-.507-.775l-7-2.625ZM10 4.366l5.75 2.156C15.53 11.62 12.685 15.588 10 17.394 7.315 15.588 4.47 11.62 4.25 6.522L10 4.366Z"/></svg>,
};

const NAV = [
  { id: 'general',           label: 'General' },
  { id: 'plan',              label: 'Plan' },
  { id: 'billing',           label: 'Billing' },
  { id: 'users',             label: 'Users' },
  { id: 'payments',          label: 'Payments' },
  { id: 'checkout',          label: 'Checkout' },
  { id: 'customer-accounts', label: 'Customer accounts' },
  { id: 'shipping',          label: 'Shipping and delivery' },
  { id: 'taxes',             label: 'Taxes and duties' },
  { id: 'locations',         label: 'Locations' },
  { id: 'notifications',     label: 'Notifications' },
  { id: 'domains',           label: 'Domains' },
  { id: 'languages',         label: 'Languages' },
  { id: 'policies',          label: 'Policies' },
  { id: 'security',          label: 'Security' },
];

const Card = ({ children, style = {} }) => (
  <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, overflow: 'hidden', marginBottom: 16, ...style }}>
    {children}
  </div>
);
const CardHead = ({ title, subtitle }) => (
  <div style={{ padding: '14px 20px', borderBottom: `1px solid ${P.border}` }}>
    <div style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text }}>{title}</div>
    {subtitle && <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginTop: 2 }}>{subtitle}</div>}
  </div>
);
const Inp = ({ label, value, onChange, type = 'text', placeholder, prefix, readOnly }) => (
  <div>
    {label && <label style={{ display: 'block', fontSize: P.fontSize, fontWeight: 500, color: P.text, marginBottom: 5 }}>{label}</label>}
    {prefix ? (
      <div style={{ display: 'flex', border: `1px solid ${P.border}`, borderRadius: 8, overflow: 'hidden' }}>
        <span style={{ padding: '7px 12px', background: P.bg, fontSize: P.fontSize, color: P.textSubdued, borderRight: `1px solid ${P.border}`, whiteSpace: 'nowrap' }}>{prefix}</span>
        <input value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly} style={{ flex: 1, padding: '7px 12px', border: 'none', outline: 'none', fontSize: P.fontSize, fontFamily: P.font, color: P.text, background: readOnly ? P.bg : P.surface }}/>
      </div>
    ) : (
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
        style={{ width: '100%', padding: '7px 12px', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, outline: 'none', fontFamily: P.font, color: P.text, background: readOnly ? P.bg : P.surface, boxSizing: 'border-box' }}/>
    )}
  </div>
);
const SaveBtn = ({ onClick, saving, label = 'Save' }) => (
  <button onClick={onClick} disabled={saving} style={{ padding: '7px 18px', background: saving ? P.bg : P.text, color: saving ? P.textSubdued : '#fff', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: P.font }}>
    {saving ? 'Saving...' : label}
  </button>
);
const Toggle = ({ on, onChange }) => (
  <div onClick={onChange} style={{ width: 36, height: 20, background: on ? P.green : P.border, borderRadius: 10, cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 16, height: 16, background: '#fff', borderRadius: '50%', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
  </div>
);
const ComingSoon = ({ title }) => (
  <div>
    <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>{title}</h1>
    <Card>
      <div style={{ padding: '60px 40px', textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, background: P.bg, borderRadius: 12, margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${P.border}`, color: P.textSubdued }}>{ICONS.security}</div>
        <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: P.text, marginBottom: 6 }}>{title} settings</div>
        <div style={{ fontSize: P.fontSize, color: P.textSubdued }}>This section is coming soon.</div>
      </div>
    </Card>
  </div>
);

export default function Settings() {
  const router = useRouter();
  const active = router.query.section || null;
  const tokenRef = useRef('');
  const [seller, setSeller] = useState(null);
  const [form, setForm] = useState({ full_name: '', email: '', store_name: '', store_url: '' });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [notifs, setNotifs] = useState({ new_order: true, order_shipped: true, price_change: true, out_of_stock: true, auto_buy_failed: true, weekly_summary: false, marketing: false });
  const [settingsSearch, setSettingsSearch] = useState('');
  const [iconModal, setIconModal] = useState(false);
  const [storeIcon, setStoreIcon] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const profileRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarModal, setAvatarModal] = useState(false);
  const [topbarSearch, setTopbarSearch] = useState('');
  const [topbarSearchOpen, setTopbarSearchOpen] = useState(false);
  const filteredNav = settingsSearch
    ? NAV.filter(n => n.label.toLowerCase().includes(settingsSearch.toLowerCase()))
    : NAV;
  const topbarResults = topbarSearch
    ? NAV.filter(n => n.label.toLowerCase().includes(topbarSearch.toLowerCase())).slice(0, 6)
    : [];

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    const s = localStorage.getItem('onshipy_seller');
    if (!t) { router.push('/login'); return; }
    tokenRef.current = t;
    if (s) { try { const sd = JSON.parse(s); setSeller(sd); setForm({ full_name: sd.full_name || '', email: sd.email || '', store_name: sd.store_name || '', store_url: sd.store_url || '' }); } catch {} }
  }, []);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const fn = e => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        const portal = document.getElementById('settings-profile-portal');
        if (!portal || !portal.contains(e.target)) setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('onshipy_token');
    localStorage.removeItem('onshipy_seller');
    router.push('/login');
  };

  const showToast = (msg, err = false) => { setToast({ msg, err }); setTimeout(() => setToast(null), 4000); };

  const handleSave = async (body) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/sellers/profile`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Save failed', true); return; }
      const updated = { ...seller, ...data.seller };
      setSeller(updated); localStorage.setItem('onshipy_seller', JSON.stringify(updated)); showToast('Changes saved');
    } catch { showToast('Connection error', true); }
    setSaving(false);
  };

  const handlePassword = async () => {
    if (pwForm.new_password !== pwForm.confirm_password) { showToast('Passwords do not match', true); return; }
    if (pwForm.new_password.length < 8) { showToast('Min 8 characters', true); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/sellers/password`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` }, body: JSON.stringify({ current_password: pwForm.current_password, new_password: pwForm.new_password }) });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Failed', true); return; }
      setPwForm({ current_password: '', new_password: '', confirm_password: '' }); showToast('Password updated');
    } catch { showToast('Connection error', true); }
    setSaving(false);
  };

  const goSection = (id) => router.push(`/settings?section=${id}`, undefined, { shallow: true });
  const initials = seller?.full_name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const SectionContent = () => {
    if (active === 'general') return (
      <div style={{ maxWidth: 700 }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>General</h1>
        <Card>
          <CardHead title="Store contact details" subtitle="Used for customer communications"/>
          <div style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <Inp label="Store name" value={form.store_name} onChange={e => setForm({ ...form, store_name: e.target.value })} placeholder="My Store"/>
            <Inp label="Contact email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email"/>
            <div style={{ gridColumn: '1 / -1' }}><Inp label="Store URL" value={form.store_url} onChange={e => setForm({ ...form, store_url: e.target.value })} prefix="onshipy.com/store/" placeholder="my-store"/></div>
          </div>
          <div style={{ padding: '0 20px 18px', display: 'flex', justifyContent: 'flex-end' }}><SaveBtn onClick={() => handleSave(form)} saving={saving}/></div>
        </Card>
        <Card>
          <CardHead title="Store defaults"/>
          <div style={{ padding: '18px 20px' }}>
            <div style={{ maxWidth: 240 }}>
              <label style={{ display: 'block', fontSize: P.fontSize, fontWeight: 500, color: P.text, marginBottom: 5 }}>Default currency</label>
              <select style={{ width: '100%', padding: '7px 12px', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, outline: 'none', fontFamily: P.font, color: P.text, background: P.surface }}>
                <option>USD — US Dollar</option><option>EUR — Euro</option><option>GBP — British Pound</option><option>NGN — Nigerian Naira</option>
              </select>
            </div>
          </div>
          <div style={{ padding: '0 20px 18px', display: 'flex', justifyContent: 'flex-end' }}><SaveBtn onClick={() => showToast('Saved')} saving={saving}/></div>
        </Card>
      </div>
    );

    if (active === 'plan') return (
      <div style={{ maxWidth: 880 }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Plan</h1>
        <Card>
          <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><div style={{ fontWeight: 600, fontSize: '0.9375rem', color: P.text }}>Onshipy {seller?.plan ? seller.plan.charAt(0).toUpperCase() + seller.plan.slice(1) : 'Free'}</div><div style={{ fontSize: P.fontSize, color: P.textSubdued, marginTop: 2 }}>Your current plan</div></div>
            <span style={{ padding: '3px 12px', background: '#cdfed4', color: '#006847', borderRadius: 20, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'capitalize' }}>{seller?.plan || 'free'}</span>
          </div>
        </Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { id: 'free', name: 'Free', price: '$0', period: 'forever', color: P.textSubdued, features: ['5 product imports', '1 connected store', 'Basic scraper', 'Email support'] },
            { id: 'pro', name: 'Pro', price: '$29', period: 'per month', color: P.green, popular: true, features: ['Unlimited imports', '3 stores', 'Auto-buy engine', 'Analytics', 'Priority support'] },
            { id: 'enterprise', name: 'Enterprise', price: '$99', period: 'per month', color: '#7c3aed', features: ['Everything in Pro', '10 stores', 'API access', 'White label', 'Dedicated manager'] },
          ].map((plan) => {
            const isCurrent = (seller?.plan || 'free') === plan.id;
            return (
              <div key={plan.id} style={{ background: P.surface, borderRadius: 12, border: isCurrent ? `2px solid ${plan.color}` : `1px solid ${P.border}`, padding: 20, position: 'relative' }}>
                {isCurrent && <div style={{ position: 'absolute', top: -10, left: 14, background: plan.color, color: '#fff', padding: '2px 10px', borderRadius: 20, fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase' }}>CURRENT</div>}
                {plan.popular && !isCurrent && <div style={{ position: 'absolute', top: -10, right: 14, background: P.green, color: '#fff', padding: '2px 10px', borderRadius: 20, fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase' }}>POPULAR</div>}
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: P.text, marginBottom: 2 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 14 }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: plan.color, letterSpacing: '-0.03em' }}>{plan.price}</span>
                  <span style={{ fontSize: P.fontSize, color: P.textSubdued }}>{plan.period}</span>
                </div>
                {plan.features.map((f, i) => <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: P.fontSize, color: P.textSubdued }}><span style={{ color: P.green }}>✓</span>{f}</div>)}
                {!isCurrent
                  ? <button onClick={() => router.push('/plans')} style={{ width: '100%', marginTop: 14, padding: 8, background: plan.color, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: P.fontSize, fontFamily: P.font }}>Upgrade to {plan.name}</button>
                  : <button disabled style={{ width: '100%', marginTop: 14, padding: 8, background: P.bg, color: P.textSubdued, border: `1px solid ${P.border}`, borderRadius: 8, cursor: 'not-allowed', fontWeight: 500, fontSize: P.fontSize, fontFamily: P.font }}>Current plan</button>
                }
              </div>
            );
          })}
        </div>
      </div>
    );

    if (active === 'billing') return (
      <div style={{ maxWidth: 700 }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Billing</h1>
        <Card><CardHead title="Payment method"/><div style={{ padding: '18px 20px' }}><div style={{ border: `1px solid ${P.border}`, borderRadius: 8, padding: '14px 16px', marginBottom: 14, fontSize: P.fontSize, color: P.textSubdued }}>No payment method added yet</div><button onClick={() => router.push('/plans')} style={{ padding: '7px 16px', background: P.text, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: P.fontSize, fontWeight: 500, fontFamily: P.font }}>Add payment method</button></div></Card>
        <Card><CardHead title="Billing history"/><div style={{ padding: '48px 40px', textAlign: 'center', color: P.textSubdued, fontSize: P.fontSize }}>No billing history yet</div></Card>
      </div>
    );

    if (active === 'users') return (
      <div style={{ maxWidth: 700 }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Users</h1>
        <Card>
          <CardHead title="Store owner" subtitle="Manage your account details"/>
          <div style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 18, borderBottom: `1px solid ${P.border}` }}>
              <div style={{ width: 50, height: 50, background: P.green, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.125rem', fontWeight: 700, flexShrink: 0 }}>{initials}</div>
              <div><div style={{ fontWeight: 650, fontSize: '0.9375rem', color: P.text }}>{seller?.full_name}</div><div style={{ fontSize: P.fontSize, color: P.textSubdued }}>{seller?.email}</div><span style={{ fontSize: '0.6875rem', padding: '2px 8px', background: '#cdfed4', color: '#006847', borderRadius: 20, fontWeight: 600, textTransform: 'uppercase', display: 'inline-block', marginTop: 4 }}>{seller?.plan || 'free'} plan</span></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
              <Inp label="Full name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}/>
              <Inp label="Email address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email"/>
            </div>
            <SaveBtn onClick={() => handleSave({ full_name: form.full_name, email: form.email, store_name: form.store_name })} saving={saving} label="Save changes"/>
          </div>
        </Card>
      </div>
    );

    if (active === 'payments') return (
      <div style={{ maxWidth: 700 }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Payments</h1>
        <Card>
          <CardHead title="Payment providers" subtitle="Accept payments from your customers"/>
          {[{ name: 'Stripe', desc: 'Credit cards, Apple Pay, Google Pay worldwide' }, { name: 'PayPal', desc: 'PayPal and Venmo payments' }, { name: 'Paystack', desc: 'Cards, bank transfer, USSD across Africa' }].map((p, i, arr) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: i < arr.length - 1 ? `1px solid ${P.border}` : 'none' }}>
              <div><div style={{ fontWeight: 500, fontSize: P.fontSize, color: P.text }}>{p.name}</div><div style={{ fontSize: '0.75rem', color: P.textSubdued, marginTop: 2 }}>{p.desc}</div></div>
              <button style={{ padding: '6px 14px', background: P.surface, border: `1px solid ${P.border}`, borderRadius: 8, cursor: 'pointer', fontSize: P.fontSize, fontWeight: 500, fontFamily: P.font, color: P.text }}>Connect</button>
            </div>
          ))}
        </Card>
      </div>
    );

    if (active === 'notifications') return (
      <div style={{ maxWidth: 700 }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Notifications</h1>
        <Card>
          <CardHead title="Email notifications" subtitle="Choose which events trigger an email"/>
          {[{ key: 'new_order', label: 'New order received', desc: 'When a customer places an order' }, { key: 'order_shipped', label: 'Order shipped', desc: 'When tracking is added' }, { key: 'price_change', label: 'Price change alert', desc: 'When source price changes' }, { key: 'out_of_stock', label: 'Out of stock alert', desc: 'When a source product goes out of stock' }, { key: 'auto_buy_failed', label: 'Auto-buy failed', desc: 'When automatic purchase fails' }, { key: 'weekly_summary', label: 'Weekly summary', desc: 'Weekly performance report' }, { key: 'marketing', label: 'Marketing emails', desc: 'Tips, updates and new features' }].map((n, i, arr) => (
            <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 20px', borderBottom: i < arr.length - 1 ? `1px solid ${P.border}` : 'none' }}>
              <div><div style={{ fontSize: P.fontSize, fontWeight: 500, color: P.text }}>{n.label}</div><div style={{ fontSize: '0.75rem', color: P.textSubdued, marginTop: 2 }}>{n.desc}</div></div>
              <Toggle on={notifs[n.key]} onChange={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key] }))}/>
            </div>
          ))}
        </Card>
      </div>
    );

    if (active === 'domains') return (
      <div style={{ maxWidth: 700 }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Domains</h1>
        <Card>
          <CardHead title="Your domains"/>
          <div style={{ padding: '18px 20px' }}>
            {[{ domain: 'onshipy.com', type: 'Primary domain' }, { domain: 'api.onshipy.com', type: 'API subdomain' }, { domain: 'www.onshipy.com', type: 'Redirect' }].map((d, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: P.bg, borderRadius: 8, marginBottom: 8, border: `1px solid ${P.border}` }}>
                <div><div style={{ fontWeight: 500, fontSize: P.fontSize, color: P.text }}>{d.domain}</div><div style={{ fontSize: '0.75rem', color: P.textSubdued }}>{d.type}</div></div>
                <span style={{ fontSize: '0.6875rem', padding: '2px 8px', borderRadius: 20, background: '#cdfed4', color: '#006847', fontWeight: 600 }}>Active</span>
              </div>
            ))}
            <button style={{ marginTop: 8, padding: '7px 16px', background: P.text, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: P.fontSize, fontWeight: 500, fontFamily: P.font }}>Connect existing domain</button>
          </div>
        </Card>
      </div>
    );

    if (active === 'policies') return (
      <div style={{ maxWidth: 700 }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Policies</h1>
        <Card>
          <CardHead title="Store policies" subtitle="Build trust with your customers"/>
          {['Refund policy', 'Privacy policy', 'Terms of service', 'Shipping policy', 'Contact information'].map((policy, i, arr) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 20px', borderBottom: i < arr.length - 1 ? `1px solid ${P.border}` : 'none', cursor: 'pointer' }}>
              <div style={{ fontSize: P.fontSize, fontWeight: 500, color: P.text }}>{policy}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: P.fontSize, color: P.textSubdued }}>Not created</span><svg width="12" height="12" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
            </div>
          ))}
        </Card>
      </div>
    );

    if (active === 'security') return (
      <div style={{ maxWidth: 700 }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Security</h1>
        <Card>
          <CardHead title="Change password" subtitle="Use a strong password of at least 8 characters"/>
          <div style={{ padding: '18px 20px', maxWidth: 400 }}>
            {[{ label: 'Current password', key: 'current_password' }, { label: 'New password', key: 'new_password' }, { label: 'Confirm new password', key: 'confirm_password' }].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}><Inp label={f.label} type="password" value={pwForm[f.key]} onChange={e => setPwForm({ ...pwForm, [f.key]: e.target.value })} placeholder="••••••••"/></div>
            ))}
            <SaveBtn onClick={handlePassword} saving={saving} label="Update password"/>
          </div>
        </Card>
      </div>
    );

    return <ComingSoon title={NAV.find(n => n.id === active)?.label || 'Settings'}/>;
  };

  return (
    <>
      <Head>
        <title>Settings — Onshipy</title>
        <link rel="icon" type="image/png" href="/favicon.png"/>
      </Head>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { font-family: "Inter var","Inter",-apple-system,BlinkMacSystemFont,sans-serif; font-size: 0.8125rem; font-weight: 450; letter-spacing: -0.00833em; color: rgba(48,48,48,1); background: #f1f1f1; -webkit-font-smoothing: antialiased; }
        .st-topbar { position: fixed; top: 0; left: 0; right: 0; height: 56px; background: #1a1a1a; z-index: 500; display: flex; align-items: center; padding: 0 16px; gap: 12px; }
        .st-shell { display: flex; min-height: 100vh; padding-top: 56px; }
        .st-nav { width: 260px; flex-shrink: 0; background: #fff; border-right: 1px solid rgba(227,227,227,1); overflow-y: auto; position: sticky; top: 56px; height: calc(100vh - 56px); align-self: flex-start; }
        .st-content { flex: 1; padding: 24px 28px 60px; min-width: 0; background: #f1f1f1; }
        .nav-row { display: flex; align-items: center; width: 100%; padding: 11px 16px; background: none; border: none; border-bottom: 1px solid rgba(227,227,227,1); cursor: pointer; font-family: inherit; gap: 12px; text-align: left; transition: background .1s; }
        .nav-row:hover { background: #f7f7f7; }
        .nav-row.active { background: #f0f0f0; }
        .mob-back { display: none; align-items: center; gap: 8px; width: 100%; padding: 14px 16px; background: #fff; border: none; border-bottom: 1px solid rgba(227,227,227,1); cursor: pointer; font-size: 0.8125rem; font-family: inherit; color: rgba(97,97,97,1); }
        @media (max-width: 767px) {
          .st-shell { flex-direction: column; }
          .st-nav { width: 100%; height: auto; position: static; border-right: none; }
          .st-nav.mob-hidden { display: none; }
          .st-content { padding: 0 0 40px; }
          .st-content.mob-hidden { display: none; }
          .st-content > .content-inner { padding: 16px; }
          .mob-back { display: flex !important; }
        }
      `}</style>

      {toast && (
        <div style={{ position: 'fixed', top: 68, right: 16, background: toast.err ? '#d82c0d' : P.text, color: '#fff', padding: '10px 16px', borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', fontFamily: P.font }}>
          {toast.err ? '' : '✓ '}{toast.msg}
        </div>
      )}

      {/* TOPBAR — "Onshipy" text goes to dashboard */}
      <div className="st-topbar">
        <div onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/favicon-32x32.png" alt="Onshipy" width={20} height={20} style={{ filter: 'brightness(0) invert(1)', flexShrink: 0 }} />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.0625rem', letterSpacing: '-0.02em', fontFamily: '"Space Grotesk", sans-serif' }}>Onshipy</span>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative', maxWidth: 540, margin: '0 auto', width: '100%', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.13)', borderRadius: 624, padding: '0 14px', height: 34, width: '100%' }}>
            <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              value={topbarSearch}
              onChange={e => { setTopbarSearch(e.target.value); setTopbarSearchOpen(true); }}
              onFocus={() => setTopbarSearchOpen(true)}
              onBlur={() => setTimeout(() => setTopbarSearchOpen(false), 150)}
              placeholder="Search settings..."
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: P.fontSize, color: '#fff', fontFamily: P.font }}
            />
            {topbarSearch && (
              <button onClick={() => { setTopbarSearch(''); setTopbarSearchOpen(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0, display: 'flex' }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>
          {topbarSearchOpen && topbarResults.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 16, right: 16, marginTop: 6, background: '#fff', borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.15)', border: `1px solid ${P.border}`, overflow: 'hidden', zIndex: 800 }}>
              {topbarResults.map((item, i) => (
                <div key={i}
                  onMouseDown={() => { goSection(item.id); setTopbarSearch(''); setTopbarSearchOpen(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', borderBottom: i < topbarResults.length - 1 ? `1px solid ${P.border}` : 'none', background: 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f7f7f7'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ color: P.textSubdued, display: 'flex' }}>{ICONS[item.id]}</span>
                  <span style={{ fontSize: P.fontSize, fontWeight: 500, color: P.text }}>{item.label}</span>
                </div>
              ))}
            </div>
          )}
          {topbarSearchOpen && topbarSearch && topbarResults.length === 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 16, right: 16, marginTop: 6, background: '#fff', borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.15)', border: `1px solid ${P.border}`, padding: '14px', zIndex: 800, fontSize: P.fontSize, color: P.textSubdued }}>
              No results for "{topbarSearch}"
            </div>
          )}
        </div>
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            style={{ width: 30, height: 30, background: avatarUrl ? 'transparent' : P.green, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, cursor: 'pointer', border: '2px solid rgba(255,255,255,0.2)', outline: 'none', overflow: 'hidden', padding: 0, fontFamily: P.font }}
          >
            {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}/> : initials}
          </button>
        </div>
      </div>

      <div className="st-shell">
        {/* LEFT NAV */}
        <div className={`st-nav${active ? ' mob-hidden' : ''}`}>
          {/* Settings header */}
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${P.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ color: P.textSubdued }}>{ICONS.security}</span>
              <span style={{ fontWeight: 650, fontSize: '1rem', color: P.text }}>Settings</span>
            </div>
            {/* Store card: avatar clicks to set icon, domain link opens domains */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: P.bg, borderRadius: 8, border: `1px solid ${P.border}` }}>
              {/* Store icon — clickable to upload image */}
              <div
                onClick={() => setIconModal(true)}
                title="Set store icon"
                style={{ width: 36, height: 36, background: storeIcon ? 'transparent' : P.green, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0, cursor: 'pointer', overflow: 'hidden', border: `1px solid ${P.border}` }}
              >
                {storeIcon
                  ? <img src={storeIcon} alt="Store icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  : (seller?.store_name?.[0]?.toUpperCase() || 'O')
                }
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seller?.store_name || 'My Store'}</div>
                <span
                  onClick={() => goSection('domains')}
                  style={{ fontSize: '0.75rem', color: P.green, cursor: 'pointer', textDecoration: 'underline' }}
                >onshipy.com</span>
              </div>
            </div>

          </div>

          {/* Search */}
          <div style={{ padding: '8px 12px', borderBottom: `1px solid ${P.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: P.bg, border: `1px solid ${P.border}`, borderRadius: 8, padding: '6px 10px' }}>
              <svg width="13" height="13" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                value={settingsSearch}
                onChange={e => setSettingsSearch(e.target.value)}
                placeholder="Search settings"
                style={{ border: 'none', background: 'none', outline: 'none', fontSize: P.fontSize, color: P.text, flex: 1, fontFamily: P.font }}
              />
            </div>
          </div>

          {/* Nav rows — proper Shopify style with SVG icons */}
          <div>
            {filteredNav.map(item => (
              <button
                key={item.id}
                onClick={() => goSection(item.id)}
                className={`nav-row${active === item.id ? ' active' : ''}`}
              >
                <span style={{ color: active === item.id ? P.text : P.textSubdued, display: 'flex', flexShrink: 0 }}>
                  {ICONS[item.id]}
                </span>
                <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: active === item.id ? 600 : 450, color: P.text }}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* User info at very bottom — clickable, opens users section */}
          <div
            onClick={() => goSection('users')}
            style={{ padding: '12px 16px', borderTop: `1px solid ${P.border}`, cursor: 'pointer', flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.background = '#f7f7f7'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, background: P.green, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: '600', fontSize: P.fontSize, color: P.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seller?.full_name || 'User'}</div>
                <div style={{ fontSize: '0.75rem', color: P.textSubdued, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seller?.email || ''}</div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className={`st-content${!active ? ' mob-hidden' : ''}`}>
          {/* Mobile: back button */}
          <button className="mob-back" onClick={() => router.push('/settings', undefined, { shallow: true })}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            Settings
          </button>
          <div className="content-inner" style={{ padding: '24px 28px 60px' }}>
            <SectionContent/>
          </div>
        </div>
      </div>
      {/* ── STORE ICON UPLOAD MODAL ── */}
      {iconModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 650, color: P.text, margin: 0 }}>Internal icon</h2>
              <button onClick={() => setIconModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: P.textSubdued, padding: 4 }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <p style={{ fontSize: P.fontSize, color: P.textSubdued, marginBottom: 20, lineHeight: 1.6 }}>
              Customize how your store appears in the admin. Customers won't see this.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              {/* Preview */}
              <div style={{ width: 48, height: 48, background: storeIcon ? 'transparent' : P.bg, borderRadius: 8, border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {storeIcon
                  ? <img src={storeIcon} alt="icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  : <svg width="20" height="20" viewBox="0 0 20 20" fill={P.textSubdued}><path d="M3.5 4A1.5 1.5 0 0 0 2 5.5v9A1.5 1.5 0 0 0 3.5 16h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 16.5 4h-13Z"/></svg>
                }
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <label style={{ padding: '7px 14px', background: '#fff', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, cursor: 'pointer', color: P.text }}>
                  Edit icon
                  <input type="file" accept="image/png,image/jpg,image/jpeg,image/webp,image/svg+xml,image/heic" style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) { const url = URL.createObjectURL(file); setStoreIcon(url); }
                    }}
                  />
                </label>
                {storeIcon && (
                  <button onClick={() => setStoreIcon(null)} style={{ padding: '7px 14px', background: '#fff', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, cursor: 'pointer', color: P.text }}>
                    Remove icon
                  </button>
                )}
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: P.textSubdued, marginBottom: 20 }}>HEIC, WEBP, SVG, PNG, or JPG. Minimum 512×512 pixels recommended.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 16, borderTop: `1px solid ${P.border}` }}>
              <button onClick={() => setIconModal(false)} style={{ padding: '8px 18px', background: '#fff', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, cursor: 'pointer', fontFamily: 'inherit', color: P.text }}>Cancel</button>
              <button onClick={() => setIconModal(false)} style={{ padding: '8px 18px', background: P.text, color: '#fff', border: 'none', borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
            </div>
          </div>
        </div>
      )}
      {/* Profile dropdown portal — same as Layout, works on settings page too */}
      {mounted && profileOpen && createPortal(
        <div id="settings-profile-portal" style={{
          position: 'fixed', top: 64, right: 14,
          width: 268, background: '#fff', borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)', border: '1px solid rgba(227,227,227,1)',
          zIndex: 99999,
        }}>
          {/* Header */}
          <div style={{ padding: '12px 14px', background: '#f7f7f7', borderBottom: '1px solid rgba(227,227,227,1)', borderRadius: '12px 12px 0 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                onClick={() => { setProfileOpen(false); setAvatarModal(true); }}
                style={{ width: 38, height: 38, background: avatarUrl ? 'transparent' : P.green, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0, cursor: 'pointer', overflow: 'hidden' }}
              >
                {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : initials}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '0.8125rem', color: 'rgba(48,48,48,1)' }}>{seller?.full_name || 'User'}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(97,97,97,1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seller?.email}</div>
                <span
                  onMouseDown={() => { setProfileOpen(false); router.push('/settings?section=plan'); }}
                  style={{ fontSize: '0.6875rem', color: '#008060', fontWeight: '700', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer', display: 'inline-block' }}
                >{seller?.plan || 'free'} plan</span>
              </div>
            </div>
          </div>
          {/* Items */}
          {[
            { label: 'Your profile',   href: '/settings?section=users' },
            { label: 'Store settings', href: '/settings' },
            { label: 'Billing & plan', href: '/settings?section=plan' },
            { label: 'Create store',   href: '/online-store' },
          ].map((item, i, arr) => (
            <div key={i}
              onMouseDown={e => { e.preventDefault(); setProfileOpen(false); router.push(item.href); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', fontSize: '0.8125rem', color: 'rgba(48,48,48,1)', borderBottom: i < arr.length - 1 ? '1px solid rgba(227,227,227,1)' : 'none', cursor: 'pointer', background: 'transparent', userSelect: 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f7f7f7'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span>{item.label}</span>
              <svg width="12" height="12" fill="none" stroke="rgba(97,97,97,1)" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(227,227,227,1)' }}>
            <div
              onMouseDown={e => { e.preventDefault(); setProfileOpen(false); handleLogout(); }}
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

      {/* Avatar upload modal */}
      {avatarModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 650, color: P.text, margin: 0 }}>Profile photo</h2>
              <button onClick={() => setAvatarModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: P.textSubdued, padding: 4, display: 'flex' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, background: avatarUrl ? 'transparent' : P.green, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, flexShrink: 0, overflow: 'hidden', border: `2px solid ${P.border}` }}>
                {avatarUrl ? <img src={avatarUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : initials}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <label style={{ padding: '7px 14px', background: '#fff', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, cursor: 'pointer', color: P.text }}>
                  Upload photo
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) setAvatarUrl(URL.createObjectURL(f)); }}/>
                </label>
                {avatarUrl && <button onClick={() => setAvatarUrl(null)} style={{ padding: '7px 14px', background: '#fff', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, cursor: 'pointer', color: '#d82c0d', fontFamily: P.font }}>Remove</button>}
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: P.textSubdued, marginBottom: 20 }}>PNG, JPG, WEBP, or SVG. Minimum 512×512 pixels recommended.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 16, borderTop: `1px solid ${P.border}` }}>
              <button onClick={() => setAvatarModal(false)} style={{ padding: '8px 18px', background: '#fff', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, cursor: 'pointer', fontFamily: 'inherit', color: P.text }}>Cancel</button>
              <button onClick={() => setAvatarModal(false)} style={{ padding: '8px 18px', background: P.text, color: '#fff', border: 'none', borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}