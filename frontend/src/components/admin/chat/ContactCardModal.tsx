import { X, MessageCircle, Calendar, Shield, Mail, Phone, Store } from 'lucide-react';
import { chatService } from '../../../services/chat.service';
import { getUserAvatarUrl } from '../../../utils/image.utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: any | null;
  onContactCreated?: (conversationId: string) => void;
}

const ContactCardModal = ({ isOpen, onClose, user, onContactCreated }: Props) => {
  if (!isOpen || !user) return null;

  const handleContact = async () => {
    try {
      const res = await chatService.findOrCreatePrivateChat(user.userId);
      const convId = res.data?.conversationId;
      if (convId) {
        onContactCreated && onContactCreated(convId);
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return null;
    }
  };

  const getRoleLabel = (role: string | null) => {
    if (!role) return null;
    const config: Record<string, string> = {
      Admin: 'Quản trị viên',
      Seller: 'Người bán',
      Buyer: 'Người mua',
      Moderator: 'Kiểm duyệt viên',
    };
    return config[role] || role;
  };

  const createdAt = formatDate(user.createdAt);

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-250" 
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl w-full max-w-sm flex flex-col shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-border-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-default shrink-0">
          <h2 className="text-base font-bold text-text-main flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Thông tin danh thiếp
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-text-muted hover:bg-surface-hover rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full overflow-hidden bg-background border border-border-default flex items-center justify-center shadow-sm">
            {user.avatar ? (
              <img src={getUserAvatarUrl(user.avatar)} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-extrabold text-text-muted">
                {user.fullName?.charAt(0)?.toUpperCase()}
              </span>
            )}
          </div>

          {/* Name & Badges */}
          <h3 className="text-lg font-bold text-text-main mt-3 text-center leading-tight">
            {user.fullName}
          </h3>

          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {user.roleName && (
              <span className="bg-surface-hover text-text-muted border border-border-default text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {getRoleLabel(user.roleName)}
              </span>
            )}
            {user.storeName && (
              <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Store size={12} />
                {user.storeName}
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-border-default/60 my-4" />

          {/* Info Details List */}
          <div className="w-full space-y-3">
            {/* Phone */}
            <div className="flex items-center gap-3 py-2 border-b border-border-default/40 last:border-0">
              <div className="p-2 bg-surface-hover rounded-lg text-text-muted shrink-0">
                <Phone size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-text-muted block font-medium">SỐ ĐIỆN THOẠI</span>
                <span className="text-sm font-semibold text-text-main block truncate">
                  {user.phone || <span className="text-text-muted/40 font-normal italic">Chưa cập nhật</span>}
                </span>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 py-2 border-b border-border-default/40 last:border-0">
              <div className="p-2 bg-surface-hover rounded-lg text-text-muted shrink-0">
                <Mail size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-text-muted block font-medium">EMAIL</span>
                <span className="text-sm font-semibold text-text-main block truncate">
                  {user.email || <span className="text-text-muted/40 font-normal italic">Chưa cập nhật</span>}
                </span>
              </div>
            </div>

            {/* Joining Date */}
            {createdAt && (
              <div className="flex items-center gap-3 py-2 border-b border-border-default/40 last:border-0">
                <div className="p-2 bg-surface-hover rounded-lg text-text-muted shrink-0">
                  <Calendar size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-text-muted block font-medium">NGÀY THAM GIA</span>
                  <span className="text-sm font-semibold text-text-main block">
                    {createdAt}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-default bg-surface flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium text-text-main hover:bg-background border border-border-default rounded-xl transition-colors"
          >
            Đóng
          </button>
          <button 
            onClick={handleContact}
            className="px-6 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors flex items-center gap-1.5"
          >
            <MessageCircle size={16} />
            Nhắn tin
          </button>
        </div>
      </div>
    </div>
  );
};
export default ContactCardModal;
