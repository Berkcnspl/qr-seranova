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
  const batchId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  const [trays, setTrays] = useState<Tray[]>(Array(4).fill(emptyTray));
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [selectedTrayIndex, setSelectedTrayIndex] = useState<number | null>(null);
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
    if (selectedTrayIndex === null || !targetBatch || targetBatch === batchId) return;

    const trayToMove = trays[selectedTrayIndex];
    const updatedCurrent = [...trays];
    updatedCurrent[selectedTrayIndex] = emptyTray;
    setTrays(updatedCurrent);

    const targetKey = `batch-${targetBatch}`;
    const targetBatchData = localStorage.getItem(targetKey);
    const targetTrays: Tray[] = targetBatchData
      ? JSON.parse(targetBatchData)
      : Array(4).fill(emptyTray);

    const emptySpotIndex = targetTrays.findIndex((tray) => tray.name === "");
    if (emptySpotIndex !== -1) {
      targetTrays[emptySpotIndex] = trayToMove;
      localStorage.setItem(targetKey, JSON.stringify(targetTrays));
    }

    setTargetBatch("");
    setSelectedTrayIndex(null);
  };

  return (
    <main className={styles.main}>
      <h1>Batch {batchId?.padStart(3, "0")}</h1>
      <button className={styles.backButton} onClick={() => router.push("/")}>
        Ana Sayfaya Dön
      </button>

      <div className={styles.grid}>
        {trays.map((tray, index) => (
          <div
            key={index}
            className={styles.trayCard}
            style={{
              border:
                selectedTrayIndex === index ? "2px solid white" : "none",
            }}
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
            <button onClick={() => setSelectedTrayIndex(index)}>
              Batch Taşı
            </button>
          </div>
        ))}
      </div>

      {selectedTrayIndex !== null && (
        <div className={styles.movePrompt}>
          <label>Taşınacak Batch ID:</label>
          <input
            type="text"
            value={targetBatch}
            onChange={(e) => setTargetBatch(e.target.value)}
          />
          <button onClick={handleTrayMove}>Taşı</button>
          <button onClick={() => setSelectedTrayIndex(null)}>İptal</button>
        </div>
      )}
    </main>
  );
}
