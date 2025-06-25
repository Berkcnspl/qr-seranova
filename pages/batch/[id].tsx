import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const emptyTray = {
  bitki: '',
  ekimTarihi: '',
  isigAlimTarihi: '',
  sulama: Array(10).fill(false),
};

export default function BatchPage() {
  const router = useRouter();
  const { id } = router.query;
  const batchId = typeof id === 'string' ? id : '001';

  const [trays, setTrays] = useState(() => Array(4).fill(emptyTray));
  const [selectedTrayIndex, setSelectedTrayIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTrayIndex, setActiveTrayIndex] = useState<number | null>(null);
  const [destinationBatch, setDestinationBatch] = useState('');

  // Yükleme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`batch-${batchId}`);
      if (stored) {
        setTrays(JSON.parse(stored));
      }
    }
  }, [batchId]);

  // Kaydetme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`batch-${batchId}`, JSON.stringify(trays));
    }
  }, [trays, batchId]);

  const handleFieldChange = (index: number, field: string, value: string | boolean) => {
    const updated = [...trays];
    if (field === 'sulama' && typeof value === 'boolean') {
      updated[index].sulama = [...updated[index].sulama];
      updated[index].sulama = updated[index].sulama.map((v, i) =>
        i === selectedTrayIndex ? value : v
      );
    } else {
      (updated[index] as any)[field] = value;
    }
    setTrays(updated);
  };

  const handleSulamaToggle = (trayIndex: number, day: number) => {
    const updated = [...trays];
    updated[trayIndex].sulama[day] = !updated[trayIndex].sulama[day];
    setTrays(updated);
  };

  const handleBatchTransfer = () => {
    if (!destinationBatch || activeTrayIndex === null) return;
    const destinationKey = `batch-${destinationBatch}`;
    const trayToMove = trays[activeTrayIndex];

    let destinationTrays = Array(4).fill(emptyTray);
    const stored = localStorage.getItem(destinationKey);
    if (stored) destinationTrays = JSON.parse(stored);

    const emptyIndex = destinationTrays.findIndex(t => !t.bitki);
    if (emptyIndex === -1) {
      alert('Hedef batch dolu!');
      return;
    }

    destinationTrays[emptyIndex] = trayToMove;
    localStorage.setItem(destinationKey, JSON.stringify(destinationTrays));

    const updated = [...trays];
    updated[activeTrayIndex] = { ...emptyTray };
    setTrays(updated);
    setShowModal(false);
    setActiveTrayIndex(null);
    setDestinationBatch('');
  };

  return (
    <div style={{ padding: '2rem', background: '#000', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '1.5rem' }}>
        Batch {batchId}
      </h1>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {trays.map((tray, index) => (
          <div key={index} style={{
            background: '#2f2f2f',
            padding: '1rem',
            borderRadius: '12px',
            width: '300px',
            minHeight: '150px',
            position: 'relative'
          }}>
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleFieldChange(index, 'bitki', e.currentTarget.textContent || '')}
              style={{
                background: '#fff',
                color: '#000',
                padding: '0.5rem 1rem',
                textAlign: 'center',
                fontWeight: 600,
                borderRadius: '6px',
                cursor: 'text',
                marginBottom: '0.75rem'
              }}
            >
              {tray.bitki || 'İsim Yok'}
            </div>

            <button
              onClick={() => setSelectedTrayIndex(index)}
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                background: '#fff',
                color: '#000',
                fontWeight: 600,
                border: 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: 'pointer'
              }}
            >
              Detaylar
            </button>

            <button
              onClick={() => {
                setShowModal(true);
                setActiveTrayIndex(index);
              }}
              style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                background: '#ffcc00',
                color: '#000',
                fontWeight: 600,
                border: 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: 'pointer'
              }}
            >
              Batch Taşı
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push('/')}
        style={{
          marginTop: '2rem',
          background: '#fff',
          color: '#000',
          padding: '10px 20px',
          fontWeight: 600,
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Ana Sayfaya Dön
      </button>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            color: '#000',
            padding: '2rem',
            borderRadius: '12px',
            minWidth: '300px',
            textAlign: 'center'
          }}>
            <h2>Hangi Batch'e Taşımak İstiyorsun?</h2>
            <select
              value={destinationBatch}
              onChange={(e) => setDestinationBatch(e.target.value)}
              style={{ margin: '1rem 0', padding: '0.5rem', fontSize: '16px' }}
            >
              <option value="">Batch seçin</option>
              {Array.from({ length: 84 }, (_, i) => (
                <option
                  key={i}
                  value={(i + 1).toString().padStart(3, '0')}
                  disabled={(i + 1).toString().padStart(3, '0') === batchId}
                >
                  Batch {(i + 1).toString().padStart(3, '0')}
                </option>
              ))}
            </select>
            <br />
            <button
              onClick={handleBatchTransfer}
              style={{
                background: '#000',
                color: '#fff',
                padding: '10px 20px',
                fontWeight: 600,
                borderRadius: '6px',
                marginRight: '1rem'
              }}
            >
              Taşı
            </button>
            <button
              onClick={() => setShowModal(false)}
              style={{
                background: '#ccc',
                color: '#000',
                padding: '10px 20px',
                fontWeight: 600,
                borderRadius: '6px'
              }}
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
