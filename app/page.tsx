"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllBatches } from "@/firebase/batchService";
import { db } from "@/firebase/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import QRCode from "react-qr-code";
import QRCodeLib from "qrcode";
import { jsPDF } from "jspdf";
import styles from "./page.module.css";

type Batch = {
  id: string;
  trays: any[];
};

type BatchStatus = "empty" | "ekim" | "isik" | "hasat";

function getBatchStatus(batch: Batch): BatchStatus {
  const trays = batch.trays || [];
  let hasSowing = false;
  let hasLight = false;
  for (const t of trays) {
    if (t?.sowingDate) hasSowing = true;
    if (t?.lightOnDate) hasLight = true;
  }
  if (hasSowing && hasLight) return "hasat";
  if (hasLight) return "isik";
  if (hasSowing) return "ekim";
  return "empty";
}

function getStatusLabel(status: BatchStatus): string {
  switch (status) {
    case "empty": return "Boş";
    case "ekim": return "Ekim Yapıldı";
    case "isik": return "Işığa Alındı";
    case "hasat": return "Hasat Hazır";
    default: return "Boş";
  }
}

const emptyTray = {
  name: "",
  sowingDate: "",
  sowingTime: "",
  wateringSchedule: Array(10).fill(false),
  lightOnDate: "",
  lightOnTime: "",
};

async function createNewBatch(): Promise<string> {
  const snapshot = await getDocs(collection(db, "batches"));
  const existingIds = snapshot.docs.map((doc) => doc.id);

  const maxNumber = existingIds
    .map((id) => parseInt(id.replace("batch-", "")))
    .filter((num) => !isNaN(num))
    .reduce((max, current) => Math.max(max, current), 0);

  const newBatchId = `batch-${String(maxNumber + 1).padStart(3, "0")}`;
  const trays = Array(4).fill(emptyTray);

  await setDoc(doc(db, "batches", newBatchId), { trays });
  return newBatchId;
}

const MM_PER_CM = 10;
const PDF_MARGIN_MM = 10;
const PDF_GAP_MM = 5;
const PDF_LABEL_HEIGHT_MM = 6;

export default function Home() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [qrWidthCm, setQrWidthCm] = useState("5");
  const [qrHeightCm, setQrHeightCm] = useState("5");
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const fetchBatches = async () => {
    const data = await getAllBatches();
    setBatches(data);
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const toggleSelectBatch = (batchId: string) => {
    setSelectedBatchIds((prev) =>
      prev.includes(batchId)
        ? prev.filter((id) => id !== batchId)
        : [...prev, batchId]
    );
  };

  const handleDeleteSelected = async () => {
    const confirmed = confirm(
      `${selectedBatchIds.length} batch silinsin mi? Geri alınamaz!`
    );
    if (!confirmed) return;

    await Promise.all(
      selectedBatchIds.map((batchId) =>
        deleteDoc(doc(db, "batches", batchId))
      )
    );
    setSelectedBatchIds([]);
    setDeleteMode(false);
    fetchBatches();
  };

  const handleGeneratePDF = async () => {
    const widthCm = parseFloat(qrWidthCm) || 5;
    const heightCm = parseFloat(qrHeightCm) || 5;
    if (widthCm < 1 || widthCm > 15 || heightCm < 1 || heightCm > 15) {
      alert("Ölçüler 1-15 cm arasında olmalıdır.");
      return;
    }
    if (batches.length === 0) {
      alert("Yazdırılacak batch bulunamadı.");
      return;
    }

    setIsGenerating(true);
    try {
      const widthMm = widthCm * MM_PER_CM;
      const heightMm = heightCm * MM_PER_CM;
      const cellHeight = heightMm + PDF_LABEL_HEIGHT_MM;
      const usableWidth = 210 - 2 * PDF_MARGIN_MM;
      const usableHeight = 297 - 2 * PDF_MARGIN_MM;
      const cols = Math.floor((usableWidth + PDF_GAP_MM) / (widthMm + PDF_GAP_MM));
      const rows = Math.floor((usableHeight + PDF_GAP_MM) / (cellHeight + PDF_GAP_MM));
      const perPage = cols * rows;

      const pixelSize = Math.round(widthCm * 118);
      const qrImages: string[] = [];
      for (const batch of batches) {
        const url = `https://qr.seranova.net/batch/${batch.id.replace("batch-", "")}`;
        const dataUrl = await QRCodeLib.toDataURL(url, {
          width: pixelSize,
          margin: 1,
        });
        qrImages.push(dataUrl);
      }

      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      let pageIndex = 0;
      let itemIndex = 0;

      for (let i = 0; i < batches.length; i++) {
        if (itemIndex >= perPage) {
          pdf.addPage();
          pageIndex++;
          itemIndex = 0;
        }
        const col = itemIndex % cols;
        const row = Math.floor(itemIndex / cols);
        const x = PDF_MARGIN_MM + col * (widthMm + PDF_GAP_MM);
        const y = PDF_MARGIN_MM + row * (cellHeight + PDF_GAP_MM);

        pdf.addImage(qrImages[i], "PNG", x, y, widthMm, heightMm);
        pdf.setFontSize(8);
        pdf.text(batches[i].id, x + widthMm / 2, y + heightMm + 4, {
          align: "center",
        });

        itemIndex++;
      }

      pdf.save(`seranova-qr-batchleri-${new Date().toISOString().slice(0, 10)}.pdf`);
      setPrintModalOpen(false);
    } catch (err) {
      console.error("PDF oluşturma hatası:", err);
      alert("PDF oluşturulurken bir hata oluştu.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Batch Envanteri</h1>
        <div className={styles.actions}>
          <button
            className={styles.btnPrimary}
            onClick={async () => {
              const newBatchId = await createNewBatch();
              router.push(`/batch/${newBatchId.replace("batch-", "")}`);
            }}
          >
            + Yeni Batch Ekle
          </button>
          <button
            className={styles.btnPrint}
            onClick={() => setPrintModalOpen(true)}
          >
            QR Yazdır
          </button>
          <button
            className={styles.btnDanger}
            onClick={() => {
              setDeleteMode(!deleteMode);
              setSelectedBatchIds([]);
            }}
          >
            {deleteMode ? "İptal" : "Batch Sil"}
          </button>
          {deleteMode && selectedBatchIds.length > 0 && (
            <button
              className={styles.btnConfirmDelete}
              onClick={handleDeleteSelected}
            >
              Seçili Batchleri Sil
            </button>
          )}
        </div>
      </div>

      <section className={styles.inventorySection}>
        <h2 className={styles.inventoryHeader}>Tüm Batchler</h2>
        <div className={styles.grid}>
          {batches.map((batch) => {
            const status = getBatchStatus(batch);
            const statusClass =
              status === "empty"
                ? styles.statusEmpty
                : status === "ekim"
                  ? styles.statusEkim
                  : status === "isik"
                    ? styles.statusIsik
                    : styles.statusHasat;
            return (
              <div
                key={batch.id}
                className={`${styles.batchCard} ${styles.batchCardClickable}`}
                onClick={() =>
                  !deleteMode &&
                  router.push(`/batch/${batch.id.replace("batch-", "")}`)
                }
              >
                {deleteMode && (
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={selectedBatchIds.includes(batch.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelectBatch(batch.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                <div className={styles.qrWrapper}>
                  <QRCode
                    value={`https://qr.seranova.net/batch/${batch.id.replace(
                      "batch-",
                      ""
                    )}`}
                    size={128}
                  />
                </div>
                <span className={styles.batchId}>{batch.id}</span>
                <span className={`${styles.statusBadge} ${statusClass}`}>
                  {getStatusLabel(status)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {printModalOpen && (
        <div
          className={styles.printModalOverlay}
          onClick={() => !isGenerating && setPrintModalOpen(false)}
        >
          <div
            className={styles.printModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.printModalTitle}>QR Ölçüleri (cm)</h3>
            <div className={styles.printModalForm}>
              <div className={styles.printDimensionRow}>
                <label>
                  Genişlik (cm)
                  <input
                    type="number"
                    min="1"
                    max="15"
                    step="0.5"
                    value={qrWidthCm}
                    onChange={(e) => setQrWidthCm(e.target.value)}
                  />
                </label>
                <label>
                  Yükseklik (cm)
                  <input
                    type="number"
                    min="1"
                    max="15"
                    step="0.5"
                    value={qrHeightCm}
                    onChange={(e) => setQrHeightCm(e.target.value)}
                  />
                </label>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                {batches.length} adet QR kod PDF'e eklenecek.
              </p>
            </div>
            <div className={styles.printModalActions}>
              <button
                className={styles.printModalCancel}
                onClick={() => setPrintModalOpen(false)}
                disabled={isGenerating}
              >
                İptal
              </button>
              <button
                className={styles.printModalGenerate}
                onClick={handleGeneratePDF}
                disabled={isGenerating}
              >
                {isGenerating ? "Oluşturuluyor..." : "PDF İndir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
