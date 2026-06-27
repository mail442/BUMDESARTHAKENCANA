import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (pin: string) => void;
}

export default function AdminLoginModal({ isOpen, onClose, onLogin }: AdminLoginModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') {
      onLogin(pin);
      setPin('');
      setError(false);
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-natural-header/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Lock size={24} />
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>

              <h2 className="text-2xl font-black text-gray-900 mb-2">Akses Pengurus</h2>
              <p className="text-gray-500 text-sm mb-8 font-medium">Masukkan 4 digit PIN keamanan BUMDes Artha Kencana.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    autoFocus
                    className={`w-full text-center text-4xl tracking-[1em] font-black py-4 bg-gray-50 border-2 rounded-2xl focus:outline-none transition-all ${
                      error ? 'border-red-500 bg-red-50 text-red-600 animate-shake' : 'border-gray-100 focus:border-emerald-500 text-emerald-700'
                    }`}
                  />
                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs font-bold mt-3 flex items-center gap-1 justify-center"
                    >
                      <AlertCircle size={14} /> PIN Salah! Akses ditolak.
                    </motion.p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={pin.length < 4}
                  className="w-full bg-natural-header hover:bg-emerald-900 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-50 disabled:shadow-none"
                >
                  MASUK PANEL ADMIN
                </button>
              </form>
            </div>
            
            <div className="bg-gray-50 p-4 border-t border-gray-100 text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sistem Keamanan internal BUMDes v1.0</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
