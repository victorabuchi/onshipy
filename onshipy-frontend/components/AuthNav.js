import Link from 'next/link';

const NAV_LINKS = ['Why Onshipy', 'Products', 'Pricing', 'Enterprise'];

export default function AuthNav({ startHref = '/register', loginHref = '/login' }) {
  return (
    <nav style={{
      background: '#1a1a1a',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      padding: '0 32px',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      position: 'relative',
      zIndex: 100,
      flexShrink: 0,
      fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif",
    }}>

      {/* Logo */}
      <Link href="/" style={{ display:'flex', alignItems:'center', gap:9, textDecoration:'none', marginRight:32, flexShrink:0 }}>
        <img src="/favicon-32x32.png" alt="Onshipy" width={22} height={22} style={{ filter:'brightness(0) invert(1)', flexShrink:0 }} />
        <span style={{ fontSize:17, fontWeight:800, color:'#fff', letterSpacing:'-0.4px' }}>Onshipy</span>
      </Link>

      {/* Nav links */}
      <div style={{ display:'flex', alignItems:'center', gap:2, flex:1 }}>
        {NAV_LINKS.map(label => (
          <a
            key={label}
            href="#"
            style={{ padding:'6px 11px', fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.6)', textDecoration:'none', borderRadius:7, transition:'color 0.15s', whiteSpace:'nowrap' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
          >
            {label}
          </a>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
        <Link
          href={loginHref}
          style={{ padding:'7px 16px', fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.75)', textDecoration:'none', borderRadius:8, transition:'color 0.15s', whiteSpace:'nowrap' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
        >
          Log in
        </Link>
        <Link
          href={startHref}
          style={{ padding:'8px 20px', fontSize:13, fontWeight:700, color:'#1a1a1a', background:'#fff', textDecoration:'none', borderRadius:24, whiteSpace:'nowrap', transition:'opacity 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Start for free
        </Link>
      </div>
    </nav>
  );
}
