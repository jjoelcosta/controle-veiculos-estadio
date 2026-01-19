import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

export const Modal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', variant = 'danger' }) => {
  if (!isOpen) return null;

  const variants = {
  danger: {
    buttonBg: 'bg-red-600 hover:bg-red-700',
    iconColor: 'text-red-600'
  },
  warning: {
    buttonBg: 'bg-orange-600 hover:bg-orange-700',
    iconColor: 'text-orange-600'
  },
  info: {
    buttonBg: 'bg-blue-600 hover:bg-blue-700',
    iconColor: 'text-blue-600'
  }
};

  const config = variants[variant] || variants.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <AlertTriangle className={config.iconColor} size={24} />
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600">{message}</p>
        </div>

        <div className="flex gap-3 p-6 border-t bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors ${config.buttonBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export const useModal = () => {
  const [modalState, setModalState] = React.useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'danger'
  });

  const openModal = ({ title, message, onConfirm, variant = 'danger' }) => {
    setModalState({
      isOpen: true,
      title,
      message,
      onConfirm,
      variant
    });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const ModalComponent = () => (
    <Modal
      isOpen={modalState.isOpen}
      onClose={closeModal}
      onConfirm={modalState.onConfirm}
      title={modalState.title}
      message={modalState.message}
      variant={modalState.variant}
    />
  );

  return { openModal, closeModal, ModalComponent };
};