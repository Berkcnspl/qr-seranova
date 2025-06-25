import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface Tepsi {
  id: number;
  bitki: string;
}

export default function BatchDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [tepsiler, setTepsiler] = useState<Tepsi[]>([
    { id: 1, bitki: 'Boş' },
    { id: 2, bitki: 'Boş' },
    { id: 3, bitki: 'Boş' },
    { id: 4, bitki: 'Boş' },
  ]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '1.5rem' }}>
        Batch {id}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
        {tepsiler.map((tepsi) => (
          <div key={tepsi.id} style={{
            border: '1px solid #ccc',
            borderRadius: '10px',
            padding: '1rem',
            background: '#f9f9f9'
          }}>
            <div style={{ fontWeight: 'bold' }}>Tepsi {tepsi.id}</div>
            <div style={{ marginTop: '0.5rem' }}>Bitki: {tepsi.bitki}</div>
            {/* Buraya tıklanabilir detay (modal ya da inline) eklenecek */}
          </div>
        ))}
      </div>
    </div>
  );
}
