import { useState } from 'react';
import { Plus, Minus, Info, Truck, MessageCircle, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ProductCardProps {
  product: Product;
  isPromo?: boolean;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, isPromo, onAddToCart }: ProductCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const isOutOfStock = product.stock <= 0;

  const handleWhatsAppOrder = () => {
    const phoneNumber = "6281234567890"; // Nomor BUMDes Petuguran
    const message = `Halo BUMDes, saya ingin memesan ${product.nama} seharga Rp ${product.price.toLocaleString('id-ID')}/${product.unit}. Mohon informasinya.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  const handleAddClick = () => {
    if (isOutOfStock) return;
    setIsAnimating(true);
    onAddToCart(product);
    setTimeout(() => setIsAnimating(false), 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full relative"
    >
      <div className="relative h-48 sm:h-56">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400'}
          alt={product.nama}
          className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${isOutOfStock ? 'grayscale opacity-75' : ''}`}
          referrerPolicy="no-referrer"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
            <span className="bg-white text-red-600 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg"> Stok Habis </span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
           <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm border border-emerald-100">
             {product.category || 'Terlaris'}
           </span>
           {isPromo && (
             <span className="bg-amber-500 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 animate-pulse">
               PROMO
             </span>
           )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-bold text-natural-text">{product.nama}</h3>
          <button className="text-emerald-300 hover:text-emerald-600 transition-colors">
            <Info size={18} />
          </button>
        </div>
        <p className="text-sm text-emerald-700/60 line-clamp-2 mb-4 leading-relaxed">
          {product.description || 'Telur berkualitas tinggi produksi lokal Petuguran, dijamin segar dan bernutrisi.'}
        </p>

        <div className="mt-auto">
          <div className="flex items-end justify-between mb-4">
            <div>
              <span className="text-2xl font-black text-emerald-800">
                Rp {product.price.toLocaleString('id-ID')}
              </span>
              <span className="text-sm text-emerald-400 font-medium ml-1">/{product.unit}</span>
            </div>
            {product.stock > 0 && (
               <div className="flex flex-col items-end">
                 <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-tighter">Stok: {product.stock} {product.unit}</span>
                 <div className="flex items-center gap-1 mt-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded shadow-sm border border-amber-100">
                   <Truck size={10} strokeWidth={3} />
                   <span>Dikirim hari ini</span>
                 </div>
               </div>
            )}
          </div>

          <div className="grid grid-cols-5 gap-2 relative">
            <button
              onClick={handleWhatsAppOrder}
              className="col-span-1 bg-green-500 text-white p-3 rounded-xl flex items-center justify-center hover:bg-green-600 transition-colors shadow-md shadow-green-100 active:scale-95"
              title="Pesan via WhatsApp"
            >
              <MessageCircle size={20} />
            </button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddClick}
              disabled={isOutOfStock}
              className={`col-span-4 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all relative overflow-hidden ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-natural-header text-white hover:bg-emerald-900 shadow-lg shadow-emerald-100'
              }`}
            >
              <Plus size={18} />
              Beli Sekarang

              {/* Bounce Effect Overlay */}
              <AnimatePresence>
                {isAnimating && (
                  <motion.div
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-white/20 rounded-full"
                  />
                )}
              </AnimatePresence>
            </motion.button>

            {/* Flying Icon Animation */}
            <AnimatePresence>
              {isAnimating && (
                <motion.div
                  initial={{ x: 100, y: 0, opacity: 1, scale: 1 }}
                  animate={{ 
                    x: [100, 200, 300], 
                    y: [0, -400, -800], 
                    opacity: [1, 0.8, 0],
                    scale: [1, 1.5, 0.5]
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="fixed pointer-events-none z-[100] text-natural-accent"
                >
                  <ShoppingCart size={32} fill="currentColor" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
