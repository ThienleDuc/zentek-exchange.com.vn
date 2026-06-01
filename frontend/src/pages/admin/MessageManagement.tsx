// import removed

import { useState, useEffect } from 'react';
import ChatSidebar from '../../components/admin/chat/ChatSidebar';
import ChatBox from '../../components/admin/chat/ChatBox';
import CreateGroupModal from '../../components/admin/chat/CreateGroupModal';
import JoinGroupModal from '../../components/admin/chat/JoinGroupModal';
import { chatAdminService, type Conversation, type ChatMessage } from '../../services/chatAdmin.service';

const MessageManagement = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'individual' | 'group' | 'store'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isJoinGroupModalOpen, setIsJoinGroupModalOpen] = useState(false);

  // Lấy danh sách trò chuyện
  const fetchConversations = async () => {
    try {
      const data = await chatAdminService.getConversations(filter);
      setConversations(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách trò chuyện:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Lấy tin nhắn khi chọn chat
  useEffect(() => {
    if (activeChatId) {
      const fetchMessages = async () => {
        setIsLoadingMessages(true);
        try {
          const data = await chatAdminService.getMessages(activeChatId);
          setMessages(data);
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
    <div className="h-screen flex overflow-hidden">
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
      />
      <ChatBox 
        activeConversation={activeConversation}
        messages={messages}
        onSendMessage={handleSendMessage}
        onRecallMessage={handleRecallMessage}
        onDeleteMessage={handleDeleteMessage}
        onDeleteGroup={handleDeleteGroup}
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
    </div>
  );
};

export default MessageManagement;
