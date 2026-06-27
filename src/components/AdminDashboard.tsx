import { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, ShoppingCart, Package, Users, Settings, LogOut, ChevronRight, Bell, Megaphone } from 'lucide-react';
import AdminOrders from './AdminOrders';
import AdminProducts from './AdminProducts';
import AdminBanner from './AdminBanner';
import AdminSettings from './AdminSettings';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Order } from '../types';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'stats' | 'banner' | 'settings'>('orders');

  return (
    <div className="min-h-screen bg-natural-bg flex flex-col md:flex-row text-natural-text">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-natural-header text-white flex flex-col shadow-2xl">
        <div className="p-6 border-b border-emerald-800">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-natural-accent rounded-xl flex items-center justify-center shadow-lg">
                <LayoutDashboard size={24} />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-none">Admin Panel</h2>
                <p className="text-[10px] text-emerald-200 mt-1 uppercase tracking-widest font-bold">BUMDes Artha Kencana</p>
              </div>
           </div>
        </div>

        <nav className="flex-grow p-4 space-y-2 mt-4 text-emerald-100">
          {[
            { id: 'orders', label: 'Pesanan Masuk', icon: ShoppingCart },
            { id: 'products', label: 'Kelola Produk', icon: Package },
            { id: 'stats', label: 'Statistik Desa', icon: Users },
            { id: 'banner', label: 'Banner Promo', icon: Megaphone },
            { id: 'settings', label: 'Pengaturan', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                activeTab === tab.id 
                  ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-900/50 border border-emerald-500' 
                  : 'text-emerald-200/60 hover:bg-emerald-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon size={18} />
                <span className="font-bold text-sm tracking-tight">{tab.label}</span>
              </div>
              {activeTab === tab.id && <ChevronRight size={14} />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-emerald-800 space-y-2">
           <button 
             onClick={onLogout}
             className="w-full flex items-center gap-3 p-3 text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
           >
             <LogOut size={18} />
             <span className="font-semibold text-sm">Keluar Sistem</span>
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow h-screen overflow-y-auto">
        <header className="bg-white border-b border-emerald-50 p-6 flex justify-between items-center sticky top-0 z-10 shadow-sm">
           <div className="flex items-center gap-3">
             <h3 className="text-xl font-black text-natural-header tracking-tight">
               {activeTab === 'orders' && 'Pantau Pesanan Warga'}
               {activeTab === 'products' && 'Inventaris Telur'}
               {activeTab === 'stats' && 'Laporan Penjualan'}
               {activeTab === 'settings' && 'Konfigurasi Sistem'}
             </h3>
             <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold uppercase tracking-widest border border-emerald-100 italic">Live Admin</span>
           </div>

           <div className="flex items-center gap-4">
              <button className="relative p-2 text-emerald-300 hover:bg-emerald-50 rounded-full transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="h-8 w-[1px] bg-emerald-100 mx-2"></div>
              <div className="flex items-center gap-3">
                 <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-natural-header">Admin BUMDes</p>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest leading-none mt-1">Petuguran Jaya</p>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-emerald-100 overflow-hidden">
                    <img 
                      src="https://ui-avatars.com/api/?name=Admin+BUMDes&background=1B4332&color=fff&bold=true" 
                      alt="Avatar" 
                    />
                 </div>
              </div>
           </div>
        </header>

        <main className="p-8">
           {activeTab === 'orders' && <AdminOrders />}
           {activeTab === 'products' && <AdminProducts />}
           {activeTab === 'stats' && <AdminStats />}
           {activeTab === 'banner' && <AdminBanner />}
           {activeTab === 'settings' && <AdminSettings />}
        </main>
      </div>
    </div>
  );
}

function AdminStats() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const chartData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
        fullDate: d.toISOString().split('T')[0],
        sales: 0,
        revenue: 0
      };
    });

    orders.forEach(order => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      const dayData = last7Days.find(d => d.fullDate === orderDate);
      if (dayData) {
        const quantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
        dayData.sales += quantity;
        dayData.revenue += order.totalAmount;
      }
    });

    return last7Days;
  }, [orders]);

  if (loading) return <div className="p-20 text-center text-gray-400 font-bold">Memuat statistik...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-emerald-50 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h4 className="text-lg font-black text-natural-header">Tren Penjualan (7 Hari Terakhir)</h4>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Total produk terjual per hari</p>
               </div>
               <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold">LIVE DATA</div>
            </div>
            
            <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                     <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                     <XAxis 
                       dataKey="date" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fontSize: 10, fontWeight: 700, fill: '#9ca3af'}}
                       dy={10}
                     />
                     <YAxis 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fontSize: 10, fontWeight: 700, fill: '#9ca3af'}}
                     />
                     <Tooltip 
                       contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                       itemStyle={{ fontWeight: 800, fontSize: '12px', color: '#064e3b' }}
                       labelStyle={{ fontWeight: 800, marginBottom: '4px', fontSize: '10px', color: '#9ca3af' }}
                     />
                     <Area 
                       type="monotone" 
                       dataKey="sales" 
                       name="Produk Terjual"
                       stroke="#10b981" 
                       strokeWidth={4}
                       fillOpacity={1} 
                       fill="url(#colorSales)" 
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-emerald-50 shadow-sm">
               <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Ringkasan 7 Hari</h5>
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                     <div>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Total Terjual</p>
                        <p className="text-xl font-black text-natural-header">{chartData.reduce((sum, d) => sum + d.sales, 0)} <span className="text-xs font-normal text-gray-400">Pcs/Kg</span></p>
                     </div>
                     <Package className="text-emerald-300" size={24} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                     <div>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Omzet</p>
                        <p className="text-xl font-black text-natural-header">Rp {chartData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString('id-ID')}</p>
                     </div>
                     <ShoppingCart className="text-blue-300" size={24} />
                  </div>
               </div>
            </div>
            
            <div className="bg-natural-header p-6 rounded-3xl shadow-xl shadow-emerald-900/20 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-2 opacity-10">
                  <LayoutDashboard size={80} />
               </div>
               <div className="relative z-10">
                  <h5 className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mb-2 italic">Tips Stok Admin</h5>
                  <p className="text-xs font-medium leading-relaxed text-emerald-50">
                     {chartData[6].sales >= chartData[5].sales 
                       ? "Permintaan telur meningkat atau stabil hari ini. Pastikan stok di kandang mencukupi untuk besok pagi."
                       : "Penjualan sedikit menurun hari ini. Fokus pada pengecekan kualitas telur agar tetap segar."}
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
