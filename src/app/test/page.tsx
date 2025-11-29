"use client";
import React, { useCallback, useRef, useEffect } from "react";
import {
  Background,
  ReactFlow,
  useEdgesState,
  addEdge,
  applyNodeChanges,
  ReactFlowProvider,
  Position,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

const initialNodes: any[] = [];
const initialEdges: any[] = [];

let id = 1;
const getId = () => id++;

const AddNodeOnEdgeDrop = () => {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const reactFlowInstance = useRef<any>(null);
  const [nodes, setNodes] = React.useState<any[]>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [currNode, setCurrNode] = React.useState<number | null>(null);
  const [lastAddedNode, setLastAddedNode] = React.useState<number | null>(null);
  const onInit = useCallback((inst: any) => {
    reactFlowInstance.current = inst;
    console.log('reactFlow instance init:', inst && typeof inst === 'object' ? Object.keys(inst) : inst);
  }, []);

  const onConnect = useCallback(
    (params: any) => setEdges((eds: any) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds: any) => applyNodeChanges(changes, nds)),
    []
  );

  // Basic snapshot logging (only when positions/edges change)
  const prevNodesSnapshot = useRef<string | null>(null);
  const prevEdgesSnapshot = useRef<string | null>(null);

  useEffect(() => {
    const snap = JSON.stringify(
      nodes.map((n: any) => ({ id: n.id, x: n.position?.x ?? null, y: n.position?.y ?? null }))
    );
    if (prevNodesSnapshot.current !== snap) {
      prevNodesSnapshot.current = snap;
      console.log("nodes snapshot changed:", snap);
    }
  }, [nodes]);

  useEffect(() => {
    const snap = JSON.stringify(edges.map((e: any) => ({ id: e.id, source: e.source, target: e.target })));
    if (prevEdgesSnapshot.current !== snap) {
      prevEdgesSnapshot.current = snap;
      console.log("edges snapshot changed:", snap);
    }
  }, [edges]);

  // Simple tree layout that avoids overlap
  const buildAdjacency = useCallback(() => {
    const adj: Record<number, number[]> = {};
    const indeg: Record<number, number> = {};
    for (const n of nodes) {
      adj[n.id] = [];
      indeg[n.id] = indeg[n.id] ?? 0;
    }
    for (const e of edges) {
      const s = Number(e.source);
      const t = Number(e.target);
      if (!adj[s]) adj[s] = [];
      adj[s].push(t);
      indeg[t] = (indeg[t] || 0) + 1;
    }
    return { adj, indeg };
  }, [nodes, edges]);

  const layoutTree = useCallback(() => {
    if (nodes.length === 0) return;
    const H_SPACING = 200;
    const V_SPACING = 120;
    const { adj, indeg } = buildAdjacency();

    let roots = nodes.filter((n) => (indeg[n.id] || 0) === 0).map((n) => n.id);
    if (roots.length === 0 && nodes.length > 0) roots = [nodes[0].id];

    const positions: Record<number, { x: number; y: number }> = {};
    let nextX = 0;

    const assign = (nodeId: number, depth: number) => {
      const children = (adj[nodeId] || []).slice();
      if (children.length === 0) {
        const x = nextX * H_SPACING;
        positions[nodeId] = { x, y: depth * V_SPACING };
        nextX++;
      } else {
        for (const c of children) assign(c, depth + 1);
        const firstX = positions[children[0]].x;
        const lastX = positions[children[children.length - 1]].x;
        const x = (firstX + lastX) / 2;
        positions[nodeId] = { x, y: depth * V_SPACING };
      }
    };

    for (const r of roots) assign(r, 0);

    const xs = Object.values(positions).map((p) => p.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const centerOffset = (minX + maxX) / 2;

    let didChange = false;
    setNodes((nds: any) => {
      const newNodes = nds.map((n: any) => {
        const pos = positions[n.id];
        if (!pos) return n;
        const newX = pos.x - centerOffset;
        const newY = pos.y;
        if (typeof n.position?.x === "number" && n.position.x === newX && n.position.y === newY) {
          return n;
        }
        didChange = true;
        return { ...n, position: { x: newX, y: newY } };
      });
      return didChange ? newNodes : nds;
    });
  }, [nodes, edges, buildAdjacency]);

  // Layout when graph changes
  useEffect(() => {
    const t = setTimeout(() => layoutTree(), 0);
    return () => clearTimeout(t);
  }, [nodes.length, edges.length, layoutTree]);

  // center/focus on lastAddedNode
  useEffect(() => {
    if (lastAddedNode === null) return;
    const inst = reactFlowInstance.current;
    const node = nodes.find((n) => n.id === lastAddedNode);
    if (!node || !inst) return;
    try {
      if (typeof inst.setCenter === "function") {
        inst.setCenter(node.position.x, node.position.y, { duration: 300 });
      } else if (typeof inst.panTo === "function") {
        inst.panTo({ x: node.position.x, y: node.position.y });
      } else if (typeof inst.fitView === "function") {
        inst.fitView({ padding: 0.2 });
      }
    } catch {
      // ignore
    } finally {
      setLastAddedNode(null);
    }
  }, [lastAddedNode, nodes]);

  const addNode = useCallback(
    (position: { x: number; y: number }, label = "New Node") => {
      const newId = getId();
      const newNode = {
        id: String(newId),
        data: { label },
        position: { x: position.x, y: position.y },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      };
      setNodes((nds: any) => nds.concat(newNode));
      setLastAddedNode(newId);
      return newId;
    },
    []
  );

  const addChildNode = useCallback(
    (parentId: number, label = "New Node") => {
      // add node at fallback; layout will re-position
      const newId = addNode({ x: 0, y: 0 }, label);
      setEdges((eds: any) =>
        eds.concat({
          id: `${parentId}-${newId}`,
          source: String(parentId),
          target: String(newId),
        })
      );
      setCurrNode(newId);
      return newId;
    },
    [addNode, setEdges]
  );

  const onNodeClick = useCallback((_: any, node: any) => {
    const nodeId = Number(node.id);
    console.log("clicked node id:", nodeId);
    setCurrNode(nodeId);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const data = new FormData(form);
      const makeNode = data.get("make_node") as string | null;
      const title = (data.get("title") as string) || "New Node";

      if (makeNode === "yes") {
        if (currNode !== null) {
          addChildNode(currNode, title);
        } else {
          const newId = addNode({ x: 0, y: 0 }, title);
          setCurrNode(newId);
        }
      }
      form.reset();
    },
    [addNode, addChildNode, currNode]
  );

  // initial root
  useEffect(() => {
    if (nodes.length === 0) {
      const rootId = addNode({ x: 0, y: 0 }, "Root");
      setCurrNode(rootId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ensure viewport shows nodes after layout
  useEffect(() => {
    if (!reactFlowInstance.current) return;
    if (nodes.length === 0) return;
    const t = setTimeout(() => {
      const inst = reactFlowInstance.current;
      try {
        if (typeof inst.fitView === "function") inst.fitView({ padding: 0.15 });
        else if (typeof inst.setCenter === "function") {
          const n = nodes[0];
          inst.setCenter(n.position.x, n.position.y, { duration: 200 });
        }
      } catch {
        // ignore
      }
    }, 50);
    return () => clearTimeout(t);
  }, [nodes.length]);

  return (
    <div ref={reactFlowWrapper} style={{ width: "100%", height: "100vh", position: "relative" }}>
      <ReactFlow
        style={{ width: '100%', height: '100%' }}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onNodeClick={onNodeClick}
      >
        <Background />
      </ReactFlow>

      {/* Debug panel to inspect nodes/edges state inside the app */}
      <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: 8, zIndex: 9999, maxWidth: 360, fontSize: 12 }}>
        <div><strong>Debug</strong></div>
        <div>nodes.length: {nodes.length}</div>
        <div>edges.length: {edges.length}</div>
        <details style={{ color: '#ddd', maxHeight: 200, overflow: 'auto' }}>
          <summary>nodes JSON</summary>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#ddd' }}>{JSON.stringify(nodes, null, 2)}</pre>
        </details>
        <details style={{ color: '#ddd', maxHeight: 200, overflow: 'auto' }}>
          <summary>edges JSON</summary>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#ddd' }}>{JSON.stringify(edges, null, 2)}</pre>
        </details>
      </div>

      <form
        onSubmit={handleSubmit}
        id="inputform"
        style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.7)",
          color: "white",
          padding: 8,
          zIndex: 100,
        }}
      >
        <div>
          create node
          <label style={{ marginLeft: 8 }}>
            <input type="radio" name="make_node" value="yes" /> yes
          </label>
          <label style={{ marginLeft: 8 }}>
            <input type="radio" name="make_node" value="no" defaultChecked /> no
          </label>
        </div>

        <div style={{ marginTop: 8 }}>
          <label htmlFor="title">title</label>
          <input name="title" id="title" type="text" style={{ marginLeft: 8 }} />
        </div>

        <div style={{ marginTop: 8 }}>
          <input type="submit" value="enter" />
        </div>
      </form>
    </div>
  );
};

export default () => (
  <ReactFlowProvider>
    <AddNodeOnEdgeDrop />
  </ReactFlowProvider>
);

