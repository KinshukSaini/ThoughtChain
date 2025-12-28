'use client';

import React from 'react'
import InputBox from '@/components/InputBox'
import MessageSection from '@/components/MessageSection'
import { useState, useEffect } from 'react'
import TreeFlow from '@/components/TreeFlow';
import Link from 'next/link';
import { Network } from 'lucide-react';

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
  const [mobileView, setMobileView] = useState<'chat' | 'graph'>('chat');
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messageRefs = React.useRef<Map<number, HTMLDivElement>>(new Map());

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Handle window resize for mobile/desktop switch
  useEffect(() => {
    const handleResize = () => {
      const wasMobile = isMobile;
      const nowMobile = window.innerWidth < 768;
      
      if (wasMobile !== nowMobile) {
        setIsMobile(nowMobile);
        // Force reload on breakpoint change
        window.location.reload();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  // Initialize chat on mount
  useEffect(() => {
    initializeChat();
  }, []);
  
  // Listen for node click events from TreeFlow
  useEffect(() => {
    const handleScrollToNode = async (event: any) => {
      const { nodeId } = event.detail;
      console.log('[Chat] Loading path to node:', nodeId);
      
      try {
        // Fetch the path from root to this node
        const response = await fetch(`/api/bot?pathTo=${nodeId}`);
        const data = await response.json();
        
        if (data.success && data.path) {
          // Convert path data to messages
          const pathMessages: Message[] = [];
          let messageIdCounter = 1;
          
          data.path.forEach((node: any) => {
            node.messages.forEach((msg: any) => {
              pathMessages.push({
                id: messageIdCounter++,
                role: msg.role,
                content: msg.content,
                nodeId: node.nodeId
              });
            });
          });
          
          // Update messages to show only the path to this node
          setMessages(pathMessages);
          
          // Update current node ID so new messages go to this node
          setCurrentNodeId(nodeId);
          
          console.log('[Chat] Loaded', pathMessages.length, 'messages up to node', nodeId);
        }
      } catch (error) {
        console.error('[Chat] Failed to load path to node:', error);
      }
    };
    
    window.addEventListener('scrollToNode', handleScrollToNode);
    return () => window.removeEventListener('scrollToNode', handleScrollToNode);
  }, []);

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
    <div className="flex flex-row bg-[#252526] h-screen overflow-hidden relative">
      {/* Mobile Toggle Buttons */}
      <div className="md:hidden absolute top-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-[#181819] rounded-full p-1 border border-white/10 w-[90vw] max-w-md">
        <button
          onClick={() => setMobileView('chat')}
          className={`flex-1 py-3 rounded-full text-base font-semibold transition-all ${
            mobileView === 'chat'
              ? 'bg-[#a855f7] text-white shadow-lg shadow-[#a855f7]/30'
              : 'text-[#a1a1aa] hover:text-white'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setMobileView('graph')}
          className={`flex-1 py-3 rounded-full text-base font-semibold transition-all ${
            mobileView === 'graph'
              ? 'bg-[#a855f7] text-white shadow-lg shadow-[#a855f7]/30'
              : 'text-[#a1a1aa] hover:text-white'
          }`}
        >
          Graph
        </button>
      </div>

      {/* Chat Container */}
      <div 
        className={`overflow-hidden bg-[#0a0a0b] flex flex-col w-full ${
          mobileView === 'chat' ? 'flex' : 'hidden'
        } md:flex`}
        style={isClient && window.innerWidth >= 768 ? { width: `${chatWidth}%` } : undefined}
      >
        {/* Header - Landing Page Style (hidden on mobile) */}
        <header className="hidden md:flex sticky top-0 z-50 h-16 items-center justify-between border-b border-white/5 bg-[#0a0a0b]/80 px-6 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl font-bold tracking-tight text-[#a855f7]">ThoughtChain</span>
          </Link>
          
        </header>
        
        {/* Message space */}
        <div className="flex-1 overflow-y-auto text-[#e3e3e3] flex flex-col-reverse px-4 md:px-32 mt-16 md:mt-0">
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
        <div className='flex justify-center items-center px-4 md:px-32'>
          <InputBox onSendMessage={handleSendMessage} />
        </div>
      </div>

      {/* Resizable divider */}
      <div 
        className='hidden md:flex w-2 hover:bg-[#a19fa3] cursor-col-resize transition-colors justify-center items-center'
        onMouseDown={handleMouseDown}
      >
        <div className='w-0.5 h-8 bg-gray-500'></div>
      </div>

      {/* mind map - graph */}
      <div 
        className={`flex-1 h-screen bg-[#252526] ${
          mobileView === 'graph' ? 'flex' : 'hidden'
        } md:flex`}
      >
        <TreeFlow />  
      </div>
    </div>
  )
}

export default ChatPage;
