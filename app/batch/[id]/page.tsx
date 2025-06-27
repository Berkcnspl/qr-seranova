"use client";

import { useRouter, useParams } from "next/navigation";
import { getBatchData, saveBatchData } from "@/firebase/batchService";
import { db } from "@/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

export type Tray = {
  name: string;
  sowingDate: string;
  sowingTime?: string;
  wateringSchedule: boolean[];
  lightOnDate: string;
  lightOnTime?: string;
};

const emptyTray: Tray = {
  name: "",
  sowingDate: "",
  sowingTime: "",
  wateringSchedule: Array(15).fill(false),
  lightOnDate: "",
  lightOnTime: "",
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
  const [moveIndex, setMoveIndex] = useState<string>("");
  const [targetBatch, setTargetBatch] = useState<string>("");
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [clearIndex, setClearIndex] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      if (batchId) {
        const data = await getBatchData(batchId);
        if (data?.trays && Array.isArray(data.trays)) {
          const updatedTrays = data.trays.map((tray: Tray) => ({
            ...tray,
            wateringSchedule: Array(15)
              .fill(false)
              .map((_, i) => tray.wateringSchedule?.[i] ?? false),
          }));
          setTrays(updatedTrays);
        } else {
          console.warn("Veri bulunamadı veya trays eksik:", data);
        }
        setIsDataLoaded(true);
      }
    };
    fetchData();
  }, [batchId]);

  useEffect(() => {
    if (batchId && isDataLoaded) {
      saveBatchData(batchId, trays);
    }
  }, [trays, batchId, isDataLoaded]);

  const handleFieldChange = (
    index: number,
    field: keyof Tray,
    value: string | boolean[]
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

  const handleTrayMove = async () => {
    if (!moveIndex || !targetBatch || targetBatch === batchId) return;

    try {
      const targetDocRef = doc(
        db,
        "batches",
        targetBatch.startsWith("batch-") ? targetBatch : `batch-${targetBatch}`
      );
      const targetSnap = await getDoc(targetDocRef);

      const targetTrays: Tray[] = targetSnap.exists()
        ? targetSnap.data()?.trays || Array(4).fill(emptyTray)
        : Array(4).fill(emptyTray);

      const updatedSource = [...trays];
      const updatedTarget = [...targetTrays];

      if (moveIndex === "all") {
        for (let i = 0; i < updatedSource.length; i++) {
          if (updatedSource[i].name !== "") {
            if (updatedTarget[i].name !== "") {
              alert(`Hedef batch'teki Tepsi ${i + 1} zaten dolu!`);
              return;
            }
            updatedTarget[i] = updatedSource[i];
            updatedSource[i] = emptyTray;
          }
        }
      } else {
        const idx = Number(moveIndex);
        if (isNaN(idx)) return;

        if (updatedTarget[idx].name !== "") {
          alert(`Hedef batch'teki Tepsi ${idx + 1} dolu!`);
          return;
        }

        updatedTarget[idx] = updatedSource[idx];
        updatedSource[idx] = emptyTray;
      }

      await saveBatchData(batchId!, updatedSource);
      await saveBatchData(targetBatch, updatedTarget);

      setTrays(updatedSource);
      setMoveIndex("");
      setTargetBatch("");
    } catch (error) {
      console.error("Tepsi taşıma sırasında hata:", error);
    }
  };

  const handleClearTray = async () => {
    if (clearIndex === "") return;
    const updatedTrays = [...trays];
    if (clearIndex === "all") {
      for (let i = 0; i < updatedTrays.length; i++) {
        updatedTrays[i] = emptyTray;
      }
    } else {
      const idx = Number(clearIndex);
      if (isNaN(idx)) return;
      updatedTrays[idx] = emptyTray;
    }
    setTrays(updatedTrays);
    setClearIndex("");
    await saveBatchData(batchId!, updatedTrays);
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Batch {batchId?.toString().padStart(3, "0")}</h1>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <button className={styles.backButton} onClick={() => router.push("/")}>Ana Sayfa</button>
      </div>

      <div className={styles.grid}>
        {trays.map((tray, index) => (
          <div key={index} className={styles.trayCard}>
            {editIndex === index ? (
              <input
                type="text"
                value={tray.name}
                className={styles.trayNameInput}
                onChange={(e) => handleFieldChange(index, "name", e.target.value)}
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
          <option value="" disabled>Taşınacak Tepsiyi Seç</option>
          <option value="all">Hepsi</option>
          {trays.map((_, i) => (
            <option key={i} value={i}>Tepsi {i + 1}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Hedef Batch ID"
          value={targetBatch}
          onChange={(e) => setTargetBatch(e.target.value)}
          className={styles.moveInput}
        />
        <select
          value={clearIndex}
          onChange={(e) => setClearIndex(e.target.value)}
          className={styles.moveSelect}
        >
          <option value="" disabled>Temizlenecek Tepsiyi Seç</option>
          <option value="all">Hepsi</option>
          {trays.map((_, i) => (
            <option key={i} value={i}>Tepsi {i + 1}</option>
          ))}
        </select>
        <button
          disabled={!clearIndex}
          onClick={handleClearTray}
          className={styles.moveButtonMain}
          style={{ backgroundColor: "#c0392b" }}
        >
          Seçilen Tepsiyi Temizle
        </button>
      </div>

      {modalIndex !== null && (
        <div className={styles.modalOverlay} onClick={() => setModalIndex(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Tepsi {modalIndex + 1} Detayları</h2>
              <button className={styles.closeButton} onClick={() => setModalIndex(null)}>×</button>
            </div>
            <div className={styles.modalForm}>
              <label>
                Ekim Tarihi:
                <input
                  type="date"
                  value={trays[modalIndex].sowingDate}
                  onChange={(e) => handleFieldChange(modalIndex, "sowingDate", e.target.value)}
                />
              </label>
              <label>
                Ekim Saati:
                <input
                  type="time"
                  value={trays[modalIndex].sowingTime || ""}
                  onChange={(e) => handleFieldChange(modalIndex, "sowingTime", e.target.value)}
                />
              </label>
              <label>
                Işığa Alma Tarihi:
                <input
                  type="date"
                  value={trays[modalIndex].lightOnDate}
                  onChange={(e) => handleFieldChange(modalIndex, "lightOnDate", e.target.value)}
                />
              </label>
              <label>
                Işığa Alma Saati:
                <input
                  type="time"
                  value={trays[modalIndex].lightOnTime || ""}
                  onChange={(e) => handleFieldChange(modalIndex, "lightOnTime", e.target.value)}
                />
              </label>
            </div>
            <div className={styles.wateringSchedule}>
              <strong style={{ marginBottom: "0.5rem" }}>Sulama Takvimi:</strong>
              {trays[modalIndex].wateringSchedule.map((checked, i) => (
                <label key={i}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const newSchedule = [...trays[modalIndex].wateringSchedule];
                      newSchedule[i] = !checked;
                      handleFieldChange(modalIndex, "wateringSchedule", newSchedule);
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
