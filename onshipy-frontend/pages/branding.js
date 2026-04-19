import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function Branding() {
  const router = useRouter();
  useEffect(() => { if (!localStorage.getItem('onshipy_token')) router.push('/login'); }, []);
  return (
    <Layout>
      <div style={{ padding: '28px 32px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 4px 0' }}>Branding</h1>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>Customize your store's logo, colors and style</p>
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '14px' }}>🎨</div>
          <div style={{ fontWeight: '600', fontSize: '16px', color: '#111', marginBottom: '6px' }}>Branding tools coming soon</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Customize your store logo, colors, and customer-facing branding</div>
        </div>
      </div>
    </Layout>
  );
}