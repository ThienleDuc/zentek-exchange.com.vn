import api from './api';

export const chatService = {
  // Tham gia nhóm cộng đồng
  joinCommunity: async () => {
    const response = await api.post<{ success: boolean; message: string; data: { groupId: string } }>('/chats/join-community');
    return response.data;
  },

  // Tham gia nhóm bằng ID/link
  joinGroup: async (groupId: string) => {
    const response = await api.post<{ success: boolean; message: string; data: { groupId: string } }>('/chats/join-group', { groupId });
    return response.data;
  }
};
