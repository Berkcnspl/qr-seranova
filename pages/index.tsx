import Link from 'next/link';

const batches = Array.from({ length: 84 }, (_, i) => ({
  id: (i + 1).toString().padStart(3, '0'),
}));

export default function Home() {
  return (
    <div style={{ padding: '2rem', background: '#000', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <img
          src="/images/seranova-dashboard-mail.logo.png"
          alt="Seranova Logo"
          style={{ height: '40px', width: 'auto' }}
        />
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>
          Batch Takip Sistemi
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
        {batches.map((batch) => (
          <Link key={batch.id} href={`/batch/${batch.id}`}>
            <div style={{
              border: '1px solid #ddd',
              borderRadius: '10px',
              padding: '1rem',
              textAlign: 'center',
              background: '#fff',
              color: '#000',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease-in-out'
            }}>
              <div style={{ fontSize: '16px', marginBottom: '4px' }}>Batch {batch.id}</div>
              <div style={{ fontSize: '13px' }}>Detaylara Git</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
