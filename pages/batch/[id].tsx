"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "./batch.module.css";

const emptyTray = {
  plantName: "",
  sowingDate: "",
  lightDate: "",
  watering: Array(10).fill(false),
};

type Tray = typeof emptyTray;

type BatchData = {
  trays: Tray[];
};

export default function BatchPage() {
  const router = useRouter();
  const batchId = router.query.id as string;
  const [trays, setTrays] = useState<Tray[]>(Array(4).fill({ ...emptyTray }));
  const [selectedTrayIndex, setSelectedTrayIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [moveToBatchId, setMoveToBatchId] = useState("");

  useEffect(() => {
    if (batchId) {
      const storedData = localStorage.getItem(`batch-${batchId}`);
      if (storedData) {
        setTrays(JSON.parse(storedData));
      }
    }
  }, [batchId]);

  useEffect(() => {
    if (batchId) {
      localStorage.setItem(`batch-${batchId}`, JSON.stringify(trays));
    }
  }, [trays, batchId]);

  const handleFieldChange = (index: number, field: keyof Tray, value: string) => {
    const updated = [...trays];
    updated[index][field] = value;
    setTrays(updated);
  };

  const handleWateringToggle = (trayIndex: number, dayIndex: number) => {
    const updated = [...trays];
    updated[trayIndex].watering[dayIndex] = !updated[trayIndex].watering[dayIndex];
    setTrays(updated);
  };

  const handleMoveTray = () => {
    if (selectedTrayIndex === null || moveToBatchId === batchId) return;

    const trayToMove = trays[selectedTrayIndex];
    const destinationData = localStorage.getItem(`batch-${moveToBatchId}`);
    let destinationTrays: Tray[] = Array(4).fill({ ...emptyTray });

    if (destinationData) {
      destinationTrays = JSON.parse(destinationData);
    }

    const emptyIndex = destinationTrays.findIndex(
      (t: Tray) => t.plantName === "" && t.sowingDate === "" && t.lightDate === ""
    );

    if (emptyIndex === -1) {
      alert("Seçilen batch dolu. Lütfen başka bir batch seçin.");
      return;
    }

    destinationTrays[emptyIndex] = trayToMove;
    localStorage.setItem(`batch-${moveToBatchId}`, JSON.stringify(destinationTrays));

    const updatedSource = [...trays];
    updatedSource[selectedTrayIndex] = { ...emptyTray };
    setTrays(updatedSource);
    setShowModal(false);
    setMoveToBatchId("");
  };

  return (
    <div className={styles.pageContainer}>
      <button className={styles.backButton} onClick={() => router.push("/")}>Anasayfaya Dön</button>
      <h2 className={styles.batchTitle}>Batch {batchId?.padStart(3, "0")}</h2>
      <div className={styles.grid}>
        {trays.map((tray: Tray, index: number) => (
          <div key={index} className={styles.trayCard}>
            {selectedTrayIndex === index ? (
              <div className={styles.trayDetailsModal}>
                <h3 className={styles.modalTitle}>Tepsi {index + 1} Detayları</h3>
                <label>
                  Ekim Tarihi:
                  <input
                    type="date"
                    value={tray.sowingDate}
                    onChange={(e) => handleFieldChange(index, "sowingDate", e.target.value)}
                  />
                </label>
                <label>
                  Işığa Alım Tarihi:
                  <input
                    type="date"
                    value={tray.lightDate}
                    onChange={(e) => handleFieldChange(index, "lightDate", e.target.value)}
                  />
                </label>
                <div className={styles.wateringSection}>
                  <span>Sulama Takvimi:</span>
                  {tray.watering.map((day, dayIndex) => (
                    <label key={dayIndex}>
                      <input
                        type="checkbox"
                        checked={day}
                        onChange={() => handleWateringToggle(index, dayIndex)}
                      />
                      Gün {dayIndex + 1}
                    </label>
                  ))}
                </div>
                <button onClick={() => setSelectedTrayIndex(null)}>Kapat</button>
                <button onClick={() => setShowModal(true)}>Batch Taşı</button>
              </div>
            ) : (
              <div onClick={() => setSelectedTrayIndex(index)}>
                <h4 className={styles.plantName}>{tray.plantName || "-"}</h4>
              </div>
            )}
          </div>
        ))}
      </div>
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Hangi Batch'e taşımak istiyorsunuz?</h3>
            <input
              type="text"
              placeholder="Örn: 005"
              value={moveToBatchId}
              onChange={(e) => setMoveToBatchId(e.target.value)}
            />
            <button onClick={handleMoveTray}>Taşı</button>
            <button onClick={() => setShowModal(false)}>İptal</button>
          </div>
        </div>
      )}
    </div>
  );
}
