import { useState, useEffect } from 'react';
import { ShoppingCart, LogIn, LayoutDashboard, User, History } from 'lucide-react';
import { motion, useAnimation } from 'motion/react';

interface NavbarProps {
  isAdmin: boolean;
  onToggleAdmin: () => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenHistory: () => void;
}

export default function Navbar({ isAdmin, onToggleAdmin, cartCount, onOpenCart, onOpenHistory }: NavbarProps) {
  const controls = useAnimation();

  useEffect(() => {
    if (cartCount > 0) {
      controls.start({
        scale: [1, 1.3, 1],
        transition: { duration: 0.3 }
      });
    }
  }, [cartCount, controls]);

  return (
    <nav className="sticky top-0 z-50 bg-natural-header text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-natural-accent rounded-full flex items-center justify-center text-white shadow-inner"
            >
              <ShoppingCart size={20} />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-tight">
                BUMDes <span className="text-white">Artha Kencana</span>
              </h1>
              <p className="text-[10px] text-emerald-200 uppercase tracking-widest font-medium">
                Desa Petuguran • Toko Telur Online
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onToggleAdmin}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isAdmin 
                  ? 'bg-emerald-700 text-white border border-emerald-500' 
                  : 'bg-emerald-800 text-emerald-100 hover:bg-emerald-700 border border-emerald-600'
              }`}
            >
              {isAdmin ? <LayoutDashboard size={14} /> : <LogIn size={14} />}
              {isAdmin ? 'PANEL ADMIN' : 'ADMIN LOGIN'}
            </button>

            {!isAdmin && (
              <>
                <button
                  onClick={onOpenHistory}
                  className="p-2 text-emerald-100 hover:bg-emerald-700 hover:text-white rounded-full transition-colors flex items-center gap-1 group"
                  title="Riwayat Pesanan"
                >
                  <History size={22} className="group-hover:rotate-12 transition-transform" />
                </button>

                <motion.button
                  animate={controls}
                  onClick={onOpenCart}
                  className="relative p-2 text-emerald-100 hover:bg-emerald-700 hover:text-white rounded-full transition-colors"
                >
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    key={cartCount}
                    className="absolute top-0 right-0 h-5 w-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-emerald-900"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>
            </>
          )}

            {isAdmin && (
               <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <User size={16} />
                  </div>
                  <span className="hidden sm:inline">Pengurus BUMDes</span>
               </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
