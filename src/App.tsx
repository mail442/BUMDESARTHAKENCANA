import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import CheckoutForm from './components/CheckoutForm';
import AdminDashboard from './components/AdminDashboard';
import AdminLoginModal from './components/AdminLoginModal';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { Testimonials } from './components/Testimonials';
import { OrderHistory } from './components/OrderHistory';
import { Product, OrderItem, Order, PromoBanner } from './types';
import { CheckCircle, XCircle, Megaphone, Info, AlertTriangle } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, getDocs, addDoc, query, orderBy, serverTimestamp, getDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';

// Initial Data for Seeding
const SEED_PRODUCTS = [
  {
    nama: 'Telur Ayam Ras (Negeri)',
    description: 'Telur ayam ras segar pilihan, cangkang kokoh, kuning telur oranye cerah. Cocok untuk konsumsi harian.',
    price: 28000,
    unit: 'kg',
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1518562180175-34a163b1a9a5?auto=format&fit=crop&q=80&w=400',
    category: 'Paling Laris',
  },
  {
    nama: 'Telur Bebek Segar (Angon)',
    description: 'Telur bebek hasil ternak desa, lebih gurih dan kaya nutrisi. Bagus untuk jamu atau olahan kue.',
    price: 3500,
    unit: 'butir',
    stock: 120,
    imageUrl: 'https://images.unsplash.com/photo-1598965675045-45c5e72c7205?auto=format&fit=crop&q=80&w=400',
    category: 'Segar',
  },
  {
    nama: 'Telur Asin Asli Petuguran',
    description: 'Telur asin buatan warga Petuguran dengan rasa masir yang pas. Tidak terlalu asin, cocok untuk oleh-oleh.',
    price: 4500,
    unit: 'butir',
    stock: 80,
    imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=400',
    category: 'Olahan Desa',
  }
];

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [promoProductId, setPromoProductId] = useState<string | null>(null);
  const [promoBanner, setPromoBanner] = useState<PromoBanner | null>(null);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckout, setIsCheckout] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<boolean | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [shippingCost, setShippingCost] = useState<number>(5000);
  const [loading, setLoading] = useState(true);

  // Real-time Promo Banner
  useEffect(() => {
    const q = query(collection(db, 'banners'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        // Seed default banner if empty
        const defaultBanner = {
          text: 'Selamat Datang di BUMDes Artha Kencana! Nikmati Telur Segar Berkualitas Langsung dari Kandang.',
          isActive: true,
          type: 'promo',
          updatedAt: new Date().toISOString()
        };
        addDoc(collection(db, 'banners'), defaultBanner);
        return;
      }
      const bannerData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PromoBanner))[0];
      setPromoBanner(bannerData);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Order Tracking for Consumer
  useEffect(() => {
    if (!orderSuccess || !activeOrder?.id) return;

    const unsubscribe = onSnapshot(doc(db, 'orders', activeOrder.id), (snapshot) => {
      if (snapshot.exists()) {
        setActiveOrder({ id: snapshot.id, ...snapshot.data() } as Order);
      }
    });

    return () => unsubscribe();
  }, [orderSuccess, activeOrder?.id]);

  // Real-time Shipping Cost
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'shipping'), (snapshot) => {
      if (snapshot.exists()) {
        setShippingCost(snapshot.data().cost);
      } else {
        // Initialize if not exists
        setDoc(doc(db, 'settings', 'shipping'), { cost: 5000, updatedAt: new Date().toISOString() });
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Products Listener from Firestore
  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        // Seed initial data if empty - but only if it's the first check
        // Using getDocs here for seeding check to avoid loops
        getDocs(q).then(async (snap) => {
          if (snap.empty) {
             const seedPromises = SEED_PRODUCTS.map(p => 
                addDoc(collection(db, 'products'), { ...p, updatedAt: new Date().toISOString() })
              );
              await Promise.all(seedPromises);
          }
        });
        return;
      }

      const productsData = snapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore Timestamp to ISO string for the key and type compatibility
        const updatedAt = (data.updatedAt as any)?.toDate ? (data.updatedAt as any).toDate().toISOString() : data.updatedAt;
        return { ...data, id: doc.id, updatedAt } as Product;
      });

      // Ensure uniqueness by ID to prevent duplicates in state
      const uniqueProducts = Array.from(new Map(productsData.map(p => [p.id, p])).values());
      setProducts(uniqueProducts);
      
      // Identify Promo Product ID
      const promoItem = uniqueProducts.find(p => p.isPromo);
      if (promoItem) {
        setPromoProductId(promoItem.id);
      } else {
        // Fallback to name search if no explicitly marked promo product found
        const fallbackPromo = uniqueProducts.find(p => 
          (p.nama || '').toLowerCase().includes('telur ayam ras') && 
          (p.nama || '').toLowerCase().includes('negeri')
        );
        if (fallbackPromo) {
          setPromoProductId(fallbackPromo.id);
        }
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const grandTotal = totalAmount > 0 ? totalAmount + shippingCost : 0;

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert(`Maaf, stok ${product.nama} sedang kosong.`);
      return;
    }
    setCartItems(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.nama,
        quantity: 1,
        price: product.price,
        unit: product.unit
      }];
    });
    setTimeout(() => {
      setIsCartOpen(true);
    }, 600);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => 
      item.productId === id 
        ? { ...item, quantity: Math.max(1, item.quantity + delta) } 
        : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== id));
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLogin = (pin: string) => {
    if (pin === '1234') {
      setIsAdmin(true);
      setIsAdminLoginOpen(false);
    }
  };

  const handleCheckoutSubmit = async (formData: any) => {
    try {
      const newOrderData = {
        ...formData,
        items: cartItems,
        subtotal: totalAmount,
        biayaOngkir: shippingCost,
        totalAmount: grandTotal,
        status: 'Belum Bayar', // Match new status
        createdAt: new Date().toISOString(),
      };
      
      const docRef = await addDoc(collection(db, 'orders'), newOrderData);
      
      // Save to local history
      const savedHistory = JSON.parse(localStorage.getItem('bumdes_order_history') || '[]');
      localStorage.setItem('bumdes_order_history', JSON.stringify([docRef.id, ...savedHistory]));
      
      // WhatsApp Redirection
      const phoneNumber = "6281234567890"; // Nomor BUMDes Petuguran
      const itemsList = cartItems.map(item => `- ${item.productName} x ${item.quantity} ${item.unit}: Rp ${(item.price * item.quantity).toLocaleString('id-ID')}`).join('\n');
      
      const message = `*PESANAN BARU BUMDes Petuguran*\n\n` +
        `*ID Pesanan:* ${docRef.id.slice(-6).toUpperCase()}\n` +
        `*Nama:* ${formData.customerName}\n` +
        `*Alamat:* ${formData.address}, ${formData.dusun}\n` +
        `*WhatsApp:* ${formData.whatsapp}\n` +
        `*Metode Bayar:* ${formData.paymentMethod}\n\n` +
        `*Daftar Pesanan:*\n${itemsList}\n\n` +
        `*Subtotal:* Rp ${totalAmount.toLocaleString('id-ID')}\n` +
        `*Biaya Ongkir:* Rp ${shippingCost.toLocaleString('id-ID')}\n` +
        `*Total Bayar:* Rp ${grandTotal.toLocaleString('id-ID')}\n\n` +
        `Mohon segera dikonfirmasi. Terima kasih!`;

      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
      
      setActiveOrder({ id: docRef.id, ...newOrderData } as Order);
      setOrderSuccess(true);
      setCartItems([]);
      setIsCheckout(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
      setOrderSuccess(false);
    }
  };

  if (isAdmin) {
    return <AdminDashboard onLogout={() => setIsAdmin(false)} />;
  }

  return (
    <div className="min-h-screen bg-natural-bg font-sans selection:bg-emerald-100 selection:text-emerald-800 text-natural-text">
      <Navbar 
        isAdmin={isAdmin} 
        onToggleAdmin={handleAdminToggle} 
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenHistory={() => setIsOrderHistoryOpen(true)}
      />

      {/* Promo Banner Dinamis */}
      <AnimatePresence>
        {promoBanner && promoBanner.isActive && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className={`w-full overflow-hidden border-b ${
              promoBanner.type === 'warning' ? 'bg-red-50 border-red-100' :
              promoBanner.type === 'info' ? 'bg-blue-50 border-blue-100' :
              'bg-emerald-50 border-emerald-100'
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-center gap-3">
              <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                promoBanner.type === 'warning' ? 'bg-red-100 text-red-600' :
                promoBanner.type === 'info' ? 'bg-blue-100 text-blue-600' :
                'bg-emerald-100 text-emerald-600'
              }`}>
                {promoBanner.type === 'warning' ? <AlertTriangle size={14} /> :
                 promoBanner.type === 'info' ? <Info size={14} /> :
                 <Megaphone size={14} />}
              </div>
              <p className={`text-[11px] sm:text-xs font-bold tracking-tight text-center leading-relaxed ${
                promoBanner.type === 'warning' ? 'text-red-800' :
                promoBanner.type === 'info' ? 'text-blue-800' :
                'text-emerald-800'
              }`}>
                {promoBanner.text}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        <Hero promoProduct={products.find(p => p.id === promoProductId)} />

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-xl">
              <h2 className="text-3xl font-black text-natural-header tracking-tight sm:text-4xl">
                Katalog Telur <span className="text-natural-accent italic underline decoration-emerald-200 decoration-8 underline-offset-4">Pilihan Kami</span>
              </h2>
              <p className="mt-4 text-emerald-700 font-medium"> Pilih produk telur terbaik untuk gizi keluarga Anda. Semua stok dijamin segar setiap harinya. </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-white px-4 py-2 rounded-full border border-emerald-100 shadow-sm">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
               PEMBARUAN HARGA: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map(n => (
                <div key={n} className="h-96 bg-gray-100 rounded-2xl animate-pulse"></div>
              ))
            ) : (
              products.map(product => (
                <ProductCard 
                  key={`${product.id}-${product.updatedAt || '0'}`} 
                  product={product} 
                  isPromo={product.id === promoProductId}
                  onAddToCart={addToCart} 
                />
              ))
            )}
          </div>
        </section>

        <Testimonials />

        <section className="bg-natural-header py-16">
           <div className="max-w-7xl mx-auto px-4 text-center">
              <h3 className="text-3xl font-black text-white mb-6">Maju Bersama BUMDes Artha Kencana</h3>
              <p className="text-emerald-100 max-w-2xl mx-auto mb-8 text-lg font-medium opacity-90">
                Layanan ini didedikasikan untuk kemudahan warga Desa Petuguran dalam mencukupi kebutuhan protein keluarga. 
                Kami menjamin keadilan harga dan kecepatan pengiriman.
              </p>
              <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/20">
                 <div className="text-left border-r border-white/20 pr-6 mr-6">
                    <p className="text-xs text-emerald-200 font-bold uppercase tracking-widest">Kantor BUMDes</p>
                    <p className="text-sm text-white font-black">Balai Desa Petuguran</p>
                 </div>
                 <div className="text-left">
                    <p className="text-xs text-emerald-200 font-bold uppercase tracking-widest">Kontak Darurat</p>
                    <p className="text-sm text-white font-black">0812-3444-5555</p>
                 </div>
              </div>
           </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-100 py-8 px-4 text-center">
        <p className="text-sm text-gray-400 font-medium italic">
          &copy; 2026 BUMDes Artha Kencana, Desa Petuguran. Dibuat dengan &hearts; untuk warga desa.
        </p>
      </footer>

      {/* Overlays */}
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemove={removeFromCart}
        onUpdateQty={updateCartQty}
        biayaOngkir={shippingCost}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckout(true);
        }}
      />

      <AnimatePresence>
        {isCheckout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl"
            >
               <CheckoutForm 
                 subtotal={totalAmount}
                 biayaOngkir={shippingCost}
                 onCancel={() => setIsCheckout(false)}
                 onSubmit={handleCheckoutSubmit}
               />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AdminLoginModal 
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLogin={handleAdminLogin}
      />

      <WhatsAppFloatingButton />

      <OrderHistory 
        isOpen={isOrderHistoryOpen} 
        onClose={() => setIsOrderHistoryOpen(false)} 
      />

      <AnimatePresence>
        {orderSuccess === false && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[250] bg-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-red-500 flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
               <XCircle size={24} />
            </div>
            <div>
               <p className="text-sm font-bold text-gray-900">Gagal Mengirim Pesanan</p>
               <p className="text-[10px] text-gray-500">Mohon periksa koneksi Anda dan coba lagi.</p>
            </div>
            <button onClick={() => setOrderSuccess(null)} className="text-gray-400 hover:text-gray-600">
               <XCircle size={16} />
            </button>
          </motion.div>
        )}

        {orderSuccess && activeOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-emerald-100"
            >
               <div className="bg-emerald-600 p-8 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <div className="relative z-10">
                     <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <CheckCircle size={40} className="text-emerald-600" />
                     </div>
                     <h3 className="text-2xl font-black text-white">Pesanan Berhasil!</h3>
                     <p className="text-emerald-100 text-sm font-medium mt-1">Terima kasih, warga Desa Petuguran.</p>
                  </div>
               </div>

               <div className="p-8 space-y-6">
                  {/* Status Tracking ala Shopee */}
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Status Pelacakan</h4>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                          activeOrder.status === 'Belum Bayar' ? 'bg-gray-100 text-gray-600' :
                          activeOrder.status === 'Dikemas' ? 'bg-orange-100 text-orange-600' :
                          activeOrder.status === 'Dikirim' ? 'bg-blue-100 text-blue-600' :
                          'bg-emerald-100 text-emerald-600'
                        }`}>
                           {activeOrder.status}
                        </span>
                     </div>

                     <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-50">
                        <div className="flex gap-4">
                           <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full ${activeOrder.status !== 'Belum Bayar' ? 'bg-emerald-600' : 'bg-gray-300'} shadow-sm shadow-emerald-200`} />
                              <div className="w-0.5 h-10 bg-gray-200" />
                              <div className={`w-3 h-3 rounded-full ${activeOrder.status === 'Dikirim' || activeOrder.status === 'Selesai' ? 'bg-emerald-600' : 'bg-gray-300'}`} />
                              <div className="w-0.5 h-10 bg-gray-200" />
                              <div className={`w-3 h-3 rounded-full ${activeOrder.status === 'Selesai' ? 'bg-emerald-600' : 'bg-gray-300'}`} />
                           </div>
                           <div className="flex flex-col justify-between py-0.5">
                              <div>
                                 <p className="text-xs font-bold text-natural-header">Pesanan Diterima</p>
                                 <p className="text-[10px] text-gray-500">Admin sedang memproses pesanan Anda.</p>
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-natural-header">Sedang Dikirim</p>
                                 <p className="text-[10px] text-gray-500">
                                   {activeOrder.status === 'Dikirim' ? 'Kurir sedang menuju ke lokasi Anda.' : 'Menunggu kurir berangkat.'}
                                 </p>
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-natural-header">Tiba di Tujuan</p>
                                 <p className="text-[10px] text-gray-500">Nikmati produk segar dari BUMDes kami.</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="pt-4 flex flex-col gap-3">
                     <button 
                       onClick={() => setOrderSuccess(null)}
                       className="w-full py-4 bg-natural-header text-white rounded-2xl font-black shadow-xl shadow-emerald-100 active:scale-95 transition-all"
                     >
                       KEMBALI KE BERANDA
                     </button>
                     <p className="text-[10px] text-center text-gray-400 font-medium">Layar ini akan memperbarui status secara otomatis jika ada perubahan dari admin.</p>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
