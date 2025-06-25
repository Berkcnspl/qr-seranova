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
  const params = useParams<{ id: string }>();
  const batchId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [trays, setTrays] = useState<Tray[]>(Array(4).fill(emptyTray));
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [selectedTray, setSelectedTray] = useState<number | null>(null);
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

  const toggleWateringDay = (trayIndex: number, dayIndex: number) => {
    setTrays((prev) => {
      const updated = [...prev];
      const tray = { ...updated[trayIndex] };
      tray.wateringSchedule = [...tray.wateringSchedule];
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
            onClick={() => setSelectedTray(index)}
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
              <div onClick={() => setEditIndex(index)}>{tray.name || "-"}</div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.moveSection}>
        <label>Batch Taşı: </label>
        <select
          value={moveIndex !== null ? moveIndex : ""}
          onChange={(e) =>
            setMoveIndex(e.target.value === "" ? null : Number(e.target.value))
          }
        >
          <option value="">Tepsi Seç</option>
          {trays.map((tray, index) => (
            <option key={index} value={index}>
              Tepsi {index + 1}
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

      {selectedTray !== null && (
        <div className={styles.modalOverlay} onClick={() => setSelectedTray(null)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <strong>Tepsi {selectedTray + 1} Detayları</strong>
              <button
                className={styles.closeButton}
                onClick={() => setSelectedTray(null)}
              >
                ×
              </button>
            </div>
            <label>
              Ekim Tarihi:
              <input
                type="date"
                value={trays[selectedTray].sowingDate}
                onChange={(e) =>
                  handleFieldChange(selectedTray, "sowingDate", e.target.value)
                }
              />
            </label>
            <label>
              Işığa Alım Tarihi:
              <input
                type="date"
                value={trays[selectedTray].lightOnDate}
                onChange={(e) =>
                  handleFieldChange(selectedTray, "lightOnDate", e.target.value)
                }
              />
            </label>
            <div>
              <strong>Sulama Takvimi:</strong>
              <div className={styles.wateringSchedule}>
                {trays[selectedTray].wateringSchedule.map((checked, i) => (
                  <label key={i}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleWateringDay(selectedTray, i)}
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
