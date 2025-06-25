"use client";

import { useRouter } from "next/router";
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
  const { id } = router.query;

  const [trays, setTrays] = useState<Tray[]>(() => {
    if (typeof window !== "undefined" && typeof id === "string") {
      const saved = localStorage.getItem(`batch-${id}`);
      return saved ? JSON.parse(saved) : Array(4).fill(emptyTray);
    }
    return Array(4).fill(emptyTray);
  });

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [moveIndex, setMoveIndex] = useState<number | null>(null);
  const [targetBatch, setTargetBatch] = useState<string>("");

  useEffect(() => {
    if (typeof id === "string") {
      localStorage.setItem(`batch-${id}`, JSON.stringify(trays));
    }
  }, [trays, id]);

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
    if (
      moveIndex === null ||
      targetBatch === id ||
      typeof id !== "string"
    )
      return;

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

  if (typeof id !== "string") return <div>Yükleniyor...</div>;

  return (
    <main className={styles.main}>
      <h1>Batch {id.padStart(3, "0")}</h1>
      <button className={styles.backButton} onClick={() => router.push("/")}>
        Ana Sayfaya Dön
      </button>
      <div className={styles.grid}>
        {trays.map((tray, index) => (
          <div key={index} className={styles.trayCard}>
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
            <button
              className={styles.moveButton}
              onClick={() => setMoveIndex(index)}
            >
              Batch Taşı
            </button>
          </div>
        ))}
      </div>
      {moveIndex !== null && (
        <div className={styles.movePrompt}>
          <label>Taşınacak Batch ID:</label>
          <input
            type="text"
            value={targetBatch}
            onChange={(e) => setTargetBatch(e.target.value)}
          />
          <button onClick={handleTrayMove}>Taşı</button>
          <button onClick={() => setMoveIndex(null)}>İptal</button>
        </div>
      )}
    </main>
  );
}
