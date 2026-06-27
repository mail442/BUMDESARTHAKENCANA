import { useState, useEffect } from 'react';
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
  const [formData, setFormData] = useState({ nama: '', price: 0, stock: 0, unit: 'kg' as 'kg' | 'butir', category: '', description: '', imageUrl: '', isPromo: false });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
      setProducts(productsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = (id: string) => setIsDeleting(id);

  const confirmDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setIsDeleting(null);
    } catch (error) {
      console.error("Gagal menghapus:", error);
      handleFirestoreError(error, OperationType.DELETE, products/${id});
    }
  };

  return (
    <div className="space-y-8 p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {products.map(product => (
            <div key={product.id} className="bg-white p-4 rounded-xl border shadow-sm">
               <h3 className="font-bold">{product.nama}</h3>
               <p>Rp {product.price.toLocaleString('id-ID')}</p>
               <div className="flex gap-2 mt-4">
                  <button onClick={() => handleDelete(product.id)} className="text-red-500 bg-red-50 p-2 rounded">
                     <Trash2 size={16} />
                  </button>
               </div>
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
