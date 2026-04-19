import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function Resources() {
  const router = useRouter();
  useEffect(() => { if (!localStorage.getItem('onshipy_token')) router.push('/login'); }, []);
  return (
    <Layout>
      <div style={{ padding: '28px 32px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 4px 0' }}>Resources</h1>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>Guides, tips and tools to grow your business</p>
        <div style={{ display: 'grid', gap: '12px' }}>
          {[
            { title: 'How to import your first product', desc: 'A complete guide to importing from any website', time: '5 min read', tag: 'Guide' },
            { title: 'Setting the right profit margins', desc: 'Pricing strategy for resellers and dropshippers', time: '8 min read', tag: 'Strategy' },
            { title: 'Connecting Shopify to Onshipy', desc: 'Step-by-step Shopify integration tutorial', time: '10 min read', tag: 'Tutorial' },
            { title: 'Top fashion brands to resell in 2025', desc: 'The most profitable brands to import from right now', time: '6 min read', tag: 'Trending' },
            { title: 'How auto-purchase works', desc: 'Understanding the automatic fulfillment engine', time: '4 min read', tag: 'Feature' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: '16px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', padding: '2px 8px', background: '#f0fdf4', color: '#00a47c', borderRadius: '20px', fontWeight: '600' }}>{item.tag}</span>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>{item.time}</span>
                </div>
                <div style={{ fontWeight: '600', fontSize: '14px', color: '#111', marginBottom: '2px' }}>{item.title}</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>{item.desc}</div>
              </div>
              <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}