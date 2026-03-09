import React, { useState, useRef, useEffect } from 'react';
import { postGenerate } from './api/client';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { Menu, Send, User, Bot, Loader2, Plus, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const getResponseContent = (data: any): string => {
    if (typeof data === 'string') return data;
    if (data?.response) return data.response;
    if (data?.message) return data.message;
    if (data?.text) return data.text;
    if (data?.answer) return data.answer;

    // Fallback block for generic JSON response
    return "```json\n" + JSON.stringify(data, null, 2) + "\n```";
  };

  const submit = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const assistantMessage: Message = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, assistantMessage]);

      const onProgress = (text: string) => {
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], content: text };
          return newMessages;
        });
      };

      await postGenerate(userMessage.content, onProgress);
    } catch (error: any) {
      const errorMessage = error?.message || 'Something went wrong. Please try again.';
      setMessages(prev => {
        const newMessages = [...prev];
        const last = newMessages[newMessages.length - 1];
        if (last.content === '') {
          last.content = `**Error:** ${errorMessage}`;
        } else {
          newMessages.push({ role: 'assistant', content: `**Error:** ${errorMessage}` });
        }
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="brand" onClick={() => setIsSidebarOpen(false)}>
            <Sparkles size={24} className="brand-icon" />
            <span className="brand-text">AI Platform</span>
          </div>
          <button className="icon-btn mobile-close" onClick={() => setIsSidebarOpen(false)}>
            <Menu size={20} />
          </button>
        </div>

        <button className="new-chat-btn" onClick={() => { setMessages([]); setInput(''); }}>
          <Plus size={16} />
          <span>New Chat</span>
        </button>

        <div className="sidebar-footer">
          <User size={16} />
          <span>Settings</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="top-bar">
          <button className="menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu size={24} />
          </button>
          <h2 className="current-tab-title">AI Assistant</h2>
        </div>

        <div className="chat-container">
          {messages.length === 0 ? (
            <div className="empty-state">
              <Sparkles size={48} className="empty-icon" />
              <h1>How can I help you today?</h1>
              <p>Ask me anything - coding, general questions, or creative tasks.</p>
            </div>
          ) : (
            <div className="messages-area">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message-row ${msg.role}`}>
                  <div className="message-avatar">
                    {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className="message-content">
                    {msg.role === 'user' ? (
                      <div className="user-text">{msg.content}</div>
                    ) : (
                      <MarkdownRenderer content={msg.content} />
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="message-row assistant">
                  <div className="message-avatar">
                    <Bot size={20} />
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <Loader2 className="spinner" size={18} />
                      Thinking...
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              rows={1}
            />
            <button
              className={`send-btn ${input.trim() && !loading ? 'active' : ''}`}
              onClick={submit}
              disabled={!input.trim() || loading}
            >
              <Send size={18} />
            </button>
          </div>
          <p className="input-hint">AI can make mistakes. Consider verifying important information.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
