'use client';

import React from 'react'
import InputBox from '@/app/components/InputBox'
import MessageSection from '@/app/components/MessageSection'
import { useState, useEffect } from 'react'

interface Message {
  id: number;
  role: string;
  content: string;
}

const ChatPage = () => {
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
  useEffect(() => {
    messages.map(msg => {
      console.log(msg);
    })
  }, [messages]);
  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    
    const newMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: content
    };
    
    setMessages([...messages, newMessage]);
  }
  return (
    <div className="flex flex-row bg-[#252526] items-center justify-center overflow-hidden">
      {/* Chat Container*/}
      
        <div className='h-[98vh] w-[48%] rounded-3xl overflow-hidden bg-[#131314] flex flex-col'>
          {/* Header */}
          <div className='text-left text-3xl font-semibold bg-[#181819] p-5 bg-gradient-to-r from-[#b86192] to-[#992366] bg-clip-text text-transparent'> ThoughtChain </div>
          
          {/* Message space */}
          <div className="flex-1 overflow-y-auto text-[#e3e3e3] flex flex-col-reverse">
            <MessageSection messages={messages} />
          </div>
          
          {/* Input at bottom */}
          <div>
            <InputBox onSendMessage={handleSendMessage} />
          </div>
        </div>

   


      {/* mind map - graph */}
      <div className='h-[100vh] w-[50%] bg-[#252526]'>
      </div>
    </div>
  )
}

export default ChatPage
