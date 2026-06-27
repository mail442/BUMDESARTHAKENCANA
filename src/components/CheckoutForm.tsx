import { useState, FormEvent } from 'react';
import { Send, MapPin, Phone, User, CreditCard, Home, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { PaymentMethod } from '../types';

interface CheckoutFormProps {
  subtotal: number;
  biayaOngkir: number;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const DUSUN_LIST = [
  'Dusun I (Krajan)',
  'Dusun II (Sidamulya)',
  'Dusun III (Pekuncen)',
  'Dusun IV (Waru)',
  'Dusun V (Petuguran Baru)'
];

export default function CheckoutForm({ subtotal, biayaOngkir, onSubmit, onCancel }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    address: '',
    dusun: DUSUN_LIST[0],
    whatsapp: '',
    paymentMethod: 'COD' as PaymentMethod,
  });

  const totalAmount = subtotal + biayaOngkir;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-emerald-50 overflow-hidden text-natural-text">
      <div className="bg-natural-header p-8 text-white relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Send size={120} />
        </div>
        <h2 className="text-3xl font-extrabold">Formulir Pesanan</h2>
        <p className="mt-2 text-emerald-100 flex items-center gap-2">
           <Home size={16} /> Konfirmasi pengiriman ke Desa Petuguran
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Nama */}
           <div className="space-y-2">
              <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <User size={14} /> Nama Lengkap
              </label>
              <input
                required
                type="text"
                placeholder="Contoh: Budi Santoso"
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-natural-bg/30 focus:ring-2 focus:ring-natural-accent focus:border-transparent outline-none transition-all"
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              />
           </div>

           {/* WhatsApp */}
           <div className="space-y-2">
              <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <Phone size={14} /> Nomor WhatsApp
              </label>
              <input
                required
                type="tel"
                placeholder="0812xxxxxx"
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-natural-bg/30 focus:ring-2 focus:ring-natural-accent focus:border-transparent outline-none transition-all"
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
              />
           </div>
        </div>

        {/* Dusun */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
            <MapPin size={14} /> Dusun / Wilayah
          </label>
          <select 
             className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-natural-bg/30 focus:ring-2 focus:ring-natural-accent focus:border-transparent outline-none transition-all appearance-none"
             value={formData.dusun}
             onChange={(e) => setFormData({...formData, dusun: e.target.value})}
          >
            {DUSUN_LIST.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Alamat Detail */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Alamat Lengkap / Patokan Rumah</label>
          <textarea
            required
            rows={2}
            placeholder="RT/RW, No. Rumah, atau ciri-ciri rumah..."
            className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-natural-bg/30 focus:ring-2 focus:ring-natural-accent focus:border-transparent outline-none transition-all"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          />
        </div>

        {/* Info Alur Pesanan */}
        <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100">
           <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3 flex items-center gap-2">
             <Clock size={14} /> Langkah Setelah Memesan:
           </h4>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                 <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">1</div>
                 <div>
                    <p className="text-[10px] font-bold text-natural-header leading-tight">Verifikasi Admin</p>
                    <p className="text-[9px] text-emerald-600 mt-0.5 leading-tight">Admin BUMDes akan mengecek pesanan Anda (Estimasi: 5-15 menit).</p>
                 </div>
              </div>
              <div className="flex items-start gap-3">
                 <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">2</div>
                 <div>
                    <p className="text-[10px] font-bold text-natural-header leading-tight">Penyiapan Stok</p>
                    <p className="text-[9px] text-emerald-600 mt-0.5 leading-tight">Telur segar akan dipilihkan langsung dari kandang BUMDes.</p>
                 </div>
              </div>
              <div className="flex items-start gap-3">
                 <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">3</div>
                 <div>
                    <p className="text-[10px] font-bold text-natural-header leading-tight">Pengiriman Desa</p>
                    <p className="text-[9px] text-emerald-600 mt-0.5 leading-tight">Kurir warga lokal akan mengirimkan pesanan ke rumah Anda.</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Metode Pembayaran */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
            <CreditCard size={14} /> Metode Pembayaran
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              onClick={() => setFormData({...formData, paymentMethod: 'COD'})}
              className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${formData.paymentMethod === 'COD' ? 'border-natural-accent bg-emerald-50 shadow-sm' : 'border-emerald-50 hover:border-emerald-100'}`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'COD' ? 'border-natural-accent bg-natural-accent' : 'border-emerald-200'}`}>
                {formData.paymentMethod === 'COD' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div>
                <p className="font-bold text-natural-header text-sm">COD (Bayar di Tempat)</p>
                <p className="text-[10px] text-emerald-600">Bayar saat telur sampai di rumah</p>
              </div>
            </div>

            <div 
              onClick={() => setFormData({...formData, paymentMethod: 'Transfer'})}
              className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${formData.paymentMethod === 'Transfer' ? 'border-natural-accent bg-emerald-50 shadow-sm' : 'border-emerald-50 hover:border-emerald-100'}`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'Transfer' ? 'border-natural-accent bg-natural-accent' : 'border-emerald-200'}`}>
                {formData.paymentMethod === 'Transfer' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div>
                <p className="font-bold text-natural-header text-sm">Transfer BUMDes</p>
                <p className="text-[10px] text-emerald-600">Bank BRI / E-Wallet Dana/OVO</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-emerald-50">
           <div className="bg-emerald-50/30 p-4 rounded-2xl mb-6 space-y-2">
              <div className="flex justify-between items-center text-sm">
                 <span className="text-emerald-700">Subtotal Pesanan</span>
                 <span className="font-bold text-natural-header">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                 <span className="text-emerald-700">Biaya Ongkir (Desa)</span>
                 <span className="font-bold text-emerald-800">+ Rp {biayaOngkir.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-emerald-100">
                 <span className="text-natural-header font-black">Total Bayar</span>
                 <span className="text-2xl font-black text-natural-header italic">Rp {totalAmount.toLocaleString('id-ID')}</span>
              </div>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-4 items-center">
             <div className="flex-grow hidden sm:block">
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Metode Pembayaran</p>
                <p className="text-sm font-black text-natural-header">{formData.paymentMethod === 'COD' ? 'Bayar di Tempat (COD)' : 'Transfer Bank BUMDes'}</p>
             </div>
             <div className="flex gap-3 w-full sm:w-auto">
                <button
                   type="button"
                   onClick={onCancel}
                   className="flex-1 sm:flex-none px-6 py-4 rounded-xl font-bold text-emerald-400 hover:bg-emerald-50 transition-colors"
                   >
                   Kembali
                </button>
                <button
                   type="submit"
                   className="flex-1 sm:flex-none px-10 py-4 bg-natural-header text-white rounded-xl font-bold shadow-xl shadow-emerald-100 hover:bg-emerald-900 active:scale-95 transition-all uppercase tracking-widest"
                   >
                   Kirim Pesanan
                </button>
             </div>
           </div>
        </div>
      </form>
    </div>
  );
}
