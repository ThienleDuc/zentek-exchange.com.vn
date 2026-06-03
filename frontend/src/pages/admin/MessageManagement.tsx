import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ChatSidebar from '../../components/admin/chat/ChatSidebar';
import ChatBox from '../../components/admin/chat/ChatBox';
import CreateGroupModal from '../../components/admin/chat/CreateGroupModal';
import JoinGroupModal from '../../components/admin/chat/JoinGroupModal';
import ContactSearchModal from '../../components/admin/chat/ContactSearchModal';
import { chatAdminService, type Conversation, type ChatMessage } from '../../services/chatAdmin.service';
import { chatService } from '../../services/chat.service';
import { getUserFromStorage, isBuyer } from '../../utils/role.utils';

const MessageManagement = () => {
  const location = useLocation();
  const isFullScreen = location.pathname.includes('/admin/messages') || location.pathname.includes('/seller/chat');
  const heightClass = isFullScreen ? 'h-screen' : 'h-full';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'individual' | 'group' | 'store'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isJoinGroupModalOpen, setIsJoinGroupModalOpen] = useState(false);
  const [isContactSearchOpen, setIsContactSearchOpen] = useState(false);

  // Lấy danh sách trò chuyện
  const fetchConversations = async () => {
    try {
      const data = await chatAdminService.getConversations(filter);
      setConversations(data);
      return data;
    } catch (error) {
      console.error('Lỗi khi tải danh sách trò chuyện:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Tự động mở/tham gia cộng đồng khi có query ?community=true, ?store=TenCuaHang hoặc ?chatId=...
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const openCommunity = queryParams.get('community') === 'true';
    const storeName = queryParams.get('store');
    const chatId = queryParams.get('chatId');
    
    if (chatId) {
      const handleOpenChat = async () => {
        const currentConversations = await fetchConversations();
        const found = currentConversations.find(c => c.id === chatId);
        if (found) {
          setActiveChatId(chatId);
        } else {
          // If not found in current list, still set it so we can load messages
          setActiveChatId(chatId);
        }
      };
      handleOpenChat();
    } else if (openCommunity) {
      const handleAutoJoinAndOpen = async () => {
        const currentConversations = await fetchConversations();
        
        // Tìm cuộc trò chuyện cộng đồng người mua
        const buyerGroup = currentConversations.find(c => 
          c.name?.toLowerCase().includes('cộng đồng người mua')
        );

        if (buyerGroup) {
          setActiveChatId(buyerGroup.id);
        } else {
          // Chưa tham gia, tự động tham gia nếu là Buyer
          const user = getUserFromStorage();
          if (isBuyer(user)) {
            try {
              const res = await chatService.joinCommunity();
              if (res.success) {
                const updatedConversations = await fetchConversations();
                const newBuyerGroup = updatedConversations.find(c => 
                  c.name?.toLowerCase().includes('cộng đồng người mua')
                );
                if (newBuyerGroup) {
                  setActiveChatId(newBuyerGroup.id);
                }
              }
            } catch (err) {
              console.error('Lỗi khi tự động tham gia cộng đồng:', err);
            }
          }
        }
      };
      
      handleAutoJoinAndOpen();
    } else if (storeName) {
      const handleOpenStoreChat = async () => {
        const currentConversations = await fetchConversations();
        // Tìm cuộc trò chuyện với cửa hàng có tên khớp hoặc chứa storeName
        const storeChat = currentConversations.find(c => 
          c.name?.toLowerCase().includes(storeName.toLowerCase())
        );
        if (storeChat) {
          setActiveChatId(storeChat.id);
        } else {
          console.log(`Không tìm thấy cuộc trò chuyện với cửa hàng: ${storeName}`);
        }
      };
      handleOpenStoreChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Lấy tin nhắn khi chọn chat
  useEffect(() => {
    if (activeChatId) {
      const fetchMessages = async () => {
        setIsLoadingMessages(true);
        try {
          const data = await chatAdminService.getMessages(activeChatId);
          setMessages(data);
          // Re-fetch conversations to update unread count on sidebar list in place
          fetchConversations();
          // Dispatch custom event to notify Header and main sidebar icons to refresh badges
          window.dispatchEvent(new CustomEvent('chat-updated'));
        } catch (error) {
          console.error('Lỗi khi tải tin nhắn:', error);
        } finally {
          setIsLoadingMessages(false);
        }
      };
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [activeChatId]);

  const handleSendMessage = async (content: string, files?: File[]) => {
    if (!activeChatId) return;
    try {
      const newMsg = await chatAdminService.sendMessage(activeChatId, content, files);
      setMessages(prev => [...prev, newMsg]);
      // Cập nhật lại danh sách bên trái để đẩy chat lên đầu
      fetchConversations();
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
    }
  };

  const handleRecallMessage = async (messageId: string) => {
    if (!activeChatId) return;
    try {
      await chatAdminService.recallMessage(activeChatId, messageId);
      // Cập nhật state nội bộ
      setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, isRecalled: true } : msg));
    } catch (error) {
      console.error('Lỗi khi thu hồi tin nhắn:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!activeChatId) return;
    try {
      await chatAdminService.deleteMessagePermanently(activeChatId, messageId);
      // Cập nhật state nội bộ để xóa hoàn toàn khỏi giao diện
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Lỗi khi xóa tin nhắn vĩnh viễn:', error);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await chatAdminService.deleteGroup(groupId);
      // Khi xóa nhóm xong, bỏ chọn chat hiện tại và tải lại danh sách
      setActiveChatId(null);
      fetchConversations();
    } catch (error) {
      console.error('Lỗi khi xóa nhóm:', error);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeConversation = conversations.find(c => c.id === activeChatId) || null;

  return (
    <div className={`${heightClass} w-full flex overflow-hidden`}>
      <ChatSidebar 
        conversations={filteredConversations}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        filter={filter}
        onChangeFilter={setFilter}
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        onOpenCreateGroup={() => setIsCreateGroupModalOpen(true)}
        onOpenJoinGroup={() => setIsJoinGroupModalOpen(true)}
        onOpenContactSearch={() => setIsContactSearchOpen(true)}
      />
      <ChatBox 
        activeConversation={activeConversation}
        messages={messages}
        onSendMessage={handleSendMessage}
        onRecallMessage={handleRecallMessage}
        onDeleteMessage={handleDeleteMessage}
        onDeleteGroup={handleDeleteGroup}
        onOpenConversation={(id) => {
          setActiveChatId(id);
          fetchConversations();
        }}
        isLoading={isLoadingMessages}
      />
      <CreateGroupModal 
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onSuccess={() => {
          fetchConversations();
          // Tuỳ chọn: có thể setActiveChatId(idMoi) nếu API trả về, nhưng hàm onSuccess() hiện tại không trả tham số.
        }}
      />
      <JoinGroupModal
        isOpen={isJoinGroupModalOpen}
        onClose={() => setIsJoinGroupModalOpen(false)}
        onSuccess={(groupId) => {
          fetchConversations();
          setActiveChatId(groupId);
        }}
      />
      <ContactSearchModal
        isOpen={isContactSearchOpen}
        onClose={() => setIsContactSearchOpen(false)}
        onContactCreated={(convId: string) => { setActiveChatId(convId); fetchConversations(); setIsContactSearchOpen(false); }}
      />
    </div>
  );
};

export default MessageManagement;
