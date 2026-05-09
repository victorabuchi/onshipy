import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const P = {
  bg: '#f1f1f1', surface: '#fff', border: 'rgba(227,227,227,1)',
  text: 'rgba(48,48,48,1)', textSubdued: 'rgba(97,97,97,1)',
  green: '#008060', font: '"Inter var","Inter",-apple-system,BlinkMacSystemFont,sans-serif',
  fontSize: '0.8125rem', fontWeight: '450', letterSpacing: '-0.00833em',
};

const Btn = ({ children, onClick, variant = 'secondary', disabled, style = {} }) => {
  const styles = {
    primary:  { background: P.text,    color: '#fff', border: 'none' },
    secondary:{ background: P.surface, color: P.text, border: `1px solid ${P.border}` },
    green:    { background: P.green,   color: '#fff', border: 'none' },
    danger:   { background: P.surface, color: '#d82c0d', border: '1px solid rgba(216,44,13,0.3)' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...styles[variant], padding: '6px 14px', borderRadius: 8,
      fontSize: P.fontSize, fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: P.font, letterSpacing: P.letterSpacing, opacity: disabled ? 0.5 : 1,
      whiteSpace: 'nowrap', transition: 'opacity .1s', ...style
    }}>{children}</button>
  );
};

const FILTERS = [
  { id: 'all',      label: 'All',        filter: () => true },
  { id: 'active',   label: 'Active',     filter: l => l.status === 'active' },
  { id: 'pushed',   label: 'On Shopify', filter: l => !!l.shopify_product_id },
  { id: 'unpushed', label: 'Not pushed', filter: l => !l.shopify_product_id },
];

export default function Listings() {
  const router = useRouter();
  const tokenRef = useRef('');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('profit');
  const [sortDir, setSortDir] = useState('desc');
  const [pushing, setPushing] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    if (!t) { router.push('/login'); return; }
    tokenRef.current = t;
    fetchListings(t);
  }, []);

  const showToast = (msg, err = false) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchListings = async (t) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/products/listings/all`, {
        headers: { Authorization: `Bearer ${t || tokenRef.current}` }
      });
      const data = await res.json();
      if (data.listings) setListings(data.listings);
    } catch {}
    setLoading(false);
  };

  const getImages = (images) => {
    try {
      if (!images) return [];
      if (typeof images === 'string') return JSON.parse(images);
      if (Array.isArray(images)) return images;
    } catch {}
    return [];
  };

  const sym = (currency) =>
    ({ GBP: '£', USD: '$', EUR: '€', JPY: '¥', CAD: 'CA$', AUD: 'A$' }[currency] || '$');

  const profit = (l) => parseFloat(l.selling_price) - parseFloat(l.source_price_at_listing);
  const margin = (l) => ((profit(l) / parseFloat(l.selling_price)) * 100).toFixed(1);

  const handleUnlist = async (id) => {
    if (!confirm('Remove this listing?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/listings/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${tokenRef.current}` }
      });
      if (res.ok) {
        setListings(p => p.filter(l => l.id !== id));
        if (selected?.id === id) setSelected(null);
        showToast('Listing removed');
      } else { const d = await res.json(); showToast(d.error || 'Failed', true); }
    } catch (err) { showToast('Error: ' + err.message, true); }
  };

  const handlePush = async (listingId) => {
    setPushing(p => ({ ...p, [listingId]: true }));
    try {
      const res = await fetch(`${API_BASE}/api/stores/shopify/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` },
        body: JSON.stringify({ listing_id: listingId })
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Push failed', true); }
      else { showToast('✓ Pushed to Shopify!'); fetchListings(); }
    } catch (err) { showToast('Error: ' + err.message, true); }
    setPushing(p => ({ ...p, [listingId]: false }));
  };

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const SortArrow = ({ col }) => sortBy !== col ? (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="rgba(140,140,140,0.4)" style={{ marginLeft: 3 }}><path d="M5 2L8 6H2L5 2Z"/></svg>
  ) : (
    <svg width="10" height="10" viewBox="0 0 10 10" fill={P.textSubdued} style={{ marginLeft: 3 }}>
      {sortDir === 'asc' ? <path d="M5 2L8 7H2L5 2Z"/> : <path d="M5 8L2 3H8L5 8Z"/>}
    </svg>
  );

  const filterDef = FILTERS.find(f => f.id === filter);
  let visible = listings.filter(filterDef.filter);
  if (search) visible = visible.filter(l =>
    (l.custom_title || l.original_title || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.source_domain || '').toLowerCase().includes(search.toLowerCase())
  );
  visible = [...visible].sort((a, b) => {
    let av, bv;
    if (sortBy === 'profit')   { av = profit(a); bv = profit(b); }
    else if (sortBy === 'selling') { av = parseFloat(a.selling_price); bv = parseFloat(b.selling_price); }
    else if (sortBy === 'margin')  { av = parseFloat(margin(a)); bv = parseFloat(margin(b)); }
    else if (sortBy === 'source')  { av = parseFloat(a.source_price_at_listing); bv = parseFloat(b.source_price_at_listing); }
    else return 0;
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  const totalRevenue = listings.reduce((s, l) => s + parseFloat(l.selling_price || 0), 0);
  const totalProfit  = listings.reduce((s, l) => s + profit(l), 0);
  const avgMargin    = listings.length > 0 ? (listings.reduce((s, l) => s + parseFloat(margin(l)), 0) / listings.length).toFixed(1) : '0';
  const pushedCount  = listings.filter(l => l.shopify_product_id).length;

  const th = {
    padding: '8px 14px', fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued,
    textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left',
    borderBottom: `1px solid ${P.border}`, background: '#fafafa',
    cursor: 'pointer', userSelect: 'none', fontFamily: P.font,
  };
  const td = {
    padding: '11px 14px', fontSize: P.fontSize, borderBottom: `1px solid ${P.border}`,
    verticalAlign: 'middle', color: P.text, fontFamily: P.font, letterSpacing: P.letterSpacing,
  };

  return (
    <Layout title="Listings">
      <style>{`
        .lst-row:hover { background: #fafafa !important; }
        .filter-tab { padding: 7px 14px; background: none; border: none; border-bottom: 2px solid transparent; font-size: ${P.fontSize}; color: ${P.textSubdued}; cursor: pointer; font-family: ${P.font}; letter-spacing: ${P.letterSpacing}; font-weight: ${P.fontWeight}; white-space: nowrap; }
        .filter-tab.active { color: ${P.text}; font-weight: 600; border-bottom-color: ${P.text}; }
        .filter-tab:hover { color: ${P.text}; }
        @keyframes slideIn { from{opacity:0;transform:translateX(10px)} to{opacity:1;transform:translateX(0)} }
        @media (max-width: 767px) {
          .lst-detail { position: fixed !important; inset: 0 !important; width: 100% !important; z-index: 200 !important; overflow-y: auto !important; }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, background: toast.err ? '#d82c0d' : P.text, color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, fontFamily: P.font, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast.msg}
        </div>
      )}

      <div style={{ fontFamily: P.font, fontSize: P.fontSize, letterSpacing: P.letterSpacing, color: P.text, display: 'flex', minHeight: 'calc(100vh - 56px)' }}>

        {/* ── Main ── */}
        <div style={{ flex: 1, overflowY: 'auto', background: P.bg, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Header — floating on gray bg */}
          <div style={{ padding: '12px 20px 8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill={P.textSubdued}>
                  <path d="M3.25 4a.75.75 0 0 0 0 1.5h13.5a.75.75 0 0 0 0-1.5H3.25ZM3.25 8a.75.75 0 0 0 0 1.5h13.5a.75.75 0 0 0 0-1.5H3.25ZM3.25 12a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z"/>
                </svg>
                <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: 0, letterSpacing: '-0.02em' }}>Listings</h1>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn onClick={() => router.push('/online-store')}>Push all to Shopify</Btn>
                <Btn variant="primary" onClick={() => router.push('/products')}>Add listing</Btn>
              </div>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
              {FILTERS.map(f => (
                <button key={f.id} className={`filter-tab${filter === f.id ? ' active' : ''}`}
                  onClick={() => { setFilter(f.id); setSelected(null); }}>
                  {f.label}
                  <span style={{ marginLeft: 5, fontSize: '0.625rem', background: 'rgba(0,0,0,0.08)', color: P.textSubdued, padding: '1px 6px', borderRadius: 20, fontWeight: 600 }}>
                    {listings.filter(f.filter).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* KPI cards — in gray area */}
          {listings.length > 0 && (
            <div style={{ padding: '0 16px 12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                {[
                  { label: 'Active listings', value: listings.filter(l => l.status === 'active').length, color: P.text },
                  { label: 'Revenue potential', value: `$${totalRevenue.toFixed(2)}`, color: '#1d4ed8' },
                  { label: 'Profit potential', value: `$${totalProfit.toFixed(2)}`, color: P.green },
                  { label: 'Avg margin', value: `${avgMargin}%`, color: '#7c3aed' },
                ].map((s, i) => (
                  <div key={i} style={{ background: P.surface, borderRadius: 10, border: `1px solid ${P.border}`, padding: '14px 16px' }}>
                    <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginBottom: 5 }}>{s.label}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 650, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
                    {i === 3 && listings.length > 0 && (
                      <div style={{ marginTop: 4 }}>
                        <div style={{ height: 3, background: P.bg, borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(parseFloat(avgMargin), 100)}%`, background: '#7c3aed', borderRadius: 2 }}/>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shopify push status bar — in gray area */}
          {listings.length > 0 && (
            <div style={{ padding: '0 16px 12px' }}>
              <div style={{ background: P.surface, borderRadius: 10, border: `1px solid ${P.border}`, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: P.fontSize, color: P.textSubdued }}>
                    <span style={{ fontWeight: 600, color: P.green }}>{pushedCount}</span> of <span style={{ fontWeight: 600, color: P.text }}>{listings.length}</span> listings pushed to Shopify
                  </div>
                  <div style={{ height: 6, width: 120, background: P.bg, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(pushedCount / listings.length) * 100}%`, background: P.green, borderRadius: 3, transition: 'width .4s ease' }}/>
                  </div>
                </div>
                {pushedCount < listings.length && (
                  <Btn variant="green" onClick={() => router.push('/online-store')} style={{ padding: '5px 14px', fontSize: P.fontSize }}>
                    Push {listings.length - pushedCount} remaining
                  </Btn>
                )}
              </div>
            </div>
          )}

          {/* Empty state when no listings */}
          {!loading && listings.length === 0 && (
            <div style={{ background: P.surface, margin: '0 16px 16px', borderRadius: 12, border: `1px solid ${P.border}`, padding: '64px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img src="/empty-state-listings.svg" alt="" style={{ width: 160, height: 'auto', marginBottom: 20 }} />
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: P.text, marginBottom: 6 }}>No listings yet</div>
              <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginBottom: 20 }}>Import a product and set a selling price to create your first listing</div>
              <Btn variant="primary" onClick={() => router.push('/products')}>Go to Products</Btn>
            </div>
          )}

          {/* Main white card — search + table */}
          {(loading || listings.length > 0) && (
            <div style={{ background: P.surface, margin: '0 16px 16px', borderRadius: 12, border: `1px solid ${P.border}`, overflow: 'hidden' }}>

              {/* Search bar */}
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${P.border}` }}>
                <div style={{ position: 'relative', maxWidth: 360 }}>
                  <svg width="14" height="14" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search listings..."
                    style={{ width: '100%', padding: '7px 12px 7px 32px', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, outline: 'none', fontFamily: P.font, letterSpacing: P.letterSpacing, color: P.text, background: P.bg, boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Loading */}
              {loading && (
                <div style={{ padding: '60px', textAlign: 'center', color: P.textSubdued, fontSize: P.fontSize }}>Loading listings...</div>
              )}

              {/* Table */}
              {!loading && visible.length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ ...th, width: 40 }}></th>
                      <th style={th}>Product</th>
                      <th style={{ ...th }} onClick={() => toggleSort('source')}>
                        Source price <SortArrow col="source"/>
                      </th>
                      <th style={{ ...th }} onClick={() => toggleSort('selling')}>
                        Selling price <SortArrow col="selling"/>
                      </th>
                      <th style={{ ...th }} onClick={() => toggleSort('profit')}>
                        Profit <SortArrow col="profit"/>
                      </th>
                      <th style={{ ...th }} onClick={() => toggleSort('margin')}>
                        Margin <SortArrow col="margin"/>
                      </th>
                      <th style={th}>Shopify</th>
                      <th style={th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map(l => {
                      const imgs = getImages(l.images);
                      const p = profit(l).toFixed(2);
                      const m = margin(l);
                      const isSel = selected?.id === l.id;
                      const isPushing = pushing[l.id];
                      const isPushed = !!l.shopify_product_id;
                      return (
                        <tr key={l.id} className="lst-row"
                          onClick={() => setSelected(isSel ? null : l)}
                          style={{ cursor: 'pointer', background: isSel ? '#f0fdf6' : P.surface }}>
                          <td style={{ ...td, width: 44, paddingRight: 0 }}>
                            {imgs[0]
                              ? <img src={imgs[0]} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 6, border: `1px solid ${P.border}`, display: 'block' }} onError={e => e.target.style.display = 'none'} />
                              : <div style={{ width: 32, height: 32, background: P.bg, borderRadius: 6, border: `1px solid ${P.border}` }} />
                            }
                          </td>
                          <td style={td}>
                            <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>
                              {l.custom_title || l.original_title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: P.textSubdued, marginTop: 1 }}>{l.source_domain}</div>
                          </td>
                          <td style={{ ...td, color: P.textSubdued }}>{sym(l.currency)}{parseFloat(l.source_price_at_listing).toFixed(2)}</td>
                          <td style={{ ...td, fontWeight: 600 }}>{sym(l.currency)}{parseFloat(l.selling_price).toFixed(2)}</td>
                          <td style={{ ...td }}>
                            <span style={{ fontWeight: 650, color: parseFloat(p) > 0 ? P.green : '#d82c0d' }}>
                              {parseFloat(p) > 0 ? '+' : ''}{sym(l.currency)}{p}
                            </span>
                          </td>
                          <td style={td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ height: 4, width: 48, background: P.bg, borderRadius: 2, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.min(parseFloat(m), 100)}%`, background: parseFloat(m) > 30 ? P.green : parseFloat(m) > 10 ? '#f59e0b' : '#d82c0d', borderRadius: 2 }}/>
                              </div>
                              <span style={{ fontSize: '0.75rem', color: P.textSubdued }}>{m}%</span>
                            </div>
                          </td>
                          <td style={td} onClick={e => e.stopPropagation()}>
                            {isPushed ? (
                              <span style={{ fontSize: '0.6875rem', padding: '2px 8px', borderRadius: 20, background: '#cdfed4', color: '#006847', fontWeight: 600 }}>✓ Pushed</span>
                            ) : (
                              <Btn onClick={() => handlePush(l.id)} disabled={isPushing} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                                {isPushing ? '...' : 'Push'}
                              </Btn>
                            )}
                          </td>
                          <td style={td} onClick={e => e.stopPropagation()}>
                            <Btn variant="danger" onClick={() => handleUnlist(l.id)} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Remove</Btn>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {/* No filter results */}
              {!loading && visible.length === 0 && listings.length > 0 && (
                <div style={{ padding: '48px', textAlign: 'center' }}>
                  <div style={{ fontWeight: 500, fontSize: P.fontSize, color: P.text, marginBottom: 4 }}>No listings match your filter</div>
                  <div style={{ fontSize: P.fontSize, color: P.textSubdued }}>Try a different filter or search term</div>
                </div>
              )}
            </div>
          )}

          {/* Learn more */}
          <div style={{ padding: '4px 20px 32px', textAlign: 'center', fontSize: P.fontSize }}>
            <span style={{ color: '#2b6cb0', cursor: 'pointer' }}>Learn more about listings</span>
          </div>
        </div>

        {/* ── Detail panel ── */}
        {selected && (
          <div className="lst-detail" style={{ width: 320, flexShrink: 0, background: P.surface, borderLeft: `1px solid ${P.border}`, overflowY: 'auto', display: 'flex', flexDirection: 'column', animation: 'slideIn .25s ease' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${P.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: P.surface, zIndex: 10 }}>
              <span style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text }}>Listing details</span>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: P.textSubdued, lineHeight: 1 }}>×</button>
            </div>

            <div style={{ padding: '16px', flex: 1 }}>
              {getImages(selected.images)[0] && (
                <img src={getImages(selected.images)[0]} alt="" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 10, marginBottom: 14, border: `1px solid ${P.border}` }} onError={e => e.target.style.display = 'none'} />
              )}

              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: P.text, marginBottom: 4, lineHeight: 1.4 }}>
                {selected.custom_title || selected.original_title}
              </div>
              <div style={{ fontSize: '0.75rem', color: P.textSubdued, marginBottom: 16 }}>
                {selected.source_domain} · <a href={selected.source_url} target="_blank" rel="noreferrer" style={{ color: '#2b6cb0', textDecoration: 'none' }}>View source ↗</a>
              </div>

              <div style={{ background: P.bg, borderRadius: 10, border: `1px solid ${P.border}`, overflow: 'hidden', marginBottom: 14 }}>
                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${P.border}` }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pricing</div>
                </div>
                {[
                  { label: 'You pay (source)', value: `${sym(selected.currency)}${parseFloat(selected.source_price_at_listing).toFixed(2)}`, color: P.text },
                  { label: 'Customer pays', value: `${sym(selected.currency)}${parseFloat(selected.selling_price).toFixed(2)}`, color: P.text, bold: true },
                  { label: 'Profit per sale', value: `+${sym(selected.currency)}${profit(selected).toFixed(2)}`, color: P.green, bold: true },
                  { label: 'Margin', value: `${margin(selected)}%`, color: parseFloat(margin(selected)) > 20 ? P.green : P.textSubdued },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', borderBottom: i < 3 ? `1px solid ${P.border}` : 'none', background: i === 2 ? '#f0fdf6' : 'transparent' }}>
                    <span style={{ fontSize: P.fontSize, color: P.textSubdued }}>{r.label}</span>
                    <span style={{ fontSize: P.fontSize, fontWeight: r.bold ? 650 : 500, color: r.color }}>{r.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.75rem', color: P.textSubdued }}>Profit margin</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: parseFloat(margin(selected)) > 20 ? P.green : '#f59e0b' }}>{margin(selected)}%</span>
                </div>
                <div style={{ height: 6, background: P.bg, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(parseFloat(margin(selected)), 100)}%`, background: parseFloat(margin(selected)) > 30 ? P.green : parseFloat(margin(selected)) > 10 ? '#f59e0b' : '#d82c0d', borderRadius: 3, transition: 'width .4s' }}/>
                </div>
              </div>

              <div style={{ background: P.bg, borderRadius: 8, padding: '10px 12px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Shopify</div>
                  <div style={{ fontSize: P.fontSize, color: selected.shopify_product_id ? P.green : P.textSubdued, fontWeight: 500 }}>
                    {selected.shopify_product_id ? '✓ Pushed to store' : 'Not pushed yet'}
                  </div>
                </div>
                {!selected.shopify_product_id && (
                  <Btn variant="green" onClick={() => handlePush(selected.id)} disabled={pushing[selected.id]} style={{ padding: '5px 12px', fontSize: '0.75rem' }}>
                    {pushing[selected.id] ? 'Pushing...' : 'Push now'}
                  </Btn>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Btn onClick={() => router.push('/products')} style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}>
                  Edit product
                </Btn>
                <Btn variant="danger" onClick={() => handleUnlist(selected.id)} style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}>
                  Remove listing
                </Btn>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
