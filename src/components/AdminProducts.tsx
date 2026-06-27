[17.15, 27/6/2026] ISMAIL: {/* Modal Konfirmasi Hapus */}
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
            <p className="text-sm text-gray-500 text-center mb-8">Tindakan ini tidak dapat …
[17.16, 27/6/2026] ISMAIL: import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, Database, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, updateDoc, doc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Product } from '../types';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ nama: '', price: 0, stock: 0, unit: …
[17.33, 27/6/2026] ISMAIL: import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { Product } from '../types';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
      setProducts(productsData);
    });
    return () => unsubscribe();
  }, []);

  const confirmDelete = async (id: string) => {
    try {
      console.log("Mencoba menghapus ID:", id);
      await deleteDoc(doc(db, 'products', id));
      alert("Produk berhasil dihapus!");
      setIsDeleting(null);
    } catch (error: any) {
      console.error("Gagal menghapus:", error);
      // Menampilkan pesan error langsung ke layar agar Anda tahu penyebab macetnya
      alert("Gagal menghapus: " + (error.message || "Izin ditolak (Permission Denied)"));
      handleFirestoreError(error, OperationType.DELETE, products/${id});
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-8 p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {products.map(product => (
            <div key={product.id} className="bg-white p-4 rounded-xl border shadow-sm">
               <h3 className="font-bold">{product.nama}</h3>
               <p>Rp {product.price.toLocaleString('id-ID')}</p>
               <button onClick={() => setIsDeleting(product.id)} className="text-red-500 bg-red-50 p-2 rounded mt-4">
                  <Trash2 size={16} />
               </button>
            </div>
         ))}
      </div>

      {isDeleting && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white p-8 rounded-2xl max-w-sm w-full text-center">
            <h3 className="text-lg font-bold mb-4">Hapus Produk?</h3>
            <div className="flex gap-3">
               <button onClick={() => setIsDeleting(null)} className="flex-1 py-2 bg-gray-200 rounded-xl">BATAL</button>
               <button onClick={() => confirmDelete(isDeleting)} className="flex-1 py-2 bg-red-600 text-white rounded-xl">YA, HAPUS</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
