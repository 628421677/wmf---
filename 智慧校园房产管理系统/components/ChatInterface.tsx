import React, { useState, useRef, useEffect } from 'react';
import { TechPanel } from './TechPanel';
import { Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { streamChatResponse } from '../services/geminiService';

export const ChatInterface: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'NOAH 已上线。全系统监控激活。请问有关地下管网的指令？' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const modelMsgPlaceholder: ChatMessage = { role: 'model', text: '', isLoading: true };
    setMessages(prev => [...prev, modelMsgPlaceholder]);

    let fullText = '';
    
    await streamChatResponse([...messages, userMsg], (chunk) => {
      fullText += chunk;
      setMessages(prev => {
        const newArr = [...prev];
        newArr[newArr.length - 1] = { role: 'model', text: fullText, isLoading: false };
        return newArr;
      });
    });

    setIsTyping(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="absolute bottom-6 right-6 w-14 h-14 bg-tech-blue/20 backdrop-blur-md border border-tech-blue rounded-full flex items-center justify-center text-tech-blue shadow-[0_0_20px_rgba(30,144,255,0.4)] hover:scale-110 transition-transform z-50 group"
      >
        <Bot size={24} />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-tech-cyan rounded-full animate-ping" />
      </button>
    );
  }

  return (
    <div className="absolute right-4 bottom-4 w-96 z-40 transition-all duration-500 ease-in-out">
      <TechPanel title="AI 助手 // NOAH 核心" className="h-[500px] flex flex-col">
        {/* Controls */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-tech-cyan opacity-50 hover:opacity-100 z-50"
        >
          <Minimize2 size={16} />
        </button>

        {/* Visualization of "Listening" */}
        <div className="h-12 w-full border-b border-white/10 flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
               <div 
                 key={i} 
                 className={`w-1 bg-tech-cyan transition-all duration-100 ${isTyping ? 'animate-pulse' : ''}`}
                 style={{ 
                   height: isTyping ? `${Math.random() * 20 + 10}px` : '4px',
                   animationDelay: `${i * 0.1}s` 
                  }}
               />
            ))}
        </div>

        {/* Messages */}
        <div className="flex-grow overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] p-3 text-xs font-mono leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-tech-blue/20 border border-tech-blue/30 text-white rounded-tl-lg rounded-bl-lg rounded-br-lg' 
                    : 'bg-white/5 border-l-2 border-tech-cyan text-gray-300'
                }`}
              >
                {msg.text || (msg.isLoading && <span className="animate-pulse">_数据处理中...</span>)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入指令 / 查询..."
            className="w-full bg-black/50 border border-tech-cyan/30 p-3 pr-10 text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-tech-cyan focus:shadow-[0_0_10px_rgba(0,242,255,0.2)] transition-all"
            autoFocus
          />
          <button 
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-tech-cyan disabled:opacity-30 hover:text-white transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </TechPanel>
    </div>
  );
};