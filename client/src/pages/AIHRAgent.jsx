import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiAgentService } from '../services/aiAgentService';
import toast from 'react-hot-toast';
import {
  FiSend, FiCpu, FiUser, FiActivity, FiCheckCircle, FiXCircle,
  FiAlertTriangle, FiClock, FiChevronRight, FiFileText, FiZap,
  FiShield, FiTrash2, FiRefreshCw
} from 'react-icons/fi';

/**
 * AI HR Agent — Full-page enterprise admin console
 * Admin-only intelligent HR automation interface with Groq tool-calling
 */

const SUGGESTED_COMMANDS = [
  { label: '📋 Approve Leaves', command: 'Approve all pending leave requests' },
  { label: '💰 Generate Payroll', command: 'Generate payroll for this month' },
  { label: '👤 Add Employee', command: 'Add a new employee' },
  { label: '🏢 Create Department', command: 'Create a new department' },
  { label: '📢 Announcement', command: 'Send a company announcement' },
  { label: '📅 Schedule Meeting', command: 'Schedule an HR meeting' },
  { label: '📊 Attendance Report', command: 'Show attendance analytics for this month' },
  { label: '📈 Employee Report', command: 'Generate employee summary report' },
];

const AIHRAgent = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await aiAgentService.getHistory(50);
        if (data.history && data.history.length > 0) {
          const loadedMessages = [];
          data.history.forEach((item, index) => {
            loadedMessages.push({
              id: `history-user-${index}`,
              role: 'user',
              content: item.message,
              timestamp: item.timestamp,
            });
            loadedMessages.push({
              id: `history-agent-${index}`,
              role: 'assistant',
              content: item.response,
              toolsUsed: item.toolsUsed || [],
              type: 'response',
              timestamp: item.timestamp,
            });
          });
          setMessages(loadedMessages);
        } else {
          setMessages([{
            id: 'welcome',
            role: 'assistant',
            content: `Welcome back, **${user?.name || 'Admin'}**! 👋\n\nI'm the **WorkWise AI HR Agent** — your intelligent HR automation assistant. I can execute real actions on your behalf:\n\n• **Leave Management** — Approve or reject leave requests\n• **Payroll** — Generate monthly payroll for all employees\n• **Employee Management** — Add or deactivate employees\n• **Departments** — Create new departments\n• **Meetings** — Schedule HR meetings\n• **Announcements** — Publish company announcements\n• **Analytics** — Generate attendance & HR reports\n• **Policies** — Search company knowledge base\n\nTry a command below or type your own instruction.`,
            timestamp: new Date().toISOString(),
            type: 'welcome',
          }]);
        }
      } catch (error) {
        console.error("Failed to load history", error);
      }
    };
    fetchHistory();
  }, [user]);

  // Load audit logs
  const loadAuditLogs = useCallback(async () => {
    try {
      const data = await aiAgentService.getAuditLogs(30);
      setAuditLogs(data.logs || []);
    } catch {
      // Silent fail for audit logs
    }
  }, []);

  useEffect(() => {
    if (showAudit) loadAuditLogs();
  }, [showAudit, loadAuditLogs]);

  // Send message
  const handleSend = async (customMessage = null) => {
    const msg = customMessage || input.trim();
    if (!msg || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: msg,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiAgentService.sendMessage(msg);

      const agentMessage = {
        id: `agent-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        actions: response.actions || [],
        toolsUsed: response.tools_used || [],
        timestamp: response.timestamp,
        type: response.confirmation_needed ? 'confirmation' : 'response',
      };

      if (response.confirmation_needed) {
        setPendingConfirmation(response.confirmation_needed);
      }

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Agent service unavailable. Please try again.';
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ ${errorMsg}`,
        type: 'error',
        timestamp: new Date().toISOString(),
      }]);
      toast.error('Agent request failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm destructive action
  const handleConfirm = async (confirmed) => {
    if (!pendingConfirmation) return;

    if (!confirmed) {
      setPendingConfirmation(null);
      setMessages(prev => [...prev, {
        id: `cancel-${Date.now()}`,
        role: 'assistant',
        content: '❌ Action cancelled by admin.',
        type: 'cancelled',
        timestamp: new Date().toISOString(),
      }]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await aiAgentService.confirmAction(
        pendingConfirmation.tool,
        pendingConfirmation.args
      );

      setMessages(prev => [...prev, {
        id: `confirmed-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        actions: response.actions || [],
        toolsUsed: response.tools_used || [],
        type: 'response',
        timestamp: response.timestamp,
      }]);

      setPendingConfirmation(null);
      toast.success('Action executed successfully');
    } catch (error) {
      toast.error('Confirmation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to clear the AI agent chat history? This action cannot be undone.")) {
      try {
        await aiAgentService.clearHistory();
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: `History cleared. How can I help you today?`,
          timestamp: new Date().toISOString(),
          type: 'welcome',
        }]);
        toast.success("Chat history cleared");
      } catch (error) {
        toast.error("Failed to clear chat history");
      }
    }
  };

  // Simple markdown renderer
  const renderMarkdown = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^### (.*$)/gm, '<h4 class="font-semibold text-sm mt-2 mb-1">$1</h4>')
      .replace(/^## (.*$)/gm, '<h3 class="font-semibold text-base mt-3 mb-1">$1</h3>')
      .replace(/^# (.*$)/gm, '<h2 class="font-bold text-lg mt-3 mb-1">$1</h2>')
      .replace(/^[•\-]\s(.*$)/gm, '<li class="ml-4 list-disc text-sm">$1</li>')
      .replace(/\n/g, '<br/>');
  };

  // Action result card
  const ActionCard = ({ action }) => {
    const isSuccess = action.success;
    return (
      <div className={`mt-2 rounded-xl border px-4 py-3 text-sm ${
        isSuccess
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <div className="flex items-center gap-2 font-semibold mb-1">
          {isSuccess ? <FiCheckCircle size={16} /> : <FiXCircle size={16} />}
          <span className="capitalize">{(action.action || '').replace(/_/g, ' ')}</span>
        </div>
        <p className="text-xs opacity-80">{action.message}</p>
        {action.details && action.details.length > 0 && (
          <div className="mt-2 space-y-1">
            {action.details.slice(0, 5).map((d, i) => (
              <div key={i} className="text-xs bg-white/60 rounded px-2 py-1">
                {Object.entries(d).map(([k, v]) => (
                  <span key={k} className="mr-3"><strong className="capitalize">{k}:</strong> {String(v)}</span>
                ))}
              </div>
            ))}
            {action.details.length > 5 && (
              <p className="text-xs opacity-60">... and {action.details.length - 5} more</p>
            )}
          </div>
        )}
        {action.report && (
          <div className="mt-2 bg-white/60 rounded-lg p-3 space-y-1">
            {Object.entries(action.report).filter(([k]) => k !== 'type' && k !== 'generated_at').map(([k, v]) => (
              <div key={k} className="text-xs flex justify-between">
                <span className="capitalize font-medium">{k.replace(/_/g, ' ')}:</span>
                <span>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
              </div>
            ))}
          </div>
        )}
        {action.analytics && (
          <div className="mt-2 bg-white/60 rounded-lg p-3 space-y-1">
            {Object.entries(action.analytics).filter(([k]) => k !== 'top_performers').map(([k, v]) => (
              <div key={k} className="text-xs flex justify-between">
                <span className="capitalize font-medium">{k.replace(/_/g, ' ')}:</span>
                <span>{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-4 animate-fade-in">
      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-lg">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
              <FiZap size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg flex items-center gap-2">
                AI HR Agent
                <span className="text-[10px] font-medium bg-white/20 rounded-full px-2 py-0.5 uppercase tracking-wider">Admin</span>
              </h1>
              <p className="text-indigo-200 text-xs">
                {isLoading ? '⚡ Processing your request...' : '● Online — Ready for HR automation'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-lg transition-all text-sm flex items-center gap-1.5 bg-white/15 text-white hover:bg-red-500/20 hover:text-red-100"
              title="Clear Chat History"
            >
              <FiTrash2 size={16} />
              <span className="hidden md:inline text-xs font-medium">Clear Chat</span>
            </button>
            <button
              onClick={() => setShowAudit(!showAudit)}
              className={`p-2 rounded-lg transition-all text-sm flex items-center gap-1.5 ${
                showAudit ? 'bg-white text-indigo-700' : 'bg-white/15 text-white hover:bg-white/25'
              }`}
              title="Toggle Audit Logs"
            >
              <FiShield size={16} />
              <span className="hidden md:inline text-xs font-medium">Audit Log</span>
            </button>
          </div>
        </div>

        {/* Suggested Commands */}
        {messages.length <= 1 && (
          <div className="px-4 py-3 bg-gradient-to-b from-indigo-50 to-transparent border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Quick Commands</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_COMMANDS.map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(cmd.command)}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-full border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all shadow-sm disabled:opacity-50"
                >
                  {cmd.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 animate-chat-message ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-100 text-indigo-600'
                  : msg.type === 'error'
                  ? 'bg-red-100 text-red-600'
                  : msg.type === 'confirmation'
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-gradient-to-br from-teal-400 to-teal-600 text-white'
              }`}>
                {msg.role === 'user' ? <FiUser size={16} /> : <FiCpu size={16} />}
              </div>

              {/* Message */}
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-md'
                    : msg.type === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-md'
                    : msg.type === 'confirmation'
                    ? 'bg-amber-50 text-amber-900 border border-amber-200 rounded-bl-md'
                    : 'bg-white text-gray-700 border border-gray-200 rounded-bl-md'
                }`}>
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                </div>

                {/* Action Cards */}
                {msg.actions && msg.actions.length > 0 && msg.actions.map((action, i) => (
                  <ActionCard key={i} action={action} />
                ))}

                {/* Tools Used Badge */}
                {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {msg.toolsUsed.map((tool, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-medium border border-indigo-100">
                        <FiActivity size={10} />
                        {tool.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}

                {/* Confirmation Buttons */}
                {msg.type === 'confirmation' && pendingConfirmation && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleConfirm(true)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <FiCheckCircle size={14} /> Confirm & Execute
                    </button>
                    <button
                      onClick={() => handleConfirm(false)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <FiXCircle size={14} /> Cancel
                    </button>
                  </div>
                )}

                {/* Timestamp */}
                <p className={`text-[10px] mt-1 ${
                  msg.role === 'user' ? 'text-right text-gray-400' : 'text-gray-400'
                }`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 animate-chat-message">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <FiCpu size={16} />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="typing-dot" style={{ animationDelay: '0ms' }}></div>
                    <div className="typing-dot" style={{ animationDelay: '150ms' }}></div>
                    <div className="typing-dot" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-xs text-gray-400 ml-2">Processing with AI...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type an HR command... e.g., 'Approve all pending sick leaves'"
              rows={1}
              className="flex-1 resize-none px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
              style={{ maxHeight: '100px' }}
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                input.trim() && !isLoading
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <FiSend size={18} />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[10px] text-gray-400">
              🔒 Admin Only • All actions are logged and audited
            </p>
            <p className="text-[10px] text-gray-400">
              Powered by WorkWise AI Agent • Groq LLM
            </p>
          </div>
        </div>
      </div>

      {/* Audit Log Sidebar */}
      {showAudit && (
        <div className="w-80 flex-shrink-0 bg-white rounded-2xl border border-gray-200 shadow-lg flex flex-col overflow-hidden animate-slide-in">
          <div className="px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <FiShield size={16} className="text-white" />
              <h3 className="text-white font-semibold text-sm">Audit Trail</h3>
            </div>
            <button
              onClick={loadAuditLogs}
              className="text-white/70 hover:text-white transition-colors p-1"
              title="Refresh"
            >
              <FiRefreshCw size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No audit logs yet</p>
            ) : (
              auditLogs.map((log, i) => (
                <div key={i} className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-2 h-2 rounded-full ${
                      log.status === 'success' ? 'bg-emerald-500' :
                      log.status === 'denied' ? 'bg-red-500' :
                      log.status === 'pending_confirmation' ? 'bg-amber-500' :
                      'bg-gray-400'
                    }`}></span>
                    <span className="font-semibold text-gray-700 capitalize">
                      {(log.action || '').replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-gray-500 text-[10px] line-clamp-2">{log.resultMessage}</p>
                  <p className="text-gray-400 text-[10px] mt-1">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIHRAgent;
