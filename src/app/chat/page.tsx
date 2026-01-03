'use client';

import React from 'react'
import InputBox from '@/components/InputBox'
import MessageSection from '@/components/MessageSection'
import { useState, useEffect } from 'react'
import TreeFlow from '@/components/TreeFlow';
import ApiKeyModal from '@/components/ApiKeyModal';

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
  const [activeView, setActiveView] = useState<'chat' | 'graph'>('chat');
  const [isLargeScreen, setIsLargeScreen] = useState(true);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<{ content: string; files?: File[] } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Get or create session ID
  const getSessionId = (): string => {
    if (sessionId) return sessionId;
    
    // Try to get from localStorage
    const stored = localStorage.getItem('thoughtchain-session-id');
    if (stored) {
      setSessionId(stored);
      return stored;
    }
    
    // Generate new session ID with fallback
    let newSessionId: string;
    try {
      newSessionId = crypto.randomUUID();
    } catch {
      // Fallback for browsers that don't support crypto.randomUUID()
      newSessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    localStorage.setItem('thoughtchain-session-id', newSessionId);
    setSessionId(newSessionId);
    console.log('[Chat] Generated new session ID:', newSessionId);
    return newSessionId;
  };

  // Helper to make API requests with session ID
  const apiRequest = async (url: string, options: RequestInit = {}) => {
    const currentSessionId = getSessionId();
    const headers = {
      'x-session-id': currentSessionId,
      ...options.headers
    };
    
    return fetch(url, {
      ...options,
      headers
    });
  };

  // Handle screen resize
  useEffect(() => {
    // Set initial value after mount to avoid hydration mismatch
    setIsLargeScreen(window.innerWidth >= 1024);
    
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        const response = await apiRequest(`/api/bot?pathTo=${nodeId}`);
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
      const response = await apiRequest('/api/bot', {
        method: 'PUT',
      });
      const data = await response.json();
      if (data.success) {
        // Set to 0 if rootNodeId doesn't exist (after recent changes)
        setCurrentNodeId(data.rootNodeId ?? 0);
        // Update session ID if returned from server
        if (data.sessionId) {
          setSessionId(data.sessionId);
          localStorage.setItem('thoughtchain-session-id', data.sessionId);
        }
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
      // Get custom API key from localStorage if available
      const customApiKey = localStorage.getItem('userGeminiApiKey') || undefined;
      
      // Send message to bot API with generateAI flag
      const response = await apiRequest('/api/bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          role: 'user',
          nodeId: currentNodeId,
          generateAI: true,
          customApiKey
        })
      });

      const data = await response.json();
      
      // Check for quota exhaustion
      if (data.quotaExhausted) {
        // Store the pending message for retry after API key is added
        setPendingMessage({ content: messageContent, files });
        setShowApiKeyModal(true);
        setIsLoading(false);
        return;
      }
      
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

  // Handle API key submission - retry pending message with new key
  const handleApiKeySubmit = async (apiKey: string) => {
    setShowApiKeyModal(false);
    
    if (pendingMessage) {
      // Retry the pending message with the new API key
      setIsLoading(true);
      
      try {
        const response = await apiRequest('/api/bot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: pendingMessage.content,
            role: 'user',
            nodeId: currentNodeId,
            generateAI: true,
            customApiKey: apiKey
          })
        });

        const data = await response.json();
        
        if (data.quotaExhausted) {
          // Still quota exhausted - maybe invalid key
          const errorMessage: Message = {
            id: getUniqueId(),
            role: 'bot',
            content: 'The API key provided is also exhausted or invalid. Please try a different key.'
          };
          setMessages(prev => [...prev, errorMessage]);
          setShowApiKeyModal(true);
          return;
        }
        
        if (data.success && data.aiResponse) {
          setCurrentNodeId(data.nodeId);
          
          const botMessage: Message = {
            id: getUniqueId(),
            role: 'bot',
            content: data.aiResponse,
            nodeId: data.nodeId
          };
          
          setMessages(prev => [...prev, botMessage]);
          
          if ((window as any).refreshTree) {
            (window as any).refreshTree();
          }
        } else if (!data.success) {
          throw new Error(data.error || 'Failed to get response');
        }
      } catch (error) {
        console.error('Failed to retry message:', error);
        const errorMessage: Message = {
          id: getUniqueId(),
          role: 'bot',
          content: 'Sorry, I encountered an error. Please check your API key and try again.'
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setPendingMessage(null);
      }
    }
  };

  return (
    <div className="flex flex-row bg-[#0a0a0b] h-screen overflow-hidden relative">
      {/* API Key Modal */}
      <ApiKeyModal 
        isOpen={showApiKeyModal}
        onClose={() => {
          setShowApiKeyModal(false);
          setPendingMessage(null);
        }}
        onSubmit={handleApiKeySubmit}
      />
      
      {/* Toggle Button for Small Screens */}
      <div className="lg:hidden absolute top-4 right-4 z-50 flex gap-2 bg-[#0f0f10] border border-white/10 rounded-lg p-1">
        <button
          onClick={() => setActiveView('chat')}
          className={`px-4 py-2 rounded transition-colors ${
            activeView === 'chat' 
              ? 'bg-[#a855f7] text-white shadow-lg shadow-[#a855f7]/30' 
              : 'text-[#a1a1aa] hover:text-white'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveView('graph')}
          className={`px-4 py-2 rounded transition-colors ${
            activeView === 'graph' 
              ? 'bg-[#a855f7] text-white shadow-lg shadow-[#a855f7]/30' 
              : 'text-[#a1a1aa] hover:text-white'
          }`}
        >
          Graph
        </button>
      </div>

      {/* Chat Container*/}
      <div 
        className={`rounded-3xl overflow-hidden bg-[#0f0f10] px-2 sm:px-4 md:px-8 lg:px-32 ${
          activeView === 'chat' ? 'flex' : 'hidden'
        } lg:flex flex-col relative h-screen lg:h-auto`} 
        style={{ width: isLargeScreen ? `${chatWidth}%` : '100%' }}
      >
        {/* Header */}
        <div className='text-left text-2xl sm:text-3xl font-semibold bg-[#0f0f10] p-5 bg-linear-to-r from-[#a855f7] to-[#c084fc] bg-clip-text text-transparent border-b border-white/5 flex-shrink-0'>
          ThoughtChain
        </div>
        
        {/* Message space with bottom padding for fixed input */}
        <div className="flex-1 overflow-y-auto text-[#f5f5f5] flex flex-col-reverse pb-48 lg:pb-0">
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
          <MessageSection messages={messages} messageRefs={messageRefs} />    
        </div>
        
        {/* Input at bottom - Fixed on mobile, static on desktop */}
        <div className='fixed lg:relative bottom-0 left-0 right-0 lg:bottom-auto lg:left-auto lg:right-auto flex justify-center items-center bg-[#0f0f10] lg:bg-transparent p-4 lg:p-0 z-40 flex-shrink-0'>
          <InputBox onSendMessage={handleSendMessage} />
        </div>
      </div>

      <div 
        className='hidden lg:flex w-2 hover:bg-[#a855f7]/20 cursor-col-resize transition-colors justify-center items-center'
        onMouseDown={handleMouseDown}
      >
        <div className='w-0.5 h-8 bg-white/20'></div>
      </div>

      {/* mind map - graph */}
      <div 
        className={`flex-1 h-screen bg-[#0a0a0b] ${
          activeView === 'graph' ? 'block' : 'hidden'
        } lg:block`}
      >
        <TreeFlow />  
      </div>
    </div>
  )
}

export default ChatPage;
