import { useState, useEffect } from 'react';
import { Save, Truck, Info, AlertCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion } from 'motion/react';

export default function AdminSettings() {
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'shipping');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setShippingCost(docSnap.data().cost);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await setDoc(doc(db, 'settings', 'shipping'), {
        cost: Number(shippingCost),
        updatedAt: new Date().toISOString()
      });
      setMessage({ type: 'success', text: 'Biaya ongkir berhasil diperbarui!' });
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ type: 'error', text: 'Gagal memperbarui biaya ongkir.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-gray-400 font-bold">Memuat pengaturan...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-emerald-50 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Truck size={24} />
          </div>
          <div>
            <h4 className="text-xl font-black text-natural-header">Pengaturan Pengiriman</h4>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Atur tarif ongkos kirim ke seluruh desa</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-black text-natural-header block">Biaya Ongkir (Rupiah)</label>
            <div className="relative">
               <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-emerald-300">Rp</span>
               <input 
                type="number" 
                value={shippingCost}
                onChange={(e) => setShippingCost(Number(e.target.value))}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-emerald-100 focus:ring-2 focus:ring-natural-accent outline-none bg-emerald-50/30 font-bold text-lg text-natural-header"
                placeholder="Contoh: 5000"
              />
            </div>
            <p className="text-[10px] text-gray-400 font-medium italic flex items-center gap-1">
              <Info size={12} />
              Biaya ini akan otomatis ditambahkan ke total belanja setiap pesanan baru.
            </p>
          </div>

          {message && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl flex items-center gap-3 ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {message.type === 'success' ? <Truck size={20} /> : <AlertCircle size={20} />}
              <span className="text-sm font-bold">{message.text}</span>
            </motion.div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-natural-header text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-900 active:scale-95 transition-all shadow-xl shadow-emerald-100 disabled:opacity-50"
          >
            <Save size={20} />
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>

      <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
         <h5 className="text-sm font-black text-blue-900 mb-2">💡 Tips Pengiriman</h5>
         <ul className="text-xs text-blue-700 space-y-2 list-disc list-inside font-medium leading-relaxed">
            <li>Gunakan biaya ongkir flat untuk memudahkan warga menghitung total belanja.</li>
            <li>Jika ada promo "Gratis Ongkir", Anda bisa mengubah nilai ini menjadi 0 sementara.</li>
            <li>Pastikan menginfokan perubahan tarif ongkir di grup WhatsApp warga agar tidak kaget.</li>
         </ul>
      </div>
    </div>
  );
}
