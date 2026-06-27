import { useState, useEffect } from 'react';
import { Search, Filter, Phone, CheckCircle, Clock, Truck, Eye, Package, ListFilter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { Order, OrderStatus } from '../types';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'Semua'>('Semua');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => {
        const data = doc.data();
        // Handle legacy 'Pending' status if any
        let status = data.status;
        if (status === 'Pending') status = 'Belum Bayar';
        return { id: doc.id, ...data, status } as Order;
      });
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });
    return () => unsubscribe();
  }, []);

  const getStatusCount = (status: OrderStatus | 'Semua') => {
    if (status === 'Semua') return orders.length;
    return orders.filter(o => o.status === status).length;
  };

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'Semua' || order.status === activeTab;
    const matchesSearch = (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (order.whatsapp || '').includes(searchTerm);
    return matchesTab && matchesSearch;
  });

  const getActionConfig = (status: OrderStatus) => {
    switch (status) {
      case 'Belum Bayar':
        return { label: 'Konfirmasi Bayar', nextStatus: 'Dikemas' as OrderStatus, color: 'bg-blue-600 hover:bg-blue-700' };
      case 'Dikemas':
        return { label: 'Kirim Pesanan', nextStatus: 'Dikirim' as OrderStatus, color: 'bg-[#ee4d2d] hover:bg-[#d73211]' }; // Shopee Orange
      case 'Dikirim':
        return { label: 'Selesaikan', nextStatus: 'Selesai' as OrderStatus, color: 'bg-emerald-600 hover:bg-emerald-700' };
      default:
        return null;
    }
  };

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case 'Belum Bayar':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'Dikemas':
        return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Dikirim':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Selesai':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Batal':
        return 'bg-red-50 text-red-600 border-red-100';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const tabs: (OrderStatus | 'Semua')[] = ['Semua', 'Belum Bayar', 'Dikemas', 'Dikirim', 'Selesai'];

  return (
    <div className="space-y-6">
      {/* Search and Counts */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama atau WhatsApp..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
          />
        </div>
        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-emerald-50 shadow-sm">
           <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Pesanan</span>
              <span className="text-xl font-black text-natural-header">{orders.length}</span>
           </div>
           <div className="w-px h-8 bg-emerald-100" />
           <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Belum Selesai</span>
              <span className="text-xl font-black text-orange-600">{orders.filter(o => o.status !== 'Selesai' && o.status !== 'Batal').length}</span>
           </div>
        </div>
      </div>

      {/* Shopee Style Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex overflow-x-auto no-scrollbar gap-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 relative px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === tab 
                ? 'bg-natural-header text-white shadow-lg' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {tab}
            {getStatusCount(tab) > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === tab ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {getStatusCount(tab)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Order Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-emerald-50/50 text-emerald-700 text-[10px] uppercase tracking-[0.15em] font-black border-b border-emerald-50">
                <th className="px-6 py-5">Info Pesanan</th>
                <th className="px-6 py-5">Warga & Dusun</th>
                <th className="px-6 py-5">Detail Produk</th>
                <th className="px-6 py-5">Total Bayar</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                 <tr><td colSpan={6} className="p-20 text-center text-gray-400">
                   <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                      <p className="text-sm font-bold">Memuat data pesanan...</p>
                   </div>
                 </td></tr>
              ) : filteredOrders.length === 0 ? (
                 <tr><td colSpan={6} className="p-20 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                       <ListFilter size={40} className="text-gray-200" />
                       <p className="text-sm font-bold">Tidak ada pesanan di kategori ini.</p>
                    </div>
                 </td></tr>
              ) : filteredOrders.map((order, idx) => (
                <motion.tr 
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   key={order.id} 
                   className="hover:bg-emerald-50/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md self-start mb-1">#{order.id.slice(-6).toUpperCase()}</span>
                       <div className="text-[10px] text-gray-400 flex items-center gap-1">
                         <Clock size={10} /> {new Date(order.createdAt).toLocaleString('id-ID')}
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-natural-header leading-tight">{order.customerName}</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{order.dusun}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {order.items.map((i, k) => (
                        <div key={k} className="text-xs text-gray-600 flex items-center gap-1">
                           <span className="font-bold">{i.quantity}x</span>
                           <span>{i.productName}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-natural-header">Rp {order.totalAmount.toLocaleString('id-ID')}</p>
                    {order.biayaOngkir ? (
                       <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-tighter">Incl. Ongkir Rp {order.biayaOngkir.toLocaleString('id-ID')}</p>
                    ) : (
                       <p className="text-[9px] text-gray-400 italic">Tanpa Ongkir</p>
                    )}
                    <span className="text-[9px] font-bold text-gray-400">{order.paymentMethod}</span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center justify-center gap-1.5 w-fit ${getStatusStyle(order.status)}`}>
                        {order.status === 'Belum Bayar' && <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />}
                        {order.status === 'Dikemas' && <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" />}
                        {order.status === 'Dikirim' && <Truck size={10} />}
                        {order.status === 'Selesai' && <CheckCircle size={10} />}
                        {order.status}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                       {(() => {
                         const config = getActionConfig(order.status);
                         if (!config) return null;
                         return (
                           <button 
                             onClick={() => updateStatus(order.id, config.nextStatus)}
                             className={`px-4 py-2.5 text-white text-[10px] font-black rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 ${config.color}`}
                           >
                             {order.status === 'Dikemas' && <Truck size={14} />}
                             {config.label.toUpperCase()}
                           </button>
                         );
                       })()}
                       
                       <div className="flex gap-1">
                          <a 
                            href={`https://wa.me/${(order.whatsapp || '').replace(/^0/, '62')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-2.5 text-green-500 bg-green-50 hover:bg-green-100 rounded-xl transition-all border border-green-100"
                            title="Hubungi Warga"
                          >
                            <Phone size={16} />
                          </a>
                          <button className="p-2.5 text-gray-400 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-100">
                             <Eye size={16} />
                          </button>
                       </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
