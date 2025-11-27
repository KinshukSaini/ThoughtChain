"use client";
import React, { useCallback, useRef } from 'react';
import {
  Background,
  ReactFlow,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

const initialNodes = [
  {
    id: 0,
    type: 'input',
    data: { label: 'Node' },
    position: { x: 0, y: 50 },
  },
];


let id = 1;
const getId = () => id++;
const nodeOrigin: [number, number] = [0.5, 0];

const AddNodeOnEdgeDrop = () => {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const [x, setX] = React.useState(0);
  const [nodes, setNodes] = React.useState(initialNodes as any[]);
  const [currNode, setCurrNode] = React.useState<number | null>(0);
  const addNode = (position: { x: number; y: number }): void => {
    const newNode = {
      id: getId(),
      type: 'input',
      data: { label: 'New Node' },
      position: { x: position.x, y: position.y },
    };

    setNodes((nds: any) => nds.concat(newNode));
    setX(position.x + 50);
  };

  return (
    <div
      className="wrapper"
      style={{ width: '100%', height: '100vh' }}
    >
      <ReactFlow
        nodes={nodes.map((n) => ({ ...n, id: String(n.id) }))}
      >
        <Background />
      </ReactFlow>

			<form className='absolute text-white bottom-10 left-[50vw] p-2 bg-black z-100' onSubmit={() => addNode({ x: x + 20, y: 0 })}>
				<label htmlFor='ri'>make new node ? </label>
				<input id='ri' type='radio'/>
				<label>title </label>
				<input type="text" />

			</form>
			{/* <button onClick={() => addNode({ x: x + 20, y: 0 })} className='absolute text-white bottom-10 left-[50vw] p-2 bg-black z-100'>add node</button> */}
    </div>
  );
};

export default () => (
  <ReactFlowProvider>
    <AddNodeOnEdgeDrop />
  </ReactFlowProvider>
);
