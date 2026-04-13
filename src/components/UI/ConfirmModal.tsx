import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  loading = false
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-spotify-dark border border-white/10 rounded-2xl p-8 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6">
                <AlertTriangle size={32} />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
              <p className="text-spotify-gray mb-8">{description}</p>
              
              <div className="flex items-center gap-4 w-full">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-3 px-6 rounded-full font-bold text-white bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 py-3 px-6 rounded-full font-bold text-white bg-red-600 hover:bg-red-700 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Confirm Delete'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
