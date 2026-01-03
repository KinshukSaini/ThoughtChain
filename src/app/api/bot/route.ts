import { NextRequest, NextResponse } from 'next/server';
import { decideCreateNode, generateResponse, isQuotaExhaustedError } from './bot';
import { randomUUID } from 'crypto';

// Session-based storage (in production, you'd use a database with user sessions)
const sessionStorage = new Map<string, { messages: Message[], nodes: Node[] }>();

// Cleanup old sessions (older than 24 hours)
const cleanupOldSessions = () => {
  const oneDay = 24 * 60 * 60 * 1000;
  const now = Date.now();
  
  for (const [sessionId, data] of sessionStorage.entries()) {
    // Extract timestamp from sessionId (UUID v4 doesn't have timestamp, so we'll track separately)
    const sessionTimestamp = (data as any).lastActivity || now;
    if (now - sessionTimestamp > oneDay) {
      sessionStorage.delete(sessionId);
      console.log('[Session] Cleaned up old session:', sessionId);
    }
  }
};

// Cleanup every hour
setInterval(cleanupOldSessions, 60 * 60 * 1000);

// Get or create session storage
const getSessionStorage = (sessionId: string) => {
  if (!sessionStorage.has(sessionId)) {
    sessionStorage.set(sessionId, { 
      messages: [], 
      nodes: [],
      lastActivity: Date.now()
    } as any);
    console.log('[Session] Created new session:', sessionId);
  } else {
    // Update last activity
    const data = sessionStorage.get(sessionId)!;
    (data as any).lastActivity = Date.now();
  }
  return sessionStorage.get(sessionId)!;
};

// Extract session ID from request
const getSessionId = (request: NextRequest): string => {
  // Try to get session ID from header
  const sessionFromHeader = request.headers.get('x-session-id');
  if (sessionFromHeader) return sessionFromHeader;
  
  // Try to get from URL params
  const url = new URL(request.url);
  const sessionFromParams = url.searchParams.get('sessionId');
  if (sessionFromParams) return sessionFromParams;
  
  // Generate new session ID
  const newSessionId = randomUUID();
  console.log('[Session] Generated new session ID:', newSessionId);
  return newSessionId;
};

interface Message {
  id: number;
  content: string;
  role: string;
}

interface Node {
  id: number;
  title: string;
  NodeMessages: Message[];
  Children: Node[];
}

class ChatNode implements Node {
  id: number;
  title: string;
  NodeMessages: Message[];
  Children: Node[];

  constructor(id: number, title: string) {
    this.id = id;
    this.title = title;
    this.NodeMessages = [];
    this.Children = [];
  }
}

class ChatMessage implements Message {
  id: number;
  content: string;
  role: string;

  constructor(id: number, content: string, role: string) {
    this.id = id;
    this.content = content;
    this.role = role;
  }
}

async function createNode(message: string, customApiKey?: string, sessionId?: string): Promise<{ create: string; title: string | null }> {
  try {
    console.log('[createNode] Calling decideCreateNode for message:', message);
    // Get session-specific nodes for context
    const { nodes } = sessionId ? getSessionStorage(sessionId) : { nodes: [] };
    const res = await decideCreateNode(message, nodes, customApiKey);
    console.log('[createNode] decideCreateNode returned:', res);
    return { create: res.create ?? 'no', title: res.title ?? null };
  } catch (err) {
    console.error('[createNode] Error in decideCreateNode:', err);
    if (message === '0') return { create: 'no', title: null };
    // Generate a simple title from the message
    const simpleTitle = message.length > 30 ? message.substring(0, 30) + '...' : message;
    return { create: 'yes', title: simpleTitle };
  }
}

async function addMessageToTree(
  messageContent: string,
  role: string,
  sessionId: string,
  nodeId?: number,
  customApiKey?: string
): Promise<{ success: boolean; messageId: number; nodeId: number; error?: string }> {
  try {
    const { messages, nodes } = getSessionStorage(sessionId);
    const messageId = messages.length + 1;
    let currNode: Node;

    // Find the target node or use the last node
    if (nodeId !== undefined && nodeId !== -1) {
      const targetNode = nodes.find(node => node.id === nodeId);
      if (!targetNode) {
        return { success: false, messageId: 0, nodeId: 0, error: 'Node not found' };
      }
      currNode = targetNode;
    } else {
      if (nodes.length === 0) {
        // Create initial root node if none exists
        const initialNode = new ChatNode(0, "Root Node");
        nodes.push(initialNode);
        currNode = initialNode;
      } else {
        currNode = nodes[nodes.length - 1];
      }
    }

    const newMessage = new ChatMessage(messageId, messageContent, role);
    messages.push(newMessage);

    // Only decide to create new node for user messages, not bot responses
    if (role === 'user') {
      // If this is the first message to root node, update its title
      if (currNode.title === 'Root Node' && currNode.NodeMessages.length === 0) {
        const { title } = await createNode(messageContent, customApiKey, sessionId);
        if (title) {
          currNode.title = title;
          console.log('[addMessageToTree] Updated root node title to:', title);
        }
        currNode.NodeMessages.push(newMessage);
        return { success: true, messageId, nodeId: currNode.id };
      }
      
      const { create, title } = await createNode(messageContent, customApiKey, sessionId);
      console.log('[addMessageToTree] User message - create:', create, 'title:', title);

      if (create === 'no') {
        currNode.NodeMessages.push(newMessage);
        return { success: true, messageId, nodeId: currNode.id };
      } else {
        const newNode = new ChatNode(nodes.length, title || messageContent.substring(0, 20));
        console.log('[addMessageToTree] Creating new node:', newNode.id, newNode.title);
        if (nodes.length > 0) {
          currNode.Children.push(newNode);
        }
        nodes.push(newNode);
        newNode.NodeMessages.push(newMessage);
        return { success: true, messageId, nodeId: newNode.id };
      }
    } else {
      // Bot messages always go to the current node
      currNode.NodeMessages.push(newMessage);
      return { success: true, messageId, nodeId: currNode.id };
    }
  } catch (error) {
    console.error('[addMessageToTree] Error:', error);
    return { 
      success: false, 
      messageId: 0, 
      nodeId: 0, 
      error: error instanceof Error ? error.message : 'Unknown error in addMessageToTree' 
    };
  }
}

function getTreeVisualization(sessionId: string) {
  const { nodes } = getSessionStorage(sessionId);
  return nodes.map(node => ({
    nodeId: node.id,
    title: node.title,
    messages: node.NodeMessages.map(msg => ({
      messageId: msg.id,
      role: msg.role,
      content: msg.content
    })),
    childrenIds: node.Children.map(child => child.id)
  }));
}

// Helper function to find a node by ID in session storage
function findNodeById(nodeId: number, sessionId: string, searchNodes?: Node[]): Node | null {
  const { nodes } = getSessionStorage(sessionId);
  const nodesToSearch = searchNodes || nodes;
  
  for (const node of nodesToSearch) {
    if (node.id === nodeId) return node;
    const found = findNodeById(nodeId, sessionId, node.Children);
    if (found) return found;
  }
  return null;
}

// Get path from root to a specific node in session storage
function getPathToNode(targetNodeId: number, sessionId: string): Node[] | null {
  const { nodes } = getSessionStorage(sessionId);
  
  // Build parent map
  const parentMap = new Map<number, number>();
  
  function buildParentMap(nodeList: Node[], parentId: number | null = null) {
    for (const node of nodeList) {
      if (parentId !== null) {
        parentMap.set(node.id, parentId);
      }
      buildParentMap(node.Children, node.id);
    }
  }
  
  buildParentMap(nodes);
  
  // Check if target node exists
  const targetNode = findNodeById(targetNodeId, sessionId);
  if (!targetNode) return null;
  
  // Build path from target to root
  const path: Node[] = [];
  let currentId: number | undefined = targetNodeId;
  
  while (currentId !== undefined) {
    const node = findNodeById(currentId, sessionId);
    if (!node) break;
    path.unshift(node); // Add to beginning
    currentId = parentMap.get(currentId);
  }
  
  return path.length > 0 ? path : null;
}

// GET - Retrieve the current tree structure or path to a specific node
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pathNodeId = searchParams.get('pathTo');
    const sessionId = getSessionId(request);
    
    // If pathTo parameter is provided, return path to that node
    if (pathNodeId) {
      const nodeId = parseInt(pathNodeId);
      const path = getPathToNode(nodeId, sessionId);
      
      if (!path) {
        return NextResponse.json(
          { success: false, error: 'Node not found' },
          { status: 404 }
        );
      }
      
      const response = NextResponse.json({
        success: true,
        path: path.map(node => ({
          nodeId: node.id,
          title: node.title,
          messages: node.NodeMessages.map(msg => ({
            messageId: msg.id,
            role: msg.role,
            content: msg.content
          }))
        }))
      });
      
      // Send session ID back to client
      response.headers.set('x-session-id', sessionId);
      return response;
    }
    
    // Default: return full tree
    const { messages, nodes } = getSessionStorage(sessionId);
    const treeData = getTreeVisualization(sessionId);
    
    const response = NextResponse.json({
      success: true,
      nodes: treeData,
      totalMessages: messages.length,
      totalNodes: nodes.length,
      sessionId: sessionId
    });
    
    // Send session ID back to client
    response.headers.set('x-session-id', sessionId);
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve tree data' },
      { status: 500 }
    );
  }
}

// POST - Add a new message to the tree and optionally get AI response
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, role, nodeId, generateAI, customApiKey, retryAIOnly } = body;
    const sessionId = getSessionId(request);

    if (!message || !role) {
      return NextResponse.json(
        { success: false, error: 'Message and role are required' },
        { status: 400 }
      );
    }

    let result;
    
    // If retryAIOnly is true, skip adding user message (already added on previous attempt)
    if (retryAIOnly && role === 'user') {
      // Use the existing nodeId - user message was already stored
      result = { success: true, messageId: 0, nodeId: nodeId };
    } else {
      result = await addMessageToTree(message, role, sessionId, nodeId, customApiKey);
      
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error || 'Failed to add message' },
          { status: 400 }
        );
      }
    }
    
    let aiResponse = null;
    let aiNodeId = result.nodeId;
    let nodeTitle = null;
    
    // If user message and generateAI is true, get AI response
    if (role === 'user' && generateAI) {
      try {
        const { messages } = getSessionStorage(sessionId);
        const conversationHistory = messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        const aiText = await generateResponse(message, conversationHistory, customApiKey);
        const aiResult = await addMessageToTree(aiText, 'bot', sessionId, result.nodeId);
        
        if (aiResult.success) {
          aiResponse = aiText;
          aiNodeId = aiResult.nodeId;
          
          // Get the node title (already set during node creation if create === 'yes')
          const { nodes } = getSessionStorage(sessionId);
          const currentNode = nodes.find(n => n.id === aiNodeId);
          nodeTitle = currentNode?.title || null;
        } else {
          console.error('[POST] Failed to add bot message:', aiResult.error);
        }
      } catch (aiError: any) {
        console.error('[POST] Error generating AI response:', aiError);
        
        // Check if it's a quota exhaustion error
        if (isQuotaExhaustedError(aiError)) {
          const response = NextResponse.json({
            success: false,
            error: 'API quota exhausted',
            quotaExhausted: true,
            messageId: result.messageId,
            nodeId: result.nodeId,
            sessionId: sessionId
          }, { status: 429 });
          
          response.headers.set('x-session-id', sessionId);
          return response;
        }
        
        // Return success for user message even if AI fails
        aiResponse = 'Sorry, I encountered an error generating a response.';
      }
    }
    
    const response = NextResponse.json({
      success: true,
      messageId: result.messageId,
      nodeId: aiNodeId,
      aiResponse: aiResponse,
      nodeTitle: nodeTitle,
      tree: getTreeVisualization(sessionId),
      sessionId: sessionId
    });
    
    response.headers.set('x-session-id', sessionId);
    return response;
  } catch (error) {
    console.error('[POST] Error processing request:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}

// DELETE - Reset the chat tree for specific session
export async function DELETE(request: NextRequest) {
  try {
    const sessionId = getSessionId(request);
    
    // Clear session storage
    const { messages, nodes } = getSessionStorage(sessionId);
    messages.length = 0;
    nodes.length = 0;
    
    const response = NextResponse.json({
      success: true,
      message: 'Chat tree reset successfully',
      sessionId: sessionId
    });
    
    response.headers.set('x-session-id', sessionId);
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to reset chat tree' },
      { status: 500 }
    );
  }
}

// PUT - Initialize chat with root node for specific session
export async function PUT(request: NextRequest) {
  try {
    const sessionId = getSessionId(request);
    
    // Reset and create initial node for this session
    const { messages, nodes } = getSessionStorage(sessionId);
    messages.length = 0;
    nodes.length = 0;
    
    const initialNode = new ChatNode(0, "Root Node");
    nodes.push(initialNode);
    
    const response = NextResponse.json({
      success: true,
      message: 'Chat initialized with root node',
      rootNodeId: initialNode.id,
      tree: getTreeVisualization(sessionId),
      sessionId: sessionId
    });
    
    response.headers.set('x-session-id', sessionId);
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to initialize chat' },
      { status: 500 }
    );
  }
}