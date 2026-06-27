import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, updateDoc, doc, addDoc } from 'firebase/firestore';
import { PromoBanner } from '../types';
import { Megaphone, Save, Info, AlertTriangle, Eye, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminBanner() {
  const [banner, setBanner] = useState<PromoBanner | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    isActive: true,
    type: 'promo' as 'info' | 'promo' | 'warning'
  });

  useEffect(() => {
    const q = query(collection(db, 'banners'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const bannerData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PromoBanner))[0];
        setBanner(bannerData);
        setFormData({
          text: bannerData.text,
          isActive: bannerData.isActive,
          type: bannerData.type
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!formData.text.trim()) return;
    setSaving(true);
    try {
      if (banner?.id) {
        await updateDoc(doc(db, 'banners', banner.id), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'banners'), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'banners');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-gray-400 font-bold">Memuat pengaturan banner...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-emerald-50 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Megaphone size={24} />
          </div>
          <div>
            <h4 className="text-xl font-black text-natural-header">Pengaturan Banner Promo</h4>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Banner ini muncul di halaman utama warga</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
              <Eye size={14} /> Tampilkan Banner?
            </label>
            <div className="flex gap-4">
              <button 
                onClick={() => setFormData({ ...formData, isActive: true })}
                className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${formData.isActive ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-400 border-gray-100 hover:border-emerald-200'}`}
              >
                AKTIF
              </button>
              <button 
                onClick={() => setFormData({ ...formData, isActive: false })}
                className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${!formData.isActive ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-400 border-gray-100 hover:border-red-200'}`}
              >
                NON-AKTIF
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
              Pilih Tipe Banner
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'promo', label: 'Promo', icon: Megaphone, color: 'emerald' },
                { id: 'info', label: 'Info', icon: Info, color: 'blue' },
                { id: 'warning', label: 'Penting', icon: AlertTriangle, color: 'red' }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setFormData({ ...formData, type: type.id as any })}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                    formData.type === type.id 
                      ? `bg-${type.color}-50 border-${type.color}-500 text-${type.color}-700 shadow-md` 
                      : 'bg-white border-gray-50 text-gray-400 hover:border-emerald-100'
                  }`}
                >
                  <type.icon size={20} />
                  <span className="text-[10px] font-black uppercase tracking-wider">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Pesan Banner (Maks. 100 karakter)</label>
            <textarea 
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value.slice(0, 100) })}
              placeholder="Contoh: Promo Gajian! Diskon 10% untuk pembelian Telur Ayam Ras..."
              className="w-full p-5 rounded-2xl border border-emerald-50 bg-emerald-50/30 focus:ring-2 focus:ring-natural-accent outline-none font-medium text-sm min-h-[100px] resize-none"
            />
            <p className="text-[10px] text-gray-400 text-right font-bold">{formData.text.length}/100 karakter</p>
          </div>

          <button 
            onClick={handleSave}
            disabled={saving || !formData.text.trim()}
            className="w-full py-4 bg-natural-header text-white rounded-2xl font-black shadow-xl shadow-emerald-900/10 hover:bg-emerald-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={20} />
            )}
            SIMPAN PERUBAHAN
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="space-y-4">
        <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest">Pratinjau Banner</h5>
        <div className={`w-full rounded-2xl border p-4 flex items-center gap-4 ${
          formData.type === 'warning' ? 'bg-red-50 border-red-100 text-red-800' :
          formData.type === 'info' ? 'bg-blue-50 border-blue-100 text-blue-800' :
          'bg-emerald-50 border-emerald-100 text-emerald-800'
        }`}>
           <div className={`p-2 rounded-xl ${
             formData.type === 'warning' ? 'bg-red-100 text-red-600' :
             formData.type === 'info' ? 'bg-blue-100 text-blue-600' :
             'bg-emerald-100 text-emerald-600'
           }`}>
             {formData.type === 'warning' ? <AlertTriangle size={18} /> :
              formData.type === 'info' ? <Info size={18} /> :
              <Megaphone size={18} />}
           </div>
           <p className="text-sm font-bold">{formData.text || 'Teks banner akan muncul di sini...'}</p>
        </div>
      </div>
    </div>
  );
}
