import React, { createContext, useContext, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const toast = { id, message, type };
    
    setToasts(prev => [...prev, toast]);
    
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const success = (message) => showToast(message, 'success');
  const error = (message) => showToast(message, 'error');
  const info = (message) => showToast(message, 'info');
  const warning = (message) => showToast(message, 'warning');

  return (
    <ToastContext.Provider value={{ success, error, info, warning }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const Toast = ({ message, type, onClose }) => {
  const config = {
    success: {
      bg: 'bg-green-500',
      icon: CheckCircle,
      text: 'text-white'
    },
    error: {
      bg: 'bg-red-500',
      icon: AlertCircle,
      text: 'text-white'
    },
    warning: {
      bg: 'bg-yellow-500',
      icon: AlertCircle,
      text: 'text-white'
    },
    info: {
      bg: 'bg-blue-500',
      icon: Info,
      text: 'text-white'
    }
  };

  const { bg, icon: Icon, text } = config[type] || config.info;

  return (
    <div className={`${bg} ${text} px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md animate-slide-in`}>
      <Icon size={20} />
      <p className="flex-1 font-medium">{message}</p>
      <button onClick={onClose} className="hover:opacity-75 transition-opacity">
        <X size={18} />
      </button>
    </div>
  );
};