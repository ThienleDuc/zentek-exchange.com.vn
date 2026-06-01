import React, { useState } from 'react';
import { X, Link2 } from 'lucide-react';
import { chatService } from '../../../services/chat.service';

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (groupId: string) => void;
}

const JoinGroupModal: React.FC<JoinGroupModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [inviteLink, setInviteLink] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleJoin = async () => {
    if (!inviteLink.trim()) return;
    setIsJoining(true);
    setError('');

    try {
      // Parse groupId from the invite link
      // Link format: http://domain/join-group/uuid
      // or it might just be the uuid itself
      let groupId = inviteLink.trim();
      const match = inviteLink.match(/\/join-group\/([a-fA-F0-9-]{36})/);
      if (match) {
        groupId = match[1];
      }

      // Basic UUID validation
      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      if (!uuidRegex.test(groupId)) {
        throw new Error('Đường dẫn hoặc mã nhóm không hợp lệ');
      }

      const res = await chatService.joinGroup(groupId);
      if (res.success) {
        alert(res.message);
        onSuccess(groupId);
        onClose();
      } else {
        setError(res.message || 'Không thể tham gia nhóm.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || 'Đường dẫn hoặc mã nhóm không hợp lệ.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md flex flex-col shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-border-default">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-default shrink-0">
          <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" /> Tham gia nhóm bằng link
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-text-muted hover:bg-surface-hover rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-text-muted">
            Nhập đường dẫn mời tham gia nhóm (ví dụ: <code className="bg-surface-hover px-1.5 py-0.5 rounded text-primary">/join-group/uuid</code>) hoặc mã nhóm (UUID) để tham gia.
          </p>
          <div className="space-y-2">
            <input 
              type="text" 
              placeholder="Dán đường dẫn mời hoặc mã nhóm..." 
              value={inviteLink} 
              onChange={(e) => {
                setInviteLink(e.target.value);
                setError('');
              }}
              className="w-full bg-background border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-main focus:outline-none focus:border-primary transition-colors"
            />
            {error && (
              <p className="text-xs text-danger font-medium">{error}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-default bg-surface flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium text-text-main hover:bg-background border border-border-default rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={handleJoin}
            disabled={!inviteLink.trim() || isJoining}
            className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isJoining ? 'Đang xử lý...' : 'Tham gia'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinGroupModal;
