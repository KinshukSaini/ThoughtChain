'use client';

import React from 'react'
import InputBox from '@/components/InputBox'
import MessageSection from '@/components/MessageSection'
import { useState, useEffect } from 'react'

interface Message {
  id: number;
  role: string;
  content: string;
  files?: { name: string; type: string; size: number }[];
}

const ChatPage = () => {
  const [chatWidth, setChatWidth] = useState(48);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'bot',
      content: 'Hi, how can i help you today?'
    },
    {
      id: 2,
      role: 'user',
      content: 'What is the capital of France?'
    },
    {
      id: 3,
      role: 'bot',
      content: 'its paris'
    },
  ]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = chatWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const windowWidth = window.innerWidth;
      const newWidth = startWidth + (deltaX / windowWidth) * 100;
      setChatWidth(Math.min(Math.max(newWidth, 20), 80));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    messages.map(msg => {
      console.log(msg);
    })
  }, [messages]);

  const handleSendMessage = (content: string, files?: File[]) => {
    if (!content.trim() && (!files || files.length === 0)) return;
    
    const fileData = files?.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size
    }));

    const newMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: content || '📎 Uploaded files',
      files: fileData
    };
    
    setMessages([...messages, newMessage]);

    // Log files for debugging
    if (files && files.length > 0) {
      console.log('Uploaded files:', files);
    }
  }
  return (
    <div className="flex flex-row bg-[#252526] h-screen overflow-hidden">
      {/* Chat Container*/}
      
        <div className='rounded-3xl overflow-hidden bg-[#131314] flex flex-col px-32' style={{ width: `${chatWidth}%` }}>
          {/* Header */}
          <div className='text-left text-3xl font-semibold bg-[#181819] p-5 bg-linear-to-r from-[#b86192] to-[#992366] bg-clip-text text-transparent'> ThoughtChain </div>
          
          {/* Message space */}
          <div className="flex-1 overflow-y-auto text-[#e3e3e3] flex flex-col-reverse">
            <MessageSection messages={messages} />
          </div>
          
          {/* Input at bottom */}
          <div className='flex justify-center items-center'>
            <InputBox onSendMessage={handleSendMessage} />
          </div>
        </div>

        {/* Resizable divider */}
        <div 
          className='flex w-2 hover:bg-[#a19fa3] cursor-col-resize transition-colors justify-center items-center'
          onMouseDown={handleMouseDown}
        >
          <div className='w-0.5 h-8 bg-gray-500'></div>
        </div>

      {/* mind map - graph */}
      <div className='flex-1 h-screen bg-[#252526]'>
      </div>
    </div>
  )
}

export default ChatPage
