import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const { token, seller } = router.query;
    if (token && seller) {
      localStorage.setItem('onshipy_token', token);
      localStorage.setItem('onshipy_seller', decodeURIComponent(seller));
      router.push('/dashboard');
    }
  }, [router.query]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif', background: '#fff' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#111', marginBottom: '8px' }}>Signing you in...</div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>Please wait</div>
      </div>
    </div>
  );
}