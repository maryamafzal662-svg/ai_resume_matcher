import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ChatbotQueryPage = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState('jobseeker'); // default role
  const fullHeaderText = `Ask me anything about the website 🤖`;

  // ✅ Fetch user info & set role automatically
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/custom-user/');
        const name = res.data.username || res.data.email || 'User';
        setUserName(name);
        setRole(res.data.role || 'jobseeker'); // Auto set role from backend
        // ✅ Add greeting as first bot message
        setMessages([{ text: `Hi ${name}! How can I assist you today?👋`, type: 'bot' }]);
      } catch {
        setUserName('there');
        setRole('jobseeker');
        // ✅ Fallback greeting
        setMessages([{ text: `Hi there! How can I assist you today?👋`, type: 'bot' }]);
      }
    };
    fetchUser();
  }, []);

  // ✅ Send message to backend
  const handleSend = async () => {
    if (!query.trim()) return;
    const userMessage = { text: query, type: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setQuery('');
    setIsTyping(true);

    try {
      const response = await api.post('/chatbot/message/', { message: query, role: role });
      const botMessage = { text: response.data.bot, type: 'bot' };

      setTimeout(() => {
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
    } catch {
      const errorMessage = { text: '❌ Error: Unable to fetch response.', type: 'bot' };
      setMessages((prev) => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  return (
    <div className="d-flex flex-column vh-100 bg-light">
      {/* Header */}
      <header className="bg-white shadow-sm p-3 text-center border-bottom">
        <h4 className="m-0 fw-bold" style={{ color: '#001f3f', minHeight: '2.5rem' }}>
          {fullHeaderText}
        </h4>
      </header>

      {/* Chat Messages */}
      <div className="flex-grow-1 overflow-auto p-4 d-flex flex-column gap-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-3 shadow-sm w-75 ${
              msg.type === 'user'
                ? 'text-white align-self-end'
                : 'bg-white text-dark align-self-start border'
            }`}
            style={{
              backgroundColor: msg.type === 'user' ? '#001f3f' : '#ffffff',
              borderColor: msg.type === 'bot' ? '#ddd' : 'transparent',
              wordBreak: 'break-word',
            }}
          >
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div className="p-3 rounded-3 shadow-sm w-75 bg-white text-muted align-self-start border">
            Typing...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-top d-flex">
        <input
          type="text"
          className="form-control me-2 rounded-pill px-4 py-2"
          placeholder="Type your message..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          className="px-4 rounded-pill text-white border-0"
          style={{ backgroundColor: '#001f3f' }}
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatbotQueryPage;
