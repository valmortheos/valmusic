
import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from '../Icons';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: () => void }> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onRemove, 300); // Wait for exit animation
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onRemove, 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle className="text-emerald-500" size={20} />;
      case 'error': return <AlertCircle className="text-rose-500" size={20} />;
      default: return <Info className="text-blue-500" size={20} />;
    }
  };

  const getBorderColor = () => {
     switch (toast.type) {
      case 'success': return 'border-emerald-100 bg-emerald-50/90';
      case 'error': return 'border-rose-100 bg-rose-50/90';
      default: return 'border-blue-100 bg-blue-50/90';
    }
  };

  return (
    <div 
      className={`
        flex items-start gap-3 p-4 rounded-2xl shadow-lg border backdrop-blur-md mb-3 transition-all duration-300 transform
        ${getBorderColor()}
        ${isExiting ? 'opacity-0 translate-x-10 scale-95' : 'opacity-100 translate-x-0 scale-100'}
        animate-slide-in-right max-w-sm w-full pointer-events-auto
      `}
    >
      <div className="mt-0.5 flex-shrink-0">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-800 text-sm leading-tight">{toast.title}</h4>
        {toast.message && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{toast.message}</p>}
      </div>
      <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
        <X size={16} />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col items-end pointer-events-none p-2 sm:p-0 w-full sm:w-auto">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};
