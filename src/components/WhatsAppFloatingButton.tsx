import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const WhatsAppFloatingButton: React.FC = () => {
  const phoneNumber = "6281234567890"; // Nomor BUMDes Petuguran
  const message = "Halo BUMDes Petuguran, saya ingin bertanya mengenai layanan atau produk yang tersedia.";
  
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <motion.button
      id="whatsapp-floating-button"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className="fixed bottom-24 right-6 z-50 p-4 bg-[#25D366] text-white rounded-full shadow-2xl hover:bg-[#128C7E] transition-colors flex items-center justify-center group"
      title="Hubungi Admin via WhatsApp"
    >
      <MessageCircle size={28} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
      <span className="absolute right-full mr-3 bg-white text-gray-800 px-3 py-1.5 rounded-lg text-sm font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-emerald-50">
        Butuh Bantuan? Hubungi Kami
      </span>
    </motion.button>
  );
};
