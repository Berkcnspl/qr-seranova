import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
} from "firebase/firestore";

const BATCH_COLLECTION = "batches";

// Tek bir batch getir (örnek: batch-001)
export const getBatchData = async (batchId: string) => {
  const docRef = doc(
    db,
    BATCH_COLLECTION,
    batchId.startsWith("batch-") ? batchId : `batch-${batchId}`
  );
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

// Batch verisini kaydet
export const saveBatchData = async (batchId: string, trays: any[]) => {
  const docRef = doc(
    db,
    BATCH_COLLECTION,
    batchId.startsWith("batch-") ? batchId : `batch-${batchId}`
  );
  await setDoc(docRef, { trays }, { merge: true });
};

// Tüm batchleri getir (QR sayfası için)
export const getAllBatches = async () => {
  const querySnapshot = await getDocs(collection(db, BATCH_COLLECTION));
  const allData: any[] = [];
  querySnapshot.forEach((doc) => {
    allData.push({ id: doc.id, ...doc.data() });
  });
  return allData;
};
