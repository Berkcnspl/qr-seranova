import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const emptyTray = {
  bitki: "",
  ekimTarihi: "",
  isigAlimTarihi: "",
  sulama: Array(10).fill(false),
};

export default function BatchDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [trays, setTrays] = useState([emptyTray, emptyTray, emptyTray, emptyTray]);
  const [selectedTrayIndex, setSelectedTrayIndex] = useState<number | null>(null);
  const [targetBatchId, setTargetBatchId] = useState("");
  const [showMoveModal, setShowMoveModal] = useState(false);

  useEffect(() => {
    if (id) {
      const storedData = localStorage.getItem(`batch-${id}`);
      if (storedData) {
        setTrays(JSON.parse(storedData));
      }
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      localStorage.setItem(`batch-${id}`, JSON.stringify(trays));
    }
  }, [trays, id]);

  const handleFieldChange = (index: number, field: keyof typeof emptyTray, value: string) => {
    const updated = [...trays];
    updated[index][field] = value;
    setTrays(updated);
  };

  const handleSulamaToggle = (trayIndex: number, dayIndex: number, value: boolean) => {
    const updated = [...trays];
    updated[trayIndex].sulama[dayIndex] = value;
    setTrays(updated);
  };

  const handleMoveTray = () => {
    if (!targetBatchId || selectedTrayIndex === null) return;

    const targetBatchData = localStorage.getItem(`batch-${targetBatchId}`);
    let targetTrays = targetBatchData ? JSON.parse(targetBatchData) : [emptyTray, emptyTray, emptyTray, emptyTray];

    const emptyIndex = targetTrays.findIndex((tray: typeof emptyTray) => tray.bitki === "");

    if (emptyIndex !== -1) {
      targetTrays[emptyIndex] = trays[selectedTrayIndex];
      localStorage.setItem(`batch-${targetBatchId}`, JSON.stringify(targetTrays));

      const updated = [...trays];
      updated[selectedTrayIndex] = emptyTray;
      setTrays(updated);
    } else {
      alert("Seçilen batch dolu. Lütfen başka bir batch seçin.");
    }

    setShowMoveModal(false);
  };

  return (
    <div className="bg-black min-h-screen text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Batch {id?.toString().padStart(3, "0")}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trays.map((tray, index) => (
          <div key={index} className="bg-zinc-800 p-4 rounded-xl shadow-md">
            <input
              type="text"
              value={tray.bitki}
              onChange={(e) => handleFieldChange(index, "bitki", e.target.value)}
              placeholder="Bitki Adı"
              className="w-full mb-2 px-3 py-2 rounded bg-white text-black font-semibold text-center"
            />
            <label className="block mb-1">Ekim Tarihi:</label>
            <input
              type="date"
              value={tray.ekimTarihi}
              onChange={(e) => handleFieldChange(index, "ekimTarihi", e.target.value)}
              className="w-full mb-2 px-3 py-2 rounded text-black"
            />
            <label className="block mb-1">Işığa Alım Tarihi:</label>
            <input
              type="date"
              value={tray.isigAlimTarihi}
              onChange={(e) => handleFieldChange(index, "isigAlimTarihi", e.target.value)}
              className="w-full mb-2 px-3 py-2 rounded text-black"
            />
            <div className="mb-2">
              <p className="font-semibold mb-1">Sulama Takvimi:</p>
              <div className="grid grid-cols-5 gap-2">
                {tray.sulama.map((value: boolean, i: number) => (
                  <label key={i} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handleSulamaToggle(index, i, e.target.checked)}
                    />
                    <span>Gün {i + 1}</span>
                  </label>
                ))}
              </div>
            </div>
            <button
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded"
              onClick={() => {
                setSelectedTrayIndex(index);
                setShowMoveModal(true);
              }}
            >
              Batch Taşı
            </button>
          </div>
        ))}
      </div>

      {showMoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white text-black p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Taşınacak Batch Seç</h2>
            <select
              value={targetBatchId}
              onChange={(e) => setTargetBatchId(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="">Batch Seçin</option>
              {Array.from({ length: 84 }, (_, i) => (
                <option key={i} value={(i + 1).toString()}>
                  Batch {(i + 1).toString().padStart(3, "0")}
                </option>
              ))}
            </select>
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setShowMoveModal(false)}
              >
                İptal
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                onClick={handleMoveTray}
              >
                Taşı
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => router.push("/")}
        className="mt-10 bg-white text-black px-6 py-2 rounded shadow hover:bg-gray-200"
      >
        Ana Sayfaya Dön
      </button>
    </div>
  );
}
