import React, { useState, useEffect } from 'react';
import { History, Package, Clock, ChevronRight, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Order } from '../types';

interface OrderHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ isOpen, onClose }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    setLoading(true);
    const savedOrderIds = JSON.parse(localStorage.getItem('bumdes_order_history') || '[]');
    
    if (savedOrderIds.length === 0) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      const orderData: Order[] = [];
      // Fetch each order from Firestore
      for (const id of savedOrderIds) {
        const docRef = doc(db, 'orders', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          orderData.push({ id: docSnap.id, ...docSnap.data() } as Order);
        }
      }
      // Sort by newest
      setOrders(orderData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error("Error fetching order history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Selesai': return 'bg-emerald-100 text-emerald-700';
      case 'Proses': return 'bg-blue-100 text-blue-700';
      case 'Dibatalkan': return 'bg-red-100 text-red-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-emerald-50 flex justify-between items-center bg-emerald-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                  <History size={20} />
                </div>
                <h2 className="text-xl font-black text-natural-header">Riwayat Pesanan</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-emerald-100 rounded-xl transition-colors">
                <X size={24} className="text-emerald-800" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-bold text-emerald-600">Memuat riwayat...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-20">
                  <Package size={64} className="mx-auto text-emerald-100 mb-4" />
                  <p className="text-gray-500 font-medium">Belum ada riwayat pesanan.</p>
                  <p className="text-xs text-gray-400 mt-2 italic">Pesanan Anda akan muncul di sini setelah Anda berbelanja.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-3xl border border-emerald-50 shadow-sm hover:shadow-md transition-shadow bg-emerald-50/10"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">ID Pesanan: {order.id.slice(-6).toUpperCase()}</p>
                        <div className="flex items-center gap-2 mt-1 text-gray-400">
                          <Clock size={12} />
                          <p className="text-xs font-medium">{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.productName} <span className="text-xs text-gray-400">x{item.quantity}</span></span>
                          <span className="font-bold text-natural-header italic">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                      {order.biayaOngkir && (
                         <div className="flex justify-between text-sm pt-2 border-t border-emerald-50">
                            <span className="text-emerald-600 font-medium italic">Biaya Ongkir</span>
                            <span className="font-bold text-emerald-800 italic">Rp {order.biayaOngkir.toLocaleString('id-ID')}</span>
                         </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-emerald-100">
                      <span className="text-xs font-bold text-gray-400">Total Bayar</span>
                      <span className="text-lg font-black text-natural-header italic">Rp {order.totalAmount.toLocaleString('id-ID')}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="p-6 bg-emerald-50/30 border-t border-emerald-50">
               <p className="text-[10px] text-gray-400 text-center leading-relaxed font-medium">
                  Riwayat ini disimpan pada perangkat Anda. Menghapus cache browser dapat menghilangkan daftar riwayat ini.
               </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
