"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

export type Tray = {
  name: string;
  sowingDate: string;
  wateringSchedule: boolean[];
  lightOnDate: string;
};

const emptyTray: Tray = {
  name: "",
  sowingDate: "",
  wateringSchedule: Array(10).fill(false),
  lightOnDate: "",
};

export default function BatchPage() {
  const router = useRouter();
  const params = useParams();
  const batchId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [trays, setTrays] = useState<Tray[]>(Array(4).fill(emptyTray));
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [moveIndex, setMoveIndex] = useState<number | null>(null);
  const [targetBatch, setTargetBatch] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined" && batchId) {
      const saved = localStorage.getItem(`batch-${batchId}`);
      if (saved) {
        setTrays(JSON.parse(saved));
      }
    }
  }, [batchId]);

  useEffect(() => {
    if (typeof window !== "undefined" && batchId) {
      localStorage.setItem(`batch-${batchId}`, JSON.stringify(trays));
    }
  }, [trays, batchId]);

  const handleFieldChange = (
    index: number,
    field: keyof Tray,
    value: string
  ) => {
    setTrays((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  const handleTrayMove = () => {
    if (moveIndex === null || targetBatch === batchId) return;

    const trayToMove = trays[moveIndex];
    const updatedCurrent = [...trays];
    updatedCurrent[moveIndex] = emptyTray;
    setTrays(updatedCurrent);

    const targetKey = `batch-${targetBatch}`;
    const targetBatchData = localStorage.getItem(targetKey);
    const targetTrays: Tray[] = targetBatchData
      ? JSON.parse(targetBatchData)
      : Array(4).fill(emptyTray);

    const updatedTarget = [...targetTrays];
    const emptySpotIndex = updatedTarget.findIndex((tray) => tray.name === "");

    if (emptySpotIndex !== -1) {
      updatedTarget[emptySpotIndex] = trayToMove;
      localStorage.setItem(targetKey, JSON.stringify(updatedTarget));
    }

    setMoveIndex(null);
    setTargetBatch("");
  };

  // Modal için state ve fonksiyonlar
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  const toggleModal = (index: number | null) => {
    setModalIndex(index);
  };

  const toggleWateringDay = (index: number, day: number) => {
    setTrays((prev) => {
      const updated = [...prev];
      const wateringSchedule = [...updated[index].wateringSchedule];
      wateringSchedule[day] = !wateringSchedule[day];
      updated[index] = { ...updated[index], wateringSchedule };
      return updated;
    });
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Batch {batchId?.toString().padStart(3, "0")}</h1>
      <button className={styles.backButton} onClick={() => router.push("/")}>
        Ana Sayfaya Dön
      </button>
      <div className={styles.grid}>
        {trays.map((tray, index) => (
          <div
            key={index}
            className={styles.trayCard}
            onClick={() => toggleModal(index)}
          >
            {editIndex === index ? (
              <input
                type="text"
                value={tray.name}
                onChange={(e) => handleFieldChange(index, "name", e.target.value)}
                onBlur={() => setEditIndex(null)}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div onClick={(e) => {
                e.stopPropagation();
                setEditIndex(index);
              }}>
                {tray.name || "-"}
              </div>
            )}
          </div>
        ))}
      </div>

      {modalIndex !== null && (
        <div className={styles.modalOverlay} onClick={() => toggleModal(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Tepsi {modalIndex + 1} Detayları</h2>
              <button
                className={styles.closeButton}
                onClick={() => toggleModal(null)}
              >
                &times;
              </button>
            </div>

            <label>Ekim Tarihi:</label>
            <input
              type="date"
              value={trays[modalIndex].sowingDate}
              onChange={(e) =>
                handleFieldChange(modalIndex, "sowingDate", e.target.value)
              }
            />

            <label>Işığa Alım Tarihi:</label>
            <input
              type="date"
              value={trays[modalIndex].lightOnDate}
              onChange={(e) =>
                handleFieldChange(modalIndex, "lightOnDate", e.target.value)
              }
            />

            <strong>Sulama Takvimi:</strong>
            <div className={styles.wateringSchedule}>
              {trays[modalIndex].wateringSchedule.map((water, day) => (
                <label key={day}>
                  <input
                    type="checkbox"
                    checked={water}
                    onChange={() => toggleWateringDay(modalIndex, day)}
                  />
                  Gün {day + 1}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={styles.moveSection}>
        {moveIndex === null ? (
          <button onClick={() => setMoveIndex(0)}>Batch Taşı</button>
        ) : (
          <>
            <label>Taşınacak Batch ID:</label>
            <input
              type="text"
              value={targetBatch}
              onChange={(e) => setTargetBatch(e.target.value)}
            />
            <button onClick={handleTrayMove}>Taşı</button>
            <button onClick={() => setMoveIndex(null)}>İptal</button>
          </>
        )}
      </div>
    </main>
  );
}
