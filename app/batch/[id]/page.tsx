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
  const batchId =
    params && "id" in params
      ? Array.isArray(params.id)
        ? params.id[0]
        : params.id
      : "";

  const [trays, setTrays] = useState<Tray[]>(Array(4).fill(emptyTray));
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [moveIndex, setMoveIndex] = useState<string>(""); // şimdi string, çünkü "all" da gelebilir
  const [targetBatch, setTargetBatch] = useState<string>("");

  // Var olan batch ID'leri için localStorage'da arama yapıyoruz
  const [allBatchIds, setAllBatchIds] = useState<string[]>([]);

  useEffect(() => {
    // Mevcut tüm batch id'lerini bul
    if (typeof window !== "undefined") {
      const ids: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("batch-")) {
          ids.push(key.replace("batch-", ""));
        }
      }
      setAllBatchIds(ids);
    }
  }, []);

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
      if (field === "wateringSchedule") {
        updated[index] = {
          ...updated[index],
          [field]: JSON.parse(value),
        };
      } else {
        updated[index] = {
          ...updated[index],
          [field]: value,
        };
      }
      return updated;
    });
  };

  // Tüm tepsileri taşıma veya tek tepsiyi taşıma fonksiyonu
  const handleTrayMove = () => {
    if (!moveIndex || !targetBatch || targetBatch === batchId) return;

    if (moveIndex === "all") {
      // Hepsi seçiliyse, 4 tepsiyi de taşı
      trays.forEach((trayToMove, idx) => {
        if (trayToMove.name !== "") {
          // Boş tepsileri taşımıyoruz
          moveSingleTray(idx, trayToMove);
        }
      });
      // Bütün tepsileri boşalt
      setTrays(Array(4).fill(emptyTray));
    } else {
      const idx = Number(moveIndex);
      if (isNaN(idx)) return;
      moveSingleTray(idx, trays[idx]);
      // Seçili tepsiyi boşalt
      setTrays((prev) => {
        const updated = [...prev];
        updated[idx] = emptyTray;
        return updated;
      });
    }

    setMoveIndex("");
    setTargetBatch("");
  };

  // Tek bir tepsiyi taşır
  const moveSingleTray = (trayIndex: number, trayToMove: Tray) => {
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
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>
        Batch {batchId?.toString().padStart(3, "0")}
      </h1>
      <button className={styles.backButton} onClick={() => router.push("/")}>
        Ana Sayfaya Dön
      </button>

      {/* Var olan batch id'leri burada gösteriliyor */}
      <div style={{ margin: "1.5rem 3rem 0 3rem", color: "#aaa" }}>
        <strong>Mevcut Batch ID’ler:</strong>
        <ul>
          {allBatchIds.length === 0 && <li>Henüz hiç batch yok.</li>}
          {allBatchIds.map((id) => (
            <li key={id}>
              {id} {id === batchId ? "(Bu sayfa)" : ""}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.grid}>
        {trays.map((tray, index) => (
          <div key={index} className={styles.trayCard}>
            {editIndex === index ? (
              <input
                type="text"
                value={tray.name}
                className={styles.trayNameInput}
                onChange={(e) =>
                  handleFieldChange(index, "name", e.target.value)
                }
                onBlur={() => setEditIndex(null)}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div
                className={styles.trayName}
                onClick={() => setEditIndex(index)}
              >
                {tray.name || "-"}
              </div>
            )}
            <button
              className={styles.detailButton}
              onClick={() => setModalIndex(index)}
              tabIndex={-1}
            >
              Detaylar
            </button>
          </div>
        ))}
      </div>

      <div className={styles.moveSection}>
        <button
          disabled={!moveIndex}
          onClick={handleTrayMove}
          className={styles.moveButtonMain}
          style={{ cursor: !moveIndex ? "not-allowed" : "pointer" }}
        >
          Batch Taşı
        </button>
        <select
          value={moveIndex}
          onChange={(e) => setMoveIndex(e.target.value)}
          className={styles.moveSelect}
        >
          <option value="" disabled>
            Taşınacak Tepsiyi Seç
          </option>
          <option value="all">Hepsi</option>
          {trays.map((_, i) => (
            <option key={i} value={i}>
              Tepsi {i + 1}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Hedef Batch ID"
          value={targetBatch}
          onChange={(e) => setTargetBatch(e.target.value)}
          className={styles.moveInput}
          list="batch-ids"
        />
        <datalist id="batch-ids">
          {allBatchIds.map((id) => (
            <option value={id} key={id} />
          ))}
        </datalist>
      </div>

      {modalIndex !== null && (
        <div
          className={styles.modalOverlay}
          onClick={() => setModalIndex(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Tepsi {modalIndex + 1} Detayları</h2>
              <button
                className={styles.closeButton}
                onClick={() => setModalIndex(null)}
              >
                ×
              </button>
            </div>
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
            <div className={styles.wateringSchedule}>
              <strong>Sulama Takvimi:</strong>
              {trays[modalIndex].wateringSchedule.map((checked, i) => (
                <label key={i}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const newSchedule = [
                        ...trays[modalIndex].wateringSchedule,
                      ];
                      newSchedule[i] = !newSchedule[i];
                      handleFieldChange(
                        modalIndex,
                        "wateringSchedule",
                        JSON.stringify(newSchedule)
                      );
                    }}
                  />
                  Gün {i + 1}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
