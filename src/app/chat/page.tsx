'use client';

import React from 'react'
import InputBox from '@/components/InputBox'
import MessageSection from '@/components/MessageSection'
import { useState, useEffect } from 'react'
import TreeFlow from '@/components/TreeFlow';

interface Message {
  id: number;
  role: string;
  content: string;
  nodeId?: number;
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

  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState<number>(0);
  const messageRefs = React.useRef<Map<number, HTMLDivElement>>(new Map());

  // Initialize chat on mount
  useEffect(() => {
    initializeChat();
  }, []);
  
  // Listen for node click events from TreeFlow
  useEffect(() => {
    const handleScrollToNode = (event: any) => {
      const { nodeId } = event.detail;
      console.log('[Chat] Scrolling to node:', nodeId);
      
      // Find the first message with this nodeId
      const messageWithNode = messages.find(msg => msg.nodeId === nodeId);
      if (messageWithNode) {
        const element = messageRefs.current.get(messageWithNode.id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight briefly
          element.style.backgroundColor = '#444';
          setTimeout(() => {
            element.style.backgroundColor = '';
          }, 1000);
        }
      }
    };
    
    window.addEventListener('scrollToNode', handleScrollToNode);
    return () => window.removeEventListener('scrollToNode', handleScrollToNode);
  }, [messages]);

  const initializeChat = async () => {
    try {
      const response = await fetch('/api/bot', {
        method: 'PUT',
      });
      const data = await response.json();
      if (data.success) {
        // Set to 0 if rootNodeId doesn't exist (after recent changes)
        setCurrentNodeId(data.rootNodeId ?? 0);
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    }
  };

  // Generate unique ID for messages
  const getUniqueId = () => {
    return Date.now() + Math.random();
  };

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

  const handleSendMessage = async (content: string, files?: File[]) => {
    if (!content.trim() && (!files || files.length === 0)) return;
    
    const fileData = files?.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size
    }));

    const messageContent = content.trim() || '📎 Uploaded files';

    // Add user message immediately with unique ID
    const userMessage: Message = {
      id: getUniqueId(),
      role: 'user',
      content: messageContent,
      files: fileData,
      nodeId: currentNodeId
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send message to bot API with generateAI flag
      const response = await fetch('/api/bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          role: 'user',
          nodeId: currentNodeId,
          generateAI: true
        })
      });

      const data = await response.json();
      
      if (data.success && data.aiResponse) {
        setCurrentNodeId(data.nodeId);
        
        // Add bot response to UI
      const botMessage: Message = {
        id: getUniqueId(),
        role: 'bot',
        content: data.aiResponse,
        nodeId: data.nodeId
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Trigger tree refresh
      if ((window as any).refreshTree) {
        (window as any).refreshTree();
      }
      } else if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: getUniqueId(),
        role: 'bot',
        content: 'Sorry, I encountered an error. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }

    // Log files for debugging
    if (files && files.length > 0) {
      console.log('Uploaded files:', files);
    }
  };

  return (
    <div className="flex flex-row bg-[#252526] h-screen overflow-hidden">
      {/* Chat Container*/}
      <div className='rounded-3xl overflow-hidden bg-[#131314] flex flex-col px-32' style={{ width: `${chatWidth}%` }}>
        {/* Header */}
        <div className='text-left text-3xl font-semibold bg-[#181819] p-5 bg-linear-to-r from-[#b86192] to-[#992366] bg-clip-text text-transparent'>
          ThoughtChain
        </div>
        
        {/* Message space */}
        <div className="flex-1 overflow-y-auto text-[#e3e3e3] flex flex-col-reverse">
          <MessageSection messages={messages} messageRefs={messageRefs} />
          {isLoading && (
            <div className='flex justify-start m-2'>
              <div className='text-white p-4 rounded-lg'>
                <div className='flex space-x-1'>
                  <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
                  <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{animationDelay: '0.1s'}}></div>
                  <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
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
        <TreeFlow />  
      </div>
    </div>
  )
}

export default ChatPage;
