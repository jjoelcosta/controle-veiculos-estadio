import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingButton({ 
  loading, 
  children, 
  onClick, 
  className = '',
  disabled = false,
  ...props 
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`${className} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={18} />}
      {children}
    </button>
  );
}