import { useState, useRef, useEffect } from 'react';
import { chatService } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { FiSend, FiX, FiMessageCircle, FiCpu, FiUser, FiBookOpen } from 'react-icons/fi';

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuth();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hello **${user?.name || 'there'}**! 👋\n\nI'm the **WorkWise AI Assistant**. I can help you with:\n\n• 📋 **Company Policies** — Leave, attendance, HR rules\n• 💰 **Payroll** — Salary structure, deductions, reimbursements\n• 📅 **Leave Information** — Your balance, how to apply\n• 🏢 **Onboarding** — Getting started at WorkWise\n• 📖 **General HR Questions**\n\nHow can I help you today?`,
        timestamp: new Date().toISOString(),
      }]);
      setHasGreeted(true);
    }
  }, [isOpen, hasGreeted, user]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(trimmed);
      
      const botMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        sources: response.sources,
        timestamp: response.timestamp,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Something went wrong. Please try again.';
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ ${errorMsg}`,
        isError: true,
        timestamp: new Date().toISOString(),
      }]);
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

  const formatMessage = (content) => {
    if (!content) return '';
    // Simple markdown: bold, bullet points, headers
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^### (.*$)/gm, '<h4 class="font-semibold text-sm mt-2 mb-1">$1</h4>')
      .replace(/^## (.*$)/gm, '<h3 class="font-semibold text-base mt-2 mb-1">$1</h3>')
      .replace(/^# (.*$)/gm, '<h2 class="font-bold text-lg mt-2 mb-1">$1</h2>')
      .replace(/^[•\-]\s(.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <>
      {/* Floating Chat Bubble */}
      <button
        id="ai-chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 ${
          isOpen 
            ? 'bg-gray-600 hover:bg-gray-700 rotate-0' 
            : 'bg-gradient-to-br from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 ai-chat-pulse'
        }`}
        title={isOpen ? 'Close chat' : 'Ask WorkWise AI'}
      >
        {isOpen ? (
          <FiX size={24} className="text-white" />
        ) : (
          <FiMessageCircle size={24} className="text-white" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[540px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col animate-chat-open overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-4 flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <FiCpu size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-sm">WorkWise AI</h3>
              <p className="text-indigo-200 text-xs">
                {isLoading ? '● Thinking...' : '● Online — Ask me anything'}
              </p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 animate-chat-message ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-indigo-100 text-indigo-600'
                    : msg.isError
                    ? 'bg-red-100 text-red-600'
                    : 'bg-teal-100 text-teal-600'
                }`}>
                  {msg.role === 'user' ? <FiUser size={14} /> : <FiCpu size={14} />}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-md'
                      : msg.isError
                      ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-md'
                      : 'bg-white text-gray-700 border border-gray-200 rounded-bl-md shadow-sm'
                  }`}>
                    <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                  </div>

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.sources.slice(0, 3).map((source, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-medium border border-indigo-100"
                        >
                          <FiBookOpen size={10} />
                          {source.title.length > 30 ? source.title.slice(0, 30) + '...' : source.title}
                        </span>
                      ))}
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
              <div className="flex gap-2.5 animate-chat-message">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0">
                  <FiCpu size={14} />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5 items-center">
                    <div className="typing-dot" style={{ animationDelay: '0ms' }}></div>
                    <div className="typing-dot" style={{ animationDelay: '150ms' }}></div>
                    <div className="typing-dot" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-200 flex-shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about policies, leaves, payroll..."
                rows={1}
                className="flex-1 resize-none px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                style={{ maxHeight: '80px' }}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                  input.trim() && !isLoading
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <FiSend size={16} />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 text-center">
              Powered by WorkWise AI • Answers based on company knowledge base
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
