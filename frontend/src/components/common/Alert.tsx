import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, HelpCircle } from 'lucide-react';

export type AlertType = 'confirm' | 'info' | 'success' | 'error' | 'warning';

interface AlertProps {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({
  isOpen,
  type,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  onClose,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-12 h-12 text-secondary" />;
      case 'error':
        return <XCircle className="w-12 h-12 text-danger" />;
      case 'warning':
        return <AlertTriangle className="w-12 h-12 text-warning" />;
      case 'info':
        return <Info className="w-12 h-12 text-primary" />;
      case 'confirm':
        return <HelpCircle className="w-12 h-12 text-primary" />;
    }
  };

  const getHeaderColor = () => {
    switch (type) {
      case 'success': return 'text-secondary';
      case 'error': return 'text-danger';
      case 'warning': return 'text-warning';
      default: return 'text-text-main';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border-default rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 flex flex-col items-center text-center gap-4">
          {getIcon()}
          <div>
            <h3 className={`text-xl font-bold mb-2 ${getHeaderColor()}`}>{title}</h3>
            <p className="text-text-body text-sm">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 bg-surface-muted border-t border-border-default">
          {type === 'confirm' && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg font-medium text-sm border border-border-default hover:bg-surface text-text-body transition-colors flex-1"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={type === 'confirm' ? handleConfirm : onClose}
            className={`px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium flex-1 ${
              type === 'error' ? 'bg-danger hover:bg-red-600' :
              type === 'warning' ? 'bg-warning hover:bg-yellow-600' :
              type === 'success' ? 'bg-secondary hover:bg-green-600' :
              'bg-primary hover:bg-primary-hover'
            }`}
          >
            {type === 'confirm' ? confirmText : 'Đóng'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;
