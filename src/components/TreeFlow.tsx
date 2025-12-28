"use client";
import React, { useCallback, useRef, useEffect, useState } from "react";
import { Background, ReactFlow, useEdgesState, addEdge, applyNodeChanges, ReactFlowProvider, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const TreeFlow = () => {
  const rf = useRef<any>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set());

  const onNodesChange = useCallback((c: any) => setNodes((n) => applyNodeChanges(c, n)), []);

  // Fetch tree data from API
  const fetchTree = useCallback(async () => {
    try {
      const response = await fetch('/api/bot');
      const data = await response.json();
      
      if (data.success && data.nodes) {
        console.log('[TreeFlow] Fetched nodes:', data.nodes);
        
        // Convert API nodes to ReactFlow nodes
        const flowNodes = data.nodes.map((node: any) => {
          const isSelected = selectedNode?.id === String(node.nodeId);
          return {
            id: String(node.nodeId),
            data: { 
              label: node.title || `Node ${node.nodeId}`,
              messages: node.messages || [],
              messageCount: node.messages?.length || 0
            },
            position: { x: 0, y: 0 },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,
            style: {
              background: '#2d2d2d',
              color: '#fff',
              border: isSelected ? '3px solid white' : '1px solid #555',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '12px',
              minWidth: '120px',
            }
          };
        });

        // Convert API children relationships to ReactFlow edges
        const flowEdges: any[] = [];
        data.nodes.forEach((node: any) => {
          if (node.childrenIds && node.childrenIds.length > 0) {
            node.childrenIds.forEach((childId: number) => {
              flowEdges.push({
                id: `${node.nodeId}-${childId}`,
                source: String(node.nodeId),
                target: String(childId),
                style: { stroke: '#666' }
              });
            });
          }
        });

        setNodes(flowNodes);
        setEdges(flowEdges);
      }
    } catch (error) {
      console.error('[TreeFlow] Failed to fetch tree:', error);
    }
  }, [setEdges, selectedNode]);

  // Fetch tree on mount only - no polling
  useEffect(() => {
    fetchTree();
  }, [fetchTree]);
  
  // Expose refresh function to window for manual triggering
  useEffect(() => {
    (window as any).refreshTree = fetchTree;
    return () => {
      delete (window as any).refreshTree;
    };
  }, [fetchTree]);

  const layoutTree = useCallback(() => {
    if (!nodes.length) return;
    const adj: Record<string, string[]> = {}, indeg: Record<string, number> = {};
    nodes.forEach((n) => { adj[n.id] = []; indeg[n.id] = 0; });
    edges.forEach((e: any) => { adj[e.source]?.push(e.target); indeg[e.target] = (indeg[e.target] || 0) + 1; });
    const roots = nodes.filter((n) => !indeg[n.id]).map((n) => n.id);
    if (!roots.length && nodes.length) roots.push(nodes[0].id);
    const pos: Record<string, { x: number; y: number }> = {};
    let nextX = 0;
    const assign = (nid: string, d: number) => {
      const kids = adj[nid] || [];
      if (!kids.length) pos[nid] = { x: nextX++ * 200, y: d * 120 };
      else { kids.forEach((c) => assign(c, d + 1)); pos[nid] = { x: (pos[kids[0]].x + pos[kids[kids.length - 1]].x) / 2, y: d * 120 }; }
    };
    roots.forEach((r) => assign(r, 0));
    const xs = Object.values(pos).map((p) => p.x), off = (Math.min(...xs) + Math.max(...xs)) / 2;
    setNodes((nds) => {
      let ch = false;
      const upd = nds.map((n) => {
        const p = pos[n.id]; if (!p || (n.position.x === p.x - off && n.position.y === p.y)) return n;
        ch = true; return { ...n, position: { x: p.x - off, y: p.y } };
      });
      return ch ? upd : nds;
    });
  }, [nodes, edges]);

  useEffect(() => { const t = setTimeout(layoutTree, 0); return () => clearTimeout(t); }, [nodes.length, edges.length, layoutTree]);
  useEffect(() => { if (rf.current && nodes.length) setTimeout(() => rf.current?.fitView?.({ padding: 0.15 }), 50); }, [nodes.length]);

  // Handle node click - show messages and scroll to node in chat
  const handleNodeClick = useCallback((_: any, node: any) => {
    const nodeId = Number(node.id);
    console.log('[TreeFlow] Node clicked:', nodeId, node.data);
    
    // Toggle selected node
    const newSelectedNode = selectedNode?.id === node.id ? null : node;
    setSelectedNode(newSelectedNode);
    
    // Refresh tree to update border styling
    fetchTree();
    
    // Dispatch custom event that chat page can listen to
    const event = new CustomEvent('scrollToNode', { detail: { nodeId } });
    window.dispatchEvent(event);
  }, [selectedNode, fetchTree]);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative", background: "#1a1a1a" }}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        onNodesChange={onNodesChange} 
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onInit={(i: any) => { rf.current = i; }} 
        style={{ width: "100%", height: "100%", background: "#1a1a1a" }}
        fitView
      >
        <Background color="#444" gap={16} />
      </ReactFlow>
      
      {/* Message Panel */}
      {selectedNode && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: '#2d2d2d',
          border: '1px solid #555',
          borderRadius: '8px',
          padding: '15px',
          maxWidth: '350px',
          maxHeight: '80vh',
          overflowY: 'auto',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{selectedNode.data.label}</h3>
            <button 
              onClick={() => setSelectedNode(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#aaa',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '0 5px'
              }}
            >×</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ fontSize: '11px', color: '#888' }}>
              {selectedNode.data.messages.filter((m: any) => m.role === 'user').length} prompt{selectedNode.data.messages.filter((m: any) => m.role === 'user').length !== 1 ? 's' : ''}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {selectedNode.data.messages
              .filter((msg: any) => msg.role === 'user')
              .map((msg: any, idx: number) => {
                const msgIndex = selectedNode.data.messages.indexOf(msg);
                const isExpanded = expandedMessages.has(msgIndex);
                const botResponse = selectedNode.data.messages[msgIndex + 1];
                const hasBotResponse = botResponse && botResponse.role === 'bot';
                
                return (
                  <div key={idx}>
                    {/* User Message */}
                    <div style={{
                      background: '#3a3a3a',
                      padding: '8px',
                      borderRadius: '6px',
                      borderLeft: '3px solid #b86192'
                    }}>
                      <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>
                        👤 User
                      </div>
                      <div style={{ fontSize: '12px', color: '#e3e3e3', wordBreak: 'break-word' }}>
                        {msg.content}
                      </div>
                    </div>
                    
                    {/* Show/Hide Response Button */}
                    {hasBotResponse && (
                      <button
                        onClick={() => {
                          const newExpanded = new Set(expandedMessages);
                          if (isExpanded) {
                            newExpanded.delete(msgIndex);
                          } else {
                            newExpanded.add(msgIndex);
                          }
                          setExpandedMessages(newExpanded);
                        }}
                        style={{
                          background: 'transparent',
                          border: '1px solid #555',
                          color: '#888',
                          fontSize: '10px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginTop: '4px',
                          width: '100%',
                          textAlign: 'left'
                        }}
                      >
                        {isExpanded ? '▼ Hide Response' : '▶ Show Response'}
                      </button>
                    )}
                    
                    {/* Bot Response (conditionally shown) */}
                    {hasBotResponse && isExpanded && (
                      <div style={{
                        background: '#2a2a2a',
                        padding: '8px',
                        borderRadius: '6px',
                        borderLeft: '3px solid #666',
                        marginTop: '4px'
                      }}>
                        <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>
                          🤖 Bot
                        </div>
                        <div style={{ fontSize: '12px', color: '#e3e3e3', wordBreak: 'break-word' }}>
                          {botResponse.content}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default () => <ReactFlowProvider><TreeFlow /></ReactFlowProvider>;
