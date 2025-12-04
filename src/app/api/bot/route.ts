import { NextRequest, NextResponse } from 'next/server';
import { decideCreateNode } from './bot';

// Global storage (in production, you'd use a database)
let Messages: Message[] = [];
let Nodes: Node[] = [];

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

async function createNode(message: string): Promise<{ create: string; title: string | null }> {
  try {
    const res = await decideCreateNode(message, Nodes);
    return { create: res.create ?? 'no', title: res.title ?? null };
  } catch (err) {
    if (message === '0') return { create: 'no', title: null };
    return { create: 'yes', title: 'new node' };
  }
}

async function addMessageToTree(
  messageContent: string,
  role: string,
  nodeId?: number
): Promise<{ success: boolean; messageId: number; nodeId: number; error?: string }> {
  try {
    const messageId = Messages.length + 1;
    let currNode: Node;

    // Find the target node or use the last node
    if (nodeId !== undefined && nodeId !== -1) {
      const targetNode = Nodes.find(node => node.id === nodeId);
      if (!targetNode) {
        return { success: false, messageId: 0, nodeId: 0, error: 'Node not found' };
      }
      currNode = targetNode;
    } else {
      if (Nodes.length === 0) {
        // Create initial root node if none exists
        const initialNode = new ChatNode(0, "Root Node");
        Nodes.push(initialNode);
        currNode = initialNode;
      } else {
        currNode = Nodes[Nodes.length - 1];
      }
    }

    const { create, title } = await createNode(messageContent);
    const newMessage = new ChatMessage(messageId, messageContent, role);
    Messages.push(newMessage);

    if (create === 'no') {
      currNode.NodeMessages.push(newMessage);
      return { success: true, messageId, nodeId: currNode.id };
    } else {
      const newNode = new ChatNode(Nodes.length, title || 'new node');
      if (Nodes.length > 0) {
        currNode.Children.push(newNode);
      }
      Nodes.push(newNode);
      newNode.NodeMessages.push(newMessage);
      return { success: true, messageId, nodeId: newNode.id };
    }
  } catch (error) {
    return { 
      success: false, 
      messageId: 0, 
      nodeId: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

function getTreeVisualization() {
  return Nodes.map(node => ({
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

// Helper function to find a node by ID
function findNodeById(nodeId: number, searchNodes: Node[] = Nodes): Node | null {
  for (const node of searchNodes) {
    if (node.id === nodeId) return node;
    const found = findNodeById(nodeId, node.Children);
    if (found) return found;
  }
  return null;
}

// Get path from root to a specific node
function getPathToNode(targetNodeId: number): Node[] | null {
  // Build parent map
  const parentMap = new Map<number, number>();
  
  function buildParentMap(nodes: Node[], parentId: number | null = null) {
    for (const node of nodes) {
      if (parentId !== null) {
        parentMap.set(node.id, parentId);
      }
      buildParentMap(node.Children, node.id);
    }
  }
  
  buildParentMap(Nodes);
  
  // Check if target node exists
  const targetNode = findNodeById(targetNodeId);
  if (!targetNode) return null;
  
  // Build path from target to root
  const path: Node[] = [];
  let currentId: number | undefined = targetNodeId;
  
  while (currentId !== undefined) {
    const node = findNodeById(currentId);
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
    
    // If pathTo parameter is provided, return path to that node
    if (pathNodeId) {
      const nodeId = parseInt(pathNodeId);
      const path = getPathToNode(nodeId);
      
      if (!path) {
        return NextResponse.json(
          { success: false, error: 'Node not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
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
    }
    
    // Default: return full tree
    const treeData = getTreeVisualization();
    return NextResponse.json({
      success: true,
      nodes: treeData,
      totalMessages: Messages.length,
      totalNodes: Nodes.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve tree data' },
      { status: 500 }
    );
  }
}

// POST - Add a new message to the tree
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, role, nodeId } = body;

    if (!message || !role) {
      return NextResponse.json(
        { success: false, error: 'Message and role are required' },
        { status: 400 }
      );
    }

    const result = await addMessageToTree(message, role, nodeId);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        nodeId: result.nodeId,
        tree: getTreeVisualization()
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// DELETE - Reset the chat tree
export async function DELETE() {
  try {
    Messages = [];
    Nodes = [];
    
    return NextResponse.json({
      success: true,
      message: 'Chat tree reset successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to reset chat tree' },
      { status: 500 }
    );
  }
}

// PUT - Initialize chat with root node
export async function PUT() {
  try {
    // Reset and create initial node
    Messages = [];
    Nodes = [];
    
    const initialNode = new ChatNode(0, "Root Node");
    Nodes.push(initialNode);
    
    return NextResponse.json({
      success: true,
      message: 'Chat initialized with root node',
      rootNodeId: initialNode.id,
      tree: getTreeVisualization()
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to initialize chat' },
      { status: 500 }
    );
  }
}