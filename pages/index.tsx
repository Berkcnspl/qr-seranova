// pages/index.tsx
import Link from 'next/link';

const batches = Array.from({ length: 84 }, (_, i) => ({
  id: (i + 1).toString().padStart(3, '0'), // 001, 002, ..., 084
}));

export default function Home() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '1.5rem' }}>
        Tüm Batch'ler (84 Raf)
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
        {batches.map((batch) => (
          <Link key={batch.id} href={`/batch/${batch.id}`}>
            <div style={{
              border: '1px solid #ddd',
              borderRadius: '10px',
              padding: '1rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: '#fafafa'
            }}>
              <div style={{ fontWeight: 'bold' }}>Batch {batch.id}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Detaylara Git</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
