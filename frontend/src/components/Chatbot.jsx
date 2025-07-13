import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X } from 'lucide-react';
import axios from 'axios';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi there! How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const chatRef = useRef(null);
  const API_URL = import.meta.env.VITE_AI_BACKEND_API_URL;
  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const res = await axios.post(`${API_URL}/chat`, {
  message: input,
});

      const botReply = { sender: 'bot', text: res.data.reply };
      setMessages(prev => [...prev, botReply]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', text: "Something went wrong." }]);
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="w-90 h-[40rem] bg-white shadow-xl rounded-xl border border-gray-300 flex flex-col">
          <div className="flex items-center justify-between bg-blue-600 text-white px-4 py-2 rounded-t-xl">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <p className="font-semibold">HealthBot</p>
            </div>
            <button onClick={toggleChat}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2" ref={chatRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <div
                  className={`inline-block px-3 py-2 rounded-lg text-sm ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="flex border-t p-2">
            <input
              type="text"
              className="flex-1 border rounded-lg px-3 py-1 text-sm focus:outline-none"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="ml-2 bg-blue-600 text-white rounded-lg px-3 py-1"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={toggleChat}
          className="bg-blue-600 text-white rounded-full p-4 shadow-xl hover:bg-blue-700 transition-all"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default Chatbot;
