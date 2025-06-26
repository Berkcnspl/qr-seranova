"use client";

import { QRCodeCanvas } from "qrcode.react";
import styles from "./QRCodeCard.module.css"; // varsayılan stil için, oluşturulabilir

interface Props {
  batchId: string;
}

export default function QRCodeCard({ batchId }: Props) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/batch/${batchId}`;

  return (
    <div className={styles.qrCard}>
      <h3>Batch {batchId}</h3>
      <QRCodeCanvas value={url} size={128} />
      <p>{url}</p>
    </div>
  );
}
