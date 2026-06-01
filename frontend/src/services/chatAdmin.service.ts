import api from './api';

export interface Conversation {
  id: string;
  name: string;
  type: 'individual' | 'group' | 'store';
  avatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface ChatMessageMedia {
  type: 'image' | 'video';
  url: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  senderAvatar?: string | null;
  isMe: boolean;
  isRead?: boolean;
  isRecalled?: boolean;
  media?: ChatMessageMedia[];
}

export const chatAdminService = {
  // Lấy danh sách cuộc trò chuyện theo bộ lọc
  getConversations: async (filter: 'all' | 'individual' | 'group' | 'store' = 'all') => {
    const response = await api.get<{ success: boolean; data: Conversation[] }>(`/admin/chats?filter=${filter}`);
    return response.data.data;
  },

  // Lấy chi tiết tin nhắn của một cuộc trò chuyện
  getMessages: async (conversationId: string) => {
    const response = await api.get<{ success: boolean; data: ChatMessage[] }>(`/admin/chats/${conversationId}/messages`);
    return response.data.data;
  },

  // Gửi tin nhắn mới
  sendMessage: async (conversationId: string, content: string, files?: File[]) => {
    const formData = new FormData();
    formData.append('content', content);
    if (files) {
      files.forEach(f => formData.append('files', f));
    }
    const response = await api.post<{ success: boolean; data: ChatMessage }>(`/admin/chats/${conversationId}/messages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  // Thu hồi tin nhắn
  recallMessage: async (conversationId: string, messageId: string) => {
    const response = await api.put<{ success: boolean; message: string }>(`/admin/chats/${conversationId}/messages/${messageId}/recall`);
    return response.data;
  },

  // Xóa tin nhắn vĩnh viễn (Hard Delete)
  deleteMessagePermanently: async (conversationId: string, messageId: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/admin/chats/${conversationId}/messages/${messageId}`);
    return response.data;
  },

  // Tạo nhóm mới
  createGroup: async (name: string, memberIds: string[]) => {
    const response = await api.post<{ success: boolean; data: Conversation }>(`/admin/chats/group`, { name, memberIds });
    return response.data.data;
  },

  // Xóa nhóm
  deleteGroup: async (groupId: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/admin/chats/groups/${groupId}`);
    return response.data;
  },

  // Thêm thành viên vào nhóm
  addMembersToGroup: async (groupId: string, memberIds: string[]) => {
    const response = await api.post<{ success: boolean; message: string }>(`/admin/chats/groups/${groupId}/members`, { memberIds });
    return response.data;
  }
};
