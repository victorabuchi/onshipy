import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function Help() {
  const router = useRouter();
  useEffect(() => { if (!localStorage.getItem('onshipy_token')) router.push('/login'); }, []);
  return (
    <Layout>
      <div style={{ padding: '28px 32px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 4px 0' }}>Help & Support</h1>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>Get help with Onshipy</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {[
            { title: 'Documentation', desc: 'Step-by-step guides and tutorials', icon: '📖', href: '#' },
            { title: 'Video tutorials', desc: 'Watch how to use every feature', icon: '🎥', href: '#' },
            { title: 'Contact support', desc: 'Get help from our team', icon: '💬', href: 'mailto:support@onshipy.com' },
            { title: 'Community', desc: 'Join other Onshipy sellers', icon: '👥', href: '#' },
          ].map((item, i) => (
            <a key={i} href={item.href} style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb', padding: '20px', textDecoration: 'none', display: 'block' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{item.icon}</div>
              <div style={{ fontWeight: '600', fontSize: '14px', color: '#111', marginBottom: '4px' }}>{item.title}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>{item.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </Layout>
  );
}