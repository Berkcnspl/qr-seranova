"use client";

import { useEffect, useState } from "react";
import { getAllBatches } from "@/firebase/batchService";
import QRCode from "react-qr-code";
import styles from "./page.module.css";

type Batch = {
  id: string;
  trays: any[];
};

export default function Home() {
  const [batches, setBatches] = useState<Batch[]>([]);

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
      <div className={styles.grid}>
        {batches.map((batch) => (
          <div key={batch.id} className={styles.batchCard}>
            <QRCode
              value={`https://qr.seranova.net/batch/${batch.id.replace("batch-", "")}`}
              size={128}
            />
            <p className={styles.batchLabel}>{batch.id}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
