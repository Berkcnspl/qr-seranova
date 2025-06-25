import { useRouter } from 'next/router';
import { useState } from 'react';

interface Tepsi {
  id: number;
  bitki: string;
  ekimTarihi?: string;
  isigAlimTarihi?: string;
  sulamaTakvimi: boolean[];
}

export default function BatchDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [tepsiler, setTepsiler] = useState<Tepsi[]>([
    { id: 1, bitki: '', sulamaTakvimi: Array(10).fill(false) },
    { id: 2, bitki: '', sulamaTakvimi: Array(10).fill(false) },
    { id: 3, bitki: '', sulamaTakvimi: Array(10).fill(false) },
    { id: 4, bitki: '', sulamaTakvimi: Array(10).fill(false) },
  ]);

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [openModalIndex, setOpenModalIndex] = useState<number | null>(null);

  const handleBitkiClick = (index: number) => {
    setEditIndex(index);
    setEditValue(tepsiler[index].bitki);
  };

  const handleEditSave = (index: number) => {
    const updated = [...tepsiler];
    updated[index].bitki = editValue.trim();
    setTepsiler(updated);
    setEditIndex(null);
  };

  const closeModal = () => {
    setOpenModalIndex(null);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#000', marginBottom: '2rem' }}>
        Batch {id}
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem'
      }}>
        {tepsiler.map((tepsi, index) => (
          <div
            key={tepsi.id}
            onClick={() => setOpenModalIndex(index)}
            style={{
              border: '2px solid #ddd',
              borderRadius: '12px',
              height: '160px',
              background: '#f4f4f4 url("/images/tray-placeholder.png") center/contain no-repeat',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              position: 'relative',
              paddingBottom: '1rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            {editIndex === index ? (
              <input
                autoFocus
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => handleEditSave(index)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  padding: '4px 8px',
                  fontSize: '14px',
                  borderRadius: '6px',
                  border: '1px solid #ccc'
                }}
              />
            ) : (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleBitkiClick(index);
                }}
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                {tepsi.bitki || '–'}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {openModalIndex !== null && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              padding: '2rem',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              position: 'relative'
            }}
          >
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                fontSize: '20px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer'
              }}
            >
              ×
            </button>

            <h2 style={{ fontSize: '20px', marginBottom: '1rem' }}>
              Tepsi {tepsiler[openModalIndex].id} Detayları
            </h2>

            <label style={{ display: 'block', marginBottom: '1rem' }}>
              Ekim Tarihi:
              <input
                type="date"
                value={tepsiler[openModalIndex].ekimTarihi || ''}
                onChange={(e) => {
                  const updated = [...tepsiler];
                  updated[openModalIndex].ekimTarihi = e.target.value;
                  setTepsiler(updated);
                }}
                style={{ marginLeft: '1rem' }}
              />
            </label>

            <label style={{ display: 'block', marginBottom: '1rem' }}>
              Işığa Alım Tarihi:
              <input
                type="date"
                value={tepsiler[openModalIndex].isigAlimTarihi || ''}
                onChange={(e) => {
                  const updated = [...tepsiler];
                  updated[openModalIndex].isigAlimTarihi = e.target.value;
                  setTepsiler(updated);
                }}
                style={{ marginLeft: '1rem' }}
              />
            </label>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Sulama Takvimi:</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {tepsiler[openModalIndex].sulamaTakvimi.map((tikli, i) => (
                  <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="checkbox"
                      checked={tikli}
                      onChange={() => {
                        const updated = [...tepsiler];
                        updated[openModalIndex].sulamaTakvimi[i] = !tikli;
                        setTepsiler(updated);
                      }}
                    />
                    Gün {i + 1}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
