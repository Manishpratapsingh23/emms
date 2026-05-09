/**
 * WorkWise AI — AI Agent Service
 * Frontend API service for the AI HR Agent (Admin only)
 */

import api from './api';

export const aiAgentService = {
  /**
   * Send a message to the AI HR Agent
   */
  sendMessage: async (message, pendingConfirmation = null) => {
    const response = await api.post('/admin/ai-agent', {
      message,
      pendingConfirmation,
    });
    return response.data;
  },

  /**
   * Confirm a destructive action
   */
  confirmAction: async (tool, args) => {
    const response = await api.post('/admin/ai-agent/confirm', {
      tool,
      args,
    });
    return response.data;
  },

  /**
   * Get chat history
   */
  getHistory: async (limit = 50) => {
    const response = await api.get(`/admin/ai-agent/history?limit=${limit}`);
    return response.data;
  },

  /**
   * Clear chat history
   */
  clearHistory: async () => {
    const response = await api.delete('/admin/ai-agent/history');
    return response.data;
  },

  /**
   * Get audit logs
   */
  getAuditLogs: async (limit = 50) => {
    const response = await api.get(`/admin/ai-agent/audit?limit=${limit}`);
    return response.data;
  },
};
