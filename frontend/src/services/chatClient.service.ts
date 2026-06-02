import api from './api';

export interface PrivateChatCheckResult {
  exists: boolean;
  conversationId: string | null;
}

export const chatClientService = {
  // Check if a private chat exists with otherUserId
  checkPrivateChatExists: async (otherUserId: string) => {
    const response = await api.get<{ success: boolean; data: PrivateChatCheckResult }>(`/chats/private-exists/${otherUserId}`);
    return response.data;
  },

  // Create a new private chat with otherUserId
  createPrivateChat: async (otherUserId: string) => {
    const response = await api.post<{ success: boolean; message: string; data: { conversationId: string } }>('/chats/private-create', {
      otherUserId
    });
    return response.data;
  }
};

export default chatClientService;
