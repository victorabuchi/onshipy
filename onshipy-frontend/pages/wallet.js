import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function Wallet() {
  const router = useRouter();
  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    if (!t) router.push('/login');
  }, []);

  return (
    <Layout>
      <div style={{ padding: '28px 32px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 4px 0' }}>Wallet</h1>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>Manage your Onshipy balance and payouts</p>
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '14px' }}>💳</div>
          <div style={{ fontWeight: '600', fontSize: '16px', color: '#111', marginBottom: '6px' }}>Wallet coming soon</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Receive payouts and manage your balance here</div>
        </div>
      </div>
    </Layout>
  );
}