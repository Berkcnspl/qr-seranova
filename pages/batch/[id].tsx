import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../../styles/Home.module.css";

const emptyTray = {
  name: "",
  sowingDate: "",
  lightDate: "",
  wateringDays: Array(10).fill(false),
};

export default function BatchDetail() {
  const router = useRouter();
  const { id } = router.query;
  const batchKey = `batch-${id}`;

  const [trays, setTrays] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(batchKey);
      return stored ? JSON.parse(stored) : [emptyTray, emptyTray, emptyTray, emptyTray];
    }
    return [emptyTray, emptyTray, emptyTray, emptyTray];
  });

  const [selectedTrayIndex, setSelectedTrayIndex] = useState<number | null>(null);
  const [moveToBatch, setMoveToBatch] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(batchKey, JSON.stringify(trays));
    }
  }, [trays, batchKey]);

  const handleFieldChange = (
    index: number,
    field: keyof typeof emptyTray,
    value: string | string[]
  ) => {
    const updated = [...trays];
    updated[index][field] = value as never;
    setTrays(updated);
  };

  const toggleWateringDay = (index: number, day: number) => {
    const updated = [...trays];
    updated[index].wateringDays[day] = !updated[index].wateringDays[day];
    setTrays(updated);
  };

  const handleMoveTray = (fromIndex: number) => {
    if (!moveToBatch) return;

    const destinationKey = `batch-${moveToBatch}`;
    const destination = localStorage.getItem(destinationKey);
    const destinationTrays = destination ? JSON.parse(destination) : [emptyTray, emptyTray, emptyTray, emptyTray];

    const trayToMove = trays[fromIndex];
    const updatedFrom = [...trays];
    updatedFrom[fromIndex] = emptyTray;
    setTrays(updatedFrom);

    const updatedTo = [...destinationTrays];
    const emptyIndex = updatedTo.findIndex((t: typeof emptyTray) => t.name === "");
    if (emptyIndex !== -1) {
      updatedTo[emptyIndex] = trayToMove;
      localStorage.setItem(destinationKey, JSON.stringify(updatedTo));
    } else {
      alert("Hedef batch'te boş tepsi yok!");
    }
  };

  return (
    <div className={styles.container}>
      <h1 style={{ color: "white" }}>Batch {String(id).padStart(3, "0")} Detayları</h1>
      <button onClick={() => router.push("/")} style={{ marginBottom: 20 }}>
        Ana Sayfaya Dön
      </button>
      <div className={styles.grid}>
        {trays.map((tray, index) => (
          <div key={index} className={styles.trayCard}>
            <input
              type="text"
              value={tray.name}
              placeholder="Bitki Adı"
              onChange={(e) => handleFieldChange(index, "name", e.target.value)}
            />
            <div>
              <label>Ekim Tarihi: </label>
              <input
                type="date"
                value={tray.sowingDate}
                onChange={(e) => handleFieldChange(index, "sowingDate", e.target.value)}
              />
            </div>
            <div>
              <label>Işığa Alım Tarihi: </label>
              <input
                type="date"
                value={tray.lightDate}
                onChange={(e) => handleFieldChange(index, "lightDate", e.target.value)}
              />
            </div>
            <div>
              <label>Sulama Takvimi: </label>
              <div>
                {tray.wateringDays.map((day, dIndex) => (
                  <label key={dIndex}>
                    <input
                      type="checkbox"
                      checked={day}
                      onChange={() => toggleWateringDay(index, dIndex)}
                    />
                    Gün {dIndex + 1}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <input
                type="number"
                min="1"
                max="84"
                placeholder="Taşınacak Batch No"
                value={moveToBatch}
                onChange={(e) => setMoveToBatch(e.target.value)}
              />
              <button onClick={() => handleMoveTray(index)}>Batch Taşı</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
