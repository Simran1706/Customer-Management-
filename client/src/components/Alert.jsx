import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const alertStyles = {
  success: {
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
  },
  error: {
    bg: 'bg-rose-50 border-rose-200 text-rose-800',
    icon: <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
  },
  info: {
    bg: 'bg-brand-50 border-brand-200 text-brand-800',
    icon: <Info className="w-5 h-5 text-brand-600 flex-shrink-0" />
  }
};

const Alert = ({ type = 'info', message, onClose, className = '' }) => {
  if (!message) return null;

  const style = alertStyles[type] || alertStyles.info;

  return (
    <div
      role="alert"
      className={`border rounded-xl p-4 flex items-start gap-3 transition-all ${style.bg} ${className}`}
    >
      {style.icon}
      <div className="flex-1 text-sm font-medium leading-relaxed">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          aria-label="Dismiss alert"
          className="text-slate-400 hover:text-slate-700 transition p-0.5 rounded-lg hover:bg-black/5"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
