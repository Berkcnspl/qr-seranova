"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllBatches } from "@/firebase/batchService";
import { db } from "@/firebase/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import QRCode from "react-qr-code";
import styles from "./page.module.css";

type Batch = {
  id: string;
  trays: any[];
};

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

export default function Home() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getAllBatches();
      setBatches(data);
    };
    fetchData();
  }, []);

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Tüm Batchler</h1>

      <div style={{ textAlign: "center", margin: "2rem 0" }}>
        <button
          onClick={async () => {
            const newBatchId = await createNewBatch();
            router.push(`/batch/${newBatchId.replace("batch-", "")}`);
          }}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#00b894",
            color: "#fff",
            fontSize: "1rem",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          + Yeni Batch Ekle
        </button>
      </div>

      <div className={styles.grid}>
        {batches.map((batch) => (
          <div key={batch.id} className={styles.batchCard}>
            <QRCode
              value={`https://qr.seranova.net/batch/${batch.id.replace("batch-", "")}`}
              size={128}
            />
            <p
              className={styles.batchLabel}
              onClick={() =>
                router.push(`/batch/${batch.id.replace("batch-", "")}`)
              }
              style={{ cursor: "pointer", textDecoration: "underline" }}
            >
              {batch.id}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
