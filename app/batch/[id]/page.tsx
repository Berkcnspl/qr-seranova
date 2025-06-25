"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "../page.module.css";

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
  const batchId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [trays, setTrays] = useState<Tray[]>(Array(4).fill(emptyTray));
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [moveIndex, setMoveIndex] = useState<number | null>(null);
  const [targetBatch, setTargetBatch] = useState<string>("");
  const [modalIndex, setModalIndex] = useState<number | null>(null);

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

  const handleCheckboxToggle = (trayIndex: number, dayIndex: number) => {
    setTrays((prev) => {
      const updated = [...prev];
      const tray = { ...updated[trayIndex] };
      tray.wateringSchedule[dayIndex] = !tray.wateringSchedule[dayIndex];
      updated[trayIndex] = tray;
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

  return (
    <main className={styles.main}>
      <h1>Batch {batchId?.toString().padStart(3, "0")}</h1>
      <button className={styles.backButton} onClick={() => router.push("/")}>
        Ana Sayfaya Dön
      </button>
      <div className={styles.grid}>
        {trays.map((tray, index) => (
          <div
            key={index}
            className={styles.trayCard}
            onClick={() => setModalIndex(index)}
          >
            {editIndex === index ? (
              <input
                type="text"
                value={tray.name}
                onChange={(e) =>
                  handleFieldChange(index, "name", e.target.value)
                }
                onBlur={() => setEditIndex(null)}
                autoFocus
              />
            ) : (
              <div onClick={() => setEditIndex(index)}>
                {tray.name || `Tepsi ${index + 1}`}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.movePrompt}>
        <label>Tepsi Taşı: </label>
        <select
          onChange={(e) => setMoveIndex(Number(e.target.value))}
          defaultValue=""
        >
          <option value="" disabled>
            Tepsi seçin
          </option>
          {trays.map((tray, i) => (
            <option key={i} value={i}>
              {tray.name || `Tepsi ${i + 1}`}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Hedef Batch ID"
          value={targetBatch}
          onChange={(e) => setTargetBatch(e.target.value)}
        />
        <button onClick={handleTrayMove}>Taşı</button>
      </div>

      {modalIndex !== null && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button
              className={styles.modalClose}
              onClick={() => setModalIndex(null)}
            >
              ✕
            </button>
            <h2>Tepsi {modalIndex + 1} Detayları</h2>
            <label>
              Ekim Tarihi:
              <input
                type="date"
                value={trays[modalIndex].sowingDate}
                onChange={(e) =>
                  handleFieldChange(modalIndex, "sowingDate", e.target.value)
                }
              />
            </label>
            <label>
              Işığa Alım Tarihi:
              <input
                type="date"
                value={trays[modalIndex].lightOnDate}
                onChange={(e) =>
                  handleFieldChange(modalIndex, "lightOnDate", e.target.value)
                }
              />
            </label>
            <div>
              <strong>Sulama Takvimi:</strong>
              <div className={styles.wateringGrid}>
                {trays[modalIndex].wateringSchedule.map((val, i) => (
                  <label key={i}>
                    <input
                      type="checkbox"
                      checked={val}
                      onChange={() => handleCheckboxToggle(modalIndex, i)}
                    />
                    Gün {i + 1}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
