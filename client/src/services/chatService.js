import api from './api';

export const chatService = {
  sendMessage: async (message) => {
    const response = await api.post('/chat', { message });
    return response.data;
  },

  reloadKnowledgeBase: async () => {
    const response = await api.post('/chat/reload-kb');
    return response.data;
  },
};
