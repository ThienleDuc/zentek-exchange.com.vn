import api from './api';

export const uploadDocument = async (file: File): Promise<{ success: boolean; url?: string; message?: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Có lỗi xảy ra khi upload tài liệu'
    };
  }
};
