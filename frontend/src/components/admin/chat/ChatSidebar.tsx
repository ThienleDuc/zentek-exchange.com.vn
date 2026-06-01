import { Search, Users, User, Store, MessageCircle, MoreHorizontal, CheckSquare, Settings, Link2 } from 'lucide-react';
import { type Conversation } from '../../../services/chatAdmin.service';
import { chatService } from '../../../services/chat.service';
import { getUserFromStorage, isBuyer, isSeller } from '../../../utils/role.utils';
import dayjs from 'dayjs';
import { useState, useRef, useEffect } from 'react';

type FilterType = 'all' | 'individual' | 'group' | 'store';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  filter: FilterType;
  onChangeFilter: (f: FilterType) => void;
  searchQuery: string;
  onChangeSearch: (q: string) => void;
  onOpenCreateGroup: () => void;
  onOpenJoinGroup: () => void;
}

const ChatSidebar = ({
  conversations,
  activeChatId,
  onSelectChat,
  filter,
  onChangeFilter,
  searchQuery,
  onChangeSearch,
  onOpenCreateGroup,
  onOpenJoinGroup
}: ChatSidebarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [localJoined, setLocalJoined] = useState(false);
  
  // Lấy user từ localStorage (token đã lưu)
  const currentUser = getUserFromStorage();
  
  // Kiểm tra xem đã có conversation nào là nhóm cộng đồng tương ứng chưa
  const hasBuyerGroup = conversations.some(c => c.name === 'Cộng đồng người mua');
  const hasSellerGroup = conversations.some(c => c.name === 'Cộng đồng người bán');

  const showBuyerCommunity = isBuyer(currentUser) && !hasBuyerGroup && !localJoined;
  const showSellerCommunity = isSeller(currentUser) && !hasSellerGroup && !localJoined;

  const handleJoinCommunity = async () => {
    try {
      const res = await chatService.joinCommunity();
      if (res.success) {
        setLocalJoined(true);
        alert(res.message);
        // Reload trang để cập nhật lại danh sách bên trái một cách đơn giản
        window.location.reload();
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Có lỗi xảy ra khi tham gia');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'individual', label: 'Cá nhân' },
    { value: 'group', label: 'Nhóm' },
    { value: 'store', label: 'Cửa hàng' },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'group': return <Users size={18} />;
      case 'store': return <Store size={18} />;
      default: return <User size={18} />;
    }
  };

  const formatTime = (time: string) => {
    const d = dayjs(time);
    if (d.isSame(dayjs(), 'day')) return d.format('HH:mm');
    return d.format('DD/MM');
  };

  return (
    <div className="w-1/3 min-w-[320px] max-w-[400px] bg-surface border-r border-border-default flex flex-col h-full">
      {/* Header / Search */}
      <div className="p-4 border-b border-border-default space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
            <MessageCircle className="text-primary" /> Tin nhắn
          </h2>
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-text-muted hover:text-text-main hover:bg-surface-hover rounded-lg transition-colors"
              title="Tùy chọn"
            >
              <MoreHorizontal size={18} />
            </button>
            
            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface border border-border-default rounded-xl shadow-lg py-2 z-10 transition-all origin-top-right">
                <button 
                  onClick={() => {
                    onOpenCreateGroup();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-surface-hover flex items-center gap-3 text-sm text-text-main transition-colors"
                >
                  <Users size={16} className="text-primary" />
                  <span>Tạo nhóm trò chuyện</span>
                </button>
                <button 
                  onClick={() => {
                    onOpenJoinGroup();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-surface-hover flex items-center gap-3 text-sm text-text-main transition-colors"
                >
                  <Link2 size={16} className="text-primary" />
                  <span>Tham gia nhóm bằng link</span>
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-surface-hover flex items-center gap-3 text-sm text-text-main transition-colors opacity-70">
                  <CheckSquare size={16} className="text-success" />
                  <span>Đánh dấu tất cả đã đọc</span>
                </button>
                <div className="h-px bg-border-default my-1"></div>
                <button className="w-full text-left px-4 py-2 hover:bg-surface-hover flex items-center gap-3 text-sm text-text-main transition-colors opacity-70">
                  <Settings size={16} className="text-text-muted" />
                  <span>Cài đặt tin nhắn</span>
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            className="w-full bg-background pl-9 pr-4 py-2 rounded-lg text-sm border border-border-default focus:outline-none focus:border-primary"
            value={searchQuery}
            onChange={(e) => onChangeSearch(e.target.value)}
          />
        </div>
        
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => onChangeFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f.value
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'bg-background text-text-muted hover:bg-surface-hover border border-border-default'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {/* 
          TODO: [GHI CHÚ XÓA] ĐOẠN CODE XEM TRƯỚC GỢI Ý THAM GIA CỘNG ĐỒNG
          - Admin: CHỈ XEM ĐỂ KIỂM TRA UI, SAU KHI XEM XONG HÃY XÓA ĐOẠN NÀY ĐI.
          - Copy sang ChatSidebar của Buyer/Seller tương ứng.
          - Logic hiển thị: Kiểm tra Role và chưa tham gia thì hiển thị.
        */}
        {showBuyerCommunity && (
          <div
            onClick={handleJoinCommunity}
            className="flex items-center gap-3 p-4 cursor-pointer border-b border-border-default/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 border-l-4 border-l-blue-500 transition-colors group"
          >
            <div className="relative w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform border border-blue-200 dark:border-blue-800">
              <Users size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-sm truncate text-blue-700 dark:text-blue-400">
                  Cộng đồng Người Mua
                </h3>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full border border-blue-200">Gợi ý</span>
              </div>
              <p className="text-xs truncate text-text-muted font-medium">
                Nhấn vào đây để tham gia ngay!
              </p>
            </div>
          </div>
        )}

        {showSellerCommunity && (
          <div
            onClick={handleJoinCommunity}
            className="flex items-center gap-3 p-4 cursor-pointer border-b border-border-default/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 border-l-4 border-l-emerald-500 transition-colors group"
          >
            <div className="relative w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform border border-emerald-200 dark:border-emerald-800">
              <Store size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-sm truncate text-emerald-700 dark:text-emerald-400">
                  Cộng đồng Người Bán
                </h3>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200">Gợi ý</span>
              </div>
              <p className="text-xs truncate text-text-muted font-medium">
                Tham gia để kết nối với các Shop khác!
              </p>
            </div>
          </div>
        )}
        {/* END TODO */}

        {conversations.length === 0 ? (
          <div className="p-6 text-center text-text-muted text-sm">
            Không tìm thấy cuộc trò chuyện nào.
          </div>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => onSelectChat(conv.id)}
              className={`flex items-center gap-3 p-4 cursor-pointer border-b border-border-default/50 transition-colors ${
                activeChatId === conv.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-surface-hover border-l-4 border-l-transparent'
              }`}
            >
              <div className="relative w-12 h-12 rounded-full bg-background flex items-center justify-center shrink-0 border border-border-default text-text-muted">
                {conv.avatar ? (
                  <img src={conv.avatar} alt={conv.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getIcon(conv.type)
                )}
                {/* Unread badge logic could go here */}
                {conv.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-surface">
                    {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className={`font-semibold text-sm truncate ${conv.unreadCount > 0 ? 'text-text-main' : 'text-text-main/90'}`}>
                    {conv.name}
                  </h3>
                  <span className="text-xs text-text-muted ml-2 shrink-0">
                    {formatTime(conv.lastMessageTime)}
                  </span>
                </div>
                <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-bold text-text-main' : 'text-text-muted'}`}>
                  {conv.lastMessage || 'Chưa có tin nhắn'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
