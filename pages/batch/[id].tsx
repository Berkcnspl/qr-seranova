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
  const batchId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [trays, setTrays] = useState<Tray[]>(Array(4).fill(emptyTray));
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [selectedTrayIndex, setSelectedTrayIndex] = useState<number | null>(null);
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

  return (
    <main className={styles.main}>
      <h1>Batch {batchId?.toString().padStart(3, "0")}</h1>
      <button className={styles.backButton} onClick={() => router.push("/")}>Ana Sayfaya Dön</button>

      <div className={styles.grid}>
        {trays.map((tray, index) => (
          <div
            key={index}
            className={styles.trayCard}
            onClick={() => setSelectedTrayIndex(index)}
          >
            <div>{tray.name || "-"}</div>
          </div>
        ))}
      </div>

      <button
        className={styles.moveButton}
        onClick={() => setMoveIndex(0)}
        style={{ marginTop: "2rem" }}
      >
        Batch Taşı
      </button>

      {moveIndex !== null && (
        <div className={styles.movePrompt}>
          <label>Taşınacak Batch ID:</label>
          <input
            type="text"
            value={targetBatch}
            onChange={(e) => setTargetBatch(e.target.value)}
          />
          <button onClick={handleTrayMove}>Taşı</button>
          <button onClick={() => setMoveIndex(null)}>iptal</button>
        </div>
      )}

      {selectedTrayIndex !== null && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button
              className={styles.closeModal}
              onClick={() => setSelectedTrayIndex(null)}
            >
              X
            </button>
            <h2>Tepsi {selectedTrayIndex + 1} Detayları</h2>
            <label>Ekim Tarihi:</label>
            <input
              type="date"
              value={trays[selectedTrayIndex].sowingDate}
              onChange={(e) =>
                handleFieldChange(selectedTrayIndex, "sowingDate", e.target.value)
              }
            />
            <label>Işığa Alım Tarihi:</label>
            <input
              type="date"
              value={trays[selectedTrayIndex].lightOnDate}
              onChange={(e) =>
                handleFieldChange(selectedTrayIndex, "lightOnDate", e.target.value)
              }
            />
            <div>
              <strong>Sulama Takvimi:</strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {trays[selectedTrayIndex].wateringSchedule.map((day, i) => (
                  <label key={i}>
                    <input
                      type="checkbox"
                      checked={day}
                      onChange={() => {
                        const updated = [...trays];
                        updated[selectedTrayIndex].wateringSchedule[i] = !day;
                        setTrays(updated);
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
    </main>
  );
}
