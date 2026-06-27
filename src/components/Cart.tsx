import { X, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OrderItem } from '../types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
  biayaOngkir: number;
  onCheckout: () => void;
}

export default function Cart({ isOpen, onClose, items, onRemove, onUpdateQty, biayaOngkir, onCheckout }: CartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + biayaOngkir;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            <div className="p-6 border-b border-emerald-50 flex justify-between items-center bg-emerald-50">
              <div className="flex items-center gap-2">
                <div className="bg-natural-accent p-2 rounded-lg text-white shadow-inner">
                  <ShoppingBag size={20} />
                </div>
                <h2 className="text-xl font-bold text-natural-header">Keranjang Belanja</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white rounded-full transition-colors text-emerald-300 hover:text-red-500"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 bg-natural-bg/30">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={40} className="text-emerald-200" />
                  </div>
                  <p className="text-emerald-700 font-medium">Keranjang Anda masih kosong.</p>
                  <button 
                    onClick={onClose}
                    className="mt-4 text-emerald-600 font-bold hover:underline"
                  >
                    Mulai Belanja &rarr;
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={item.productId}
                      className="flex gap-4 group"
                    >
                      <div className="w-20 h-20 bg-emerald-100 rounded-xl overflow-hidden flex-shrink-0">
                         <img 
                            src={`https://ui-avatars.com/api/?name=${item.productName}&background=E9EDC9&color=1B4332&bold=true`} 
                            alt={item.productName} 
                            className="w-full h-full object-cover"
                         />
                      </div>
                      <div className="flex-grow text-natural-text">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-natural-header">{item.productName}</h4>
                          <button
                            onClick={() => onRemove(item.productId)}
                            className="text-emerald-200 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center gap-3 bg-white rounded-lg px-2 py-1 border border-emerald-100">
                            <button
                              onClick={() => onUpdateQty(item.productId, -1)}
                              className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shadow-sm flex items-center justify-center disabled:opacity-30"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="text-sm font-bold text-natural-header w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQty(item.productId, 1)}
                              className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shadow-sm flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                          <p className="font-bold text-emerald-800">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-emerald-50 bg-emerald-50/50 space-y-4">
                <div className="space-y-2">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-emerald-700">Subtotal</span>
                      <span className="font-bold text-natural-header">Rp {subtotal.toLocaleString('id-ID')}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-emerald-700">Biaya Ongkir (Desa)</span>
                      <span className="font-bold text-emerald-800">+ Rp {biayaOngkir.toLocaleString('id-ID')}</span>
                   </div>
                   <div className="flex justify-between items-center pt-3 border-t border-emerald-100">
                      <span className="text-natural-header font-black">Total Akhir</span>
                      <span className="text-2xl font-black text-natural-header">Rp {total.toLocaleString('id-ID')}</span>
                   </div>
                </div>
                
                <button
                  onClick={onCheckout}
                  className="w-full bg-natural-header text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-900 active:scale-[0.98] transition-all shadow-xl shadow-emerald-200"
                >
                  Lanjut ke Checkout
                  <ArrowRight size={20} />
                </button>
                <p className="text-center text-[10px] text-gray-400">
                  Pembayaran dilakukan melalui COD atau Transfer BUMDes
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
