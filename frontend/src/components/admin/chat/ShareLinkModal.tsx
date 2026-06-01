import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: string;
}

const ShareLinkModal: React.FC<ShareLinkModalProps> = ({ isOpen, onClose, link }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md flex flex-col shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-default shrink-0">
          <h2 className="text-lg font-bold text-text-main">Chia sẻ đường dẫn tham gia nhóm</h2>
          <button 
            onClick={onClose}
            className="p-2 text-text-muted hover:bg-surface-hover rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-text-muted mb-4">
            Bất kỳ ai có đường dẫn này đều có thể xem và tham gia vào nhóm trò chuyện.
          </p>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              readOnly 
              value={link} 
              className="flex-1 bg-background border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-main focus:outline-none focus:border-primary transition-colors"
            />
            <button 
              onClick={handleCopy}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-colors ${
                copied ? 'bg-green-100 text-green-600' : 'bg-primary text-white hover:bg-primary-hover'
              }`}
              title="Sao chép"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareLinkModal;
