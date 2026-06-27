import { motion } from 'motion/react';
import { Package, Truck, ShieldCheck, Wallet, Tag } from 'lucide-react';
import { Product } from '../types';

interface HeroProps {
  promoProduct?: Product;
}

export default function Hero({ promoProduct }: HeroProps) {
  return (
    <div className="relative overflow-hidden bg-natural-bg pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-4">
                Pelayanan Desa Petuguran
              </span>
              <h2 className="text-4xl font-extrabold text-natural-header tracking-tight sm:text-5xl">
                Telur Segar dari <br />
                <span className="text-natural-accent">BUMDes Artha Kencana</span>
              </h2>
              <p className="mt-3 text-base text-emerald-800/80 sm:mt-5 sm:text-lg">
                Penuhi kebutuhan gizi keluarga Anda dengan telur berkualitas tinggi. 
                Langsung diantar ke depan rumah Anda di seluruh Dusun Desa Petuguran. 
                Segar, murah, dan amanah.
              </p>
              
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {[
                  { icon: Truck, label: 'Layanan Antar' },
                  { icon: ShieldCheck, label: 'Kualitas Terjamin' },
                  { icon: Wallet, label: 'Bayar COD' },
                  { icon: Package, label: 'Stok Selalu Ada' },
                ].map((feature, idx) => (
                  <div key={idx} className="flex flex-col items-center lg:items-start text-center lg:text-left">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-white text-emerald-600 mb-2 shadow-sm">
                      <feature.icon size={20} />
                    </div>
                    <span className="text-xs font-medium text-emerald-700 tracking-tight">{feature.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mx-auto w-full rounded-2xl shadow-2xl overflow-hidden"
            >
              <img
                src={promoProduct?.imageUrl || "https://images.unsplash.com/photo-1518562180175-34a163b1a9a5?auto=format&fit=crop&q=80&w=1000"}
                alt={promoProduct?.nama || "Fresh Eggs Hero"}
                className="w-full h-[400px] object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-emerald-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-natural-accent rounded-xl flex items-center justify-center text-white shadow-lg animate-bounce">
                    <Tag size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-0.5">Promo Spesial Hari Ini</p>
                    <h4 className="text-sm font-bold text-natural-header leading-tight">
                      {promoProduct ? promoProduct.nama : 'Telur Ayam Ras Negeri'}
                    </h4>
                    <p className="text-lg font-black text-emerald-800">
                      Rp {promoProduct ? promoProduct.price.toLocaleString('id-ID') : '---'}
                      <span className="text-[10px] font-bold text-emerald-400 ml-1 uppercase">/ {promoProduct?.unit || 'kg'}</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
