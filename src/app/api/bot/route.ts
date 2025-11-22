import { NextRequest, NextResponse } from 'next/server';

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

function createNode(message: string): { create: string; title: string | null } {
  if (message === "0") {
    return { create: 'no', title: null };
  } else {
    return { create: 'yes', title: 'new node' };
  }
}

function addMessageToTree(
  messageContent: string, 
  role: string, 
  nodeId?: number
): { success: boolean; messageId: number; nodeId: number; error?: string } {
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

    const { create, title } = createNode(messageContent);
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

// GET - Retrieve the current tree structure
export async function GET() {
  try {
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

    const result = addMessageToTree(message, role, nodeId);
    
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