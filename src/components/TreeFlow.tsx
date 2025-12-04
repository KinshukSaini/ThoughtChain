"use client";
import React, { useCallback, useRef, useEffect, useState } from "react";
import { Background, ReactFlow, useEdgesState, addEdge, applyNodeChanges, ReactFlowProvider, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

let id = 1;
const getId = () => id++;

const TreeFlow = () => {
  const rf = useRef<any>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [currNode, setCurrNode] = useState<number | null>(null);

  const onNodesChange = useCallback((c: any) => setNodes((n) => applyNodeChanges(c, n)), []);
  const onConnect = useCallback((p: any) => setEdges((e: any) => addEdge(p, e)), [setEdges]);

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

  const addNode = useCallback((label = "New Node") => {
    const nid = getId();
    setNodes((n) => [...n, { id: String(nid), data: { label }, position: { x: 0, y: 0 }, sourcePosition: Position.Bottom, targetPosition: Position.Top }]);
    return nid;
  }, []);

  const addChild = useCallback((pid: number, label: string) => {
    const nid = addNode(label);
    setEdges((e: any) => [...e, { id: `${pid}-${nid}`, source: String(pid), target: String(nid) }]);
    setCurrNode(nid);
  }, [addNode, setEdges]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget), title = (d.get("title") as string) || "New Node";
    if (d.get("make_node") === "yes") currNode !== null ? addChild(currNode, title) : setCurrNode(addNode(title));
    e.currentTarget.reset();
  };

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative", background: "#1a1a1a" }}>
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}
        onInit={(i) => { rf.current = i; }} onNodeClick={(_, n) => setCurrNode(Number(n.id))} style={{ width: "100%", height: "100%", background: "#1a1a1a" }}>
        <Background color="#444" gap={16} />
      </ReactFlow>
      <form onSubmit={handleSubmit} style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.7)", color: "#fff", padding: 8, zIndex: 100 }}>
        <div>create node <label><input type="radio" name="make_node" value="yes" /> yes</label> <label><input type="radio" name="make_node" value="no" defaultChecked /> no</label></div>
        <div style={{ marginTop: 8 }}><label>title <input name="title" type="text" /></label></div>
        <div style={{ marginTop: 8 }}><input type="submit" value="enter" /></div>
      </form>
    </div>
  );
};

export default () => <ReactFlowProvider><TreeFlow /></ReactFlowProvider>;
