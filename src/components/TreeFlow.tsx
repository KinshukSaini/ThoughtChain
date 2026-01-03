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
      // Get session ID from localStorage
      const sessionId = localStorage.getItem('thoughtchain-session-id');
      const url = sessionId ? `/api/bot?sessionId=${sessionId}` : '/api/bot';
      
      const response = await fetch(url, {
        headers: sessionId ? { 'x-session-id': sessionId } : {}
      });
      const data = await response.json();
      
      if (data.success && data.nodes) {
        console.log('[TreeFlow] Fetched nodes:', data.nodes);
        
        // Store session ID if returned from server
        if (data.sessionId && data.sessionId !== sessionId) {
          localStorage.setItem('thoughtchain-session-id', data.sessionId);
        }
        
        // Convert API nodes to ReactFlow nodes
        const flowNodes = data.nodes.map((node: any) => ({
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
            border: '1px solid #555',
            borderRadius: '8px',
            padding: '10px',
            fontSize: '12px',
            minWidth: '120px',
          }
        }));

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
  }, [setEdges]);

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
    setSelectedNode(selectedNode?.id === node.id ? null : node);
    
    // Dispatch custom event that chat page can listen to
    const event = new CustomEvent('scrollToNode', { detail: { nodeId } });
    window.dispatchEvent(event);
  }, [selectedNode]);

  // Update node styles when selection changes
  useEffect(() => {
    setNodes((nds) => nds.map((n) => ({
      ...n,
      style: {
        ...n.style,
        border: selectedNode?.id === n.id ? '2px solid #aaa' : '1px solid #555',
      }
    })));
  }, [selectedNode]);

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
    </div>
  );
};

export default () => <ReactFlowProvider><TreeFlow /></ReactFlowProvider>;
