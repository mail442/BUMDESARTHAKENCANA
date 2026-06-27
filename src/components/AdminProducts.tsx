import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, Database, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Product } from '../types';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<{
    nama: string;
    price: number | string;
    stock: number | string;
    unit: 'kg' | 'butir';
    category: string;
    description: string;
    imageUrl: string;
    isPromo: boolean;
  }>({
    nama: '',
    price: 0,
    stock: 0,
    unit: 'kg',
    category: '',
    description: '',
    imageUrl: '',
    isPromo: false
  });

  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => {
        const data = doc.data();
        const updatedAt = (data.updatedAt as any)?.toDate ? (data.updatedAt as any).toDate().toISOString() : data.updatedAt;
        return { ...data, id: doc.id, updatedAt } as Product;
      });
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    // Menghindari penggunaan window.confirm karena potensi blokir di iframe
    setIsDeleting(id);
  };

  const confirmDelete = async (id: string) => {
    try {
      console.log(`Mencoba menghapus produk dengan ID: ${id}`);
      await deleteDoc(doc(db, 'products', id));
      console.log(`Produk ${id} berhasil dihapus dari Firestore`);
      
      // Update state lokal secara optimis jika perlu, 
      // meskipun onSnapshot akan menangani ini secara otomatis.
      setProducts(prev => prev.filter(p => p.id !== id));
      setIsDeleting(null);
    } catch (error) {
      console.error("Gagal menghapus produk:", error);
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
      setIsDeleting(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // Ukuran maksimum lebar untuk optimasi
          const MAX_HEIGHT = 800; // Ukuran maksimum tinggi
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Kompres kualitas ke 0.7 (70%) untuk menghemat ruang secara signifikan
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setFormData({ ...formData, imageUrl: compressedBase64 });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        updatedAt: serverTimestamp()
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), dataToSave);
      } else {
        await addDoc(collection(db, 'products'), dataToSave);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({ nama: '', price: 0, stock: 0, unit: 'kg', category: '', description: '', imageUrl: '', isPromo: false });
    } catch (error) {
      handleFirestoreError(error, editingProduct ? OperationType.UPDATE : OperationType.CREATE, 'products');
    }
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      nama: product.nama,
      price: product.price === 0 ? '' : product.price,
      stock: product.stock === 0 ? '' : product.stock,
      unit: product.unit,
      category: product.category,
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      isPromo: product.isPromo || false
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
         <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2">
               <Database size={16} className="text-emerald-500" />
               <span className="text-xs font-bold text-emerald-600 uppercase tracking-tighter text-nowrap">Server: Petuguran-Cloud</span>
            </div>
         </div>

         <button 
           onClick={() => {
             setEditingProduct(null);
             setFormData({ nama: '', price: 0, stock: 0, unit: 'kg', category: '', description: '', imageUrl: '', isPromo: false });
             setIsModalOpen(true);
           }}
           className="w-full sm:w-auto flex items-center justify-center gap-2 bg-natural-header text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-100 hover:bg-emerald-900 active:scale-95 transition-all text-nowrap"
         >
            <Plus size={20} />
            Tambah Produk Baru
         </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {loading ? (
            <div className="col-span-full py-20 text-center text-gray-400">Memuat katalog...</div>
         ) : products.map(product => (
            <div key={`${product.id}-${product.updatedAt || '0'}`} className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden group hover:border-natural-accent transition-all flex flex-col">
               <div className="h-40 bg-emerald-50 relative overflow-hidden flex items-center justify-center">
                  <img 
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400'} 
                    alt={product.nama}
                    className="w-full h-full object-cover opacity-50 transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent"></div>
                  <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                     <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        product.stock > 10 ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                     }`}>
                        STOK: {product.stock}
                     </span>
                     {product.isPromo && (
                       <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-500 text-white border border-orange-400 shadow-sm flex items-center gap-1">
                          <Tag size={10} fill="currentColor" />
                          PROMO
                       </span>
                     )}
                  </div>
               </div>

               <div className="p-6">
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-1">{product.category}</p>
                  <h4 className="text-lg font-bold text-natural-header mb-4 h-12 line-clamp-2">{product.nama}</h4>
                  
                  <div className="flex justify-between items-end mb-6">
                     <div>
                        <p className="text-xs text-emerald-400 font-medium tracking-tight">Harga Jual</p>
                        <p className="text-2xl font-black text-emerald-800 tracking-tighter">Rp {product.price.toLocaleString('id-ID')}</p>
                     </div>
                     <p className="text-sm text-emerald-100 font-bold uppercase tracking-tighter">/ {product.unit}</p>
                  </div>

                  <div className="flex gap-2">
                     <button 
                       onClick={() => openEdit(product)}
                       className="flex-grow flex items-center justify-center gap-2 p-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-100 transition-all"
                     >
                        <Edit2 size={16} />
                        Update
                     </button>
                     <button 
                       onClick={() => handleDelete(product.id)}
                       className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                       title="Hapus Produk"
                     >
                        <Trash2 size={18} />
                     </button>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* Modal Konfirmasi Hapus */}
      {isDeleting && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-red-100"
          >
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
               <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-black text-natural-header text-center mb-2">Hapus Produk?</h3>
            <p className="text-sm text-gray-500 text-center mb-8">Tindakan ini tidak dapat dibatalkan. Produk akan hilang dari katalog warga.</p>
            <div className="flex gap-3">
               <button 
                 onClick={() => setIsDeleting(null)}
                 className="flex-1 py-3 px-4 bg-gray-50 text-gray-500 rounded-xl font-bold hover:bg-gray-100 transition-all"
               >
                 BATAL
               </button>
               <button 
                 onClick={() => confirmDelete(isDeleting)}
                 className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-100 hover:bg-red-700 transition-all"
               >
                 YA, HAPUS
               </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
             <div className="p-6 border-b border-white/10 flex justify-between items-center bg-natural-header text-white">
                <h3 className="text-xl font-bold">{editingProduct ? 'Edit Produk' : 'Produk Baru'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform"><X size={24} /></button>
             </div>
             <form onSubmit={handleSubmit} className="p-8 space-y-4">
                <div className="space-y-1">
                   <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Nama Produk</label>
                   <input 
                      required
                      className="w-full p-3 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-natural-accent outline-none bg-emerald-50/30"
                      value={formData.nama}
                      onChange={e => setFormData({...formData, nama: e.target.value})}
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Harga (Rp)</label>
                      <input 
                         required
                         type="number"
                         className="w-full p-3 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-natural-accent outline-none bg-emerald-50/30"
                         value={formData.price}
                         onChange={e => setFormData({...formData, price: e.target.value === '' ? '' : Number(e.target.value)})}
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Stok Awal</label>
                      <input 
                         required
                         type="number"
                         className="w-full p-3 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-natural-accent outline-none bg-emerald-50/30"
                         value={formData.stock}
                         onChange={e => setFormData({...formData, stock: e.target.value === '' ? '' : Number(e.target.value)})}
                      />
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Satuan</label>
                      <select 
                         className="w-full p-3 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-natural-accent outline-none bg-emerald-50/30"
                         value={formData.unit}
                         onChange={e => setFormData({...formData, unit: e.target.value as any})}
                      >
                         <option value="kg">kilogram (kg)</option>
                         <option value="butir">butir</option>
                      </select>
                   </div>
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Kategori</label>
                      <input 
                         className="w-full p-3 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-natural-accent outline-none bg-emerald-50/30"
                         value={formData.category}
                         onChange={e => setFormData({...formData, category: e.target.value})}
                         placeholder="Ayam / Bebek / Asin"
                      />
                   </div>
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Foto Produk</label>
                   <div className="flex flex-col gap-3">
                      {formData.imageUrl && (
                        <div className="w-full h-32 rounded-xl overflow-hidden border border-emerald-100 bg-emerald-50">
                           <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <input 
                         type="file"
                         accept="image/*"
                         className="w-full p-3 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-natural-accent outline-none bg-emerald-50/30 text-xs"
                         onChange={handleImageChange}
                      />
                      <p className="text-[10px] text-gray-400">Pilih foto dari galeri HP Anda.</p>
                   </div>
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                     <input 
                        type="checkbox"
                        className="w-4 h-4 rounded border-emerald-100 text-natural-accent focus:ring-natural-accent"
                        checked={formData.isPromo}
                        onChange={e => setFormData({...formData, isPromo: e.target.checked})}
                     />
                     Tampilkan di Banner Utama (Promo)
                   </label>
                </div>
                <div className="flex gap-3 pt-4">
                   <button 
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingProduct(null);
                        setFormData({ nama: '', price: 0, stock: 0, unit: 'kg', category: '', description: '', imageUrl: '', isPromo: false });
                      }}
                      className="flex-1 py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                   >
                      BATAL
                   </button>
                   <button type="submit" className="flex-[2] py-4 bg-natural-header text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-900 transition-all">
                      {editingProduct ? 'SIMPAN UPDATE' : 'TAMBAH PRODUK'}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
