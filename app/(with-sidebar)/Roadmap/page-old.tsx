'use client';

import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  BackgroundVariant,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import styles from './roadmap.module.css';

// UH Manoa Green Color Palette
const MANOA_COLORS = {
  primary: '#024731', // UH Manoa Dark Green
  secondary: '#0F7B0F', // UH Manoa Green
  light: '#3E8B3E', // Light Green
  accent: '#228B22', // Forest Green
  bg: '#F0F8F0', // Very Light Green
  text: '#1B4332', // Dark Green Text
  white: '#FFFFFF',
  border: '#6B8E23', // Olive Green
  course: '#3498db', // Blue for courses
  activity: '#e67e22', // Orange for activities/clubs
  internship: '#9b59b6', // Purple for internships
  milestone: '#f39c12', // Gold for milestones
};

// Define types for our node data
interface NodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  type?: 'course' | 'activity' | 'internship' | 'milestone' | 'start' | 'career';
  courses?: string[];
  activities?: string[];
  internships?: string[];
}

// Available pathways
const PATHWAYS = {
  engineering: 'Engineering',
  business: 'Business',
  medical: 'Pre-Medical',
  construction: 'Construction Management',
  computer_science: 'Computer Science',
  nursing: 'Nursing',
};

// Initial nodes for the roadmap - 4-Year College Timeline (Fall, Spring, Summer semesters)
const initialNodes: Node[] = [
  // Start
  {
    id: '1',
    type: 'input',
    data: { 
      label: '� Start College',
      description: 'Begin your academic journey'
    },
    position: { x: 50, y: 300 },
    className: styles.inputNode,
  },
  
  // YEAR 1 - Freshman
  {
    id: '2',
    data: { 
      label: '📚 Year 1 - Fall',
      description: 'Freshman Fall Semester\n• Intro to Programming\n• Calculus I\n• English Composition'
    },
    position: { x: 250, y: 50 },
    className: styles.defaultNode,
  },
  
  // Major Courses - Year 2
  {
    id: '3',
    data: { 
      label: '📖 Year 1 - Spring',
      description: 'Freshman Spring Semester\n• Data Structures\n• Calculus II\n• General Education'
    },
    position: { x: 450, y: 50 },
    className: styles.defaultNode,
  },
  
  // Major Courses - Year 3
  {
    id: '4',
    data: { 
      label: '☀️ Year 1 - Summer',
      description: 'Summer Break/Session\n• Optional: Intro Course\n• Or Summer Internship\n• Or Rest & Recharge'
    },
    position: { x: 650, y: 50 },
    className: styles.lightNode,
  },
  
  // YEAR 2 - Sophomore
  {
    id: '5',
    data: { 
      label: '🔬 Year 2 - Fall',
      description: 'Sophomore Fall Semester\n• Database Systems\n• Computer Networks\n• Statistics'
    },
    position: { x: 850, y: 50 },
    className: styles.defaultNode,
  },
  
  // Internship Track
  {
    id: '6',
    data: { 
      label: '� Year 2 - Spring',
      description: 'Sophomore Spring Semester\n• Web Development\n• Algorithms\n• Elective Course'
    },
    position: { x: 1050, y: 50 },
    className: styles.defaultNode,
  },
  {
    id: '7',
    data: { 
      label: '☀️ Year 2 - Summer',
      description: 'Summer Internship\n• First Industry Experience\n• Build Resume\n• Network with Professionals'
    },
    position: { x: 1250, y: 50 },
    className: styles.lightNode,
  },
  
  // YEAR 3 - Junior
  {
    id: '8',
    data: { 
      label: '🚀 Year 3 - Fall',
      description: 'Junior Fall Semester\n• Software Engineering\n• Cloud Computing\n• Mobile Development'
    },
    position: { x: 1450, y: 50 },
    className: styles.defaultNode,
  },
  {
    id: '9',
    data: { 
      label: '🎨 Year 3 - Spring',
      description: 'Junior Spring Semester\n• UI/UX Design\n• Advanced Databases\n• Capstone Project Start'
    },
    position: { x: 1650, y: 50 },
    className: styles.defaultNode,
  },
  
  {
    id: '10',
    data: { 
      label: '☀️ Year 3 - Summer',
      description: 'Advanced Internship\n• Second Industry Experience\n• Leadership Opportunities\n• Technical Depth'
    },
    position: { x: 1850, y: 50 },
    className: styles.lightNode,
  },
  // YEAR 4 - Senior
  {
    id: '11',
    data: { 
      label: '🎓 Year 4 - Fall',
      description: 'Senior Fall Semester\n• Senior Project\n• Elective Courses\n• Job Applications'
    },
    position: { x: 2050, y: 50 },
    className: styles.defaultNode,
  },
  {
    id: '12',
    data: { 
      label: '🌟 Year 4 - Spring',
      description: 'Senior Spring Semester\n• Complete Capstone\n• Interview Season\n• Graduate Preparation'
    },
    position: { x: 2250, y: 50 },
    className: styles.defaultNode,
  },
  {
    id: '13',
    data: { 
      label: '☀️ Year 4 - Summer',
      description: 'Graduation & Transition\n• Graduate!\n• Start Full-time Position\n• Begin Career Journey'
    },
    position: { x: 2450, y: 50 },
    className: styles.lightNode,
  },
  
  // Career Ready - Final
  {
    id: '14',
    type: 'output',
    data: { 
      label: '🎓 Career Ready',
      description: 'Complete degree\nStrong portfolio\nWork experience\nProfessional network\nJob offers!'
    },
    position: { x: 2700, y: 50 },
    className: styles.outputNode,
  },
];

// Initial edges connecting the nodes - Complete pathway
const initialEdges: Edge[] = [
  // Sequential timeline: Start → Year 1 → Year 2 → Year 3 → Year 4 → Career
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 },
    animated: true,
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 },
    animated: true,
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 },
    animated: true,
  },
  {
    id: 'e4-5',
    source: '4',
    target: '5',
    style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 },
    animated: true,
  },
  {
    id: 'e5-6',
    source: '5',
    target: '6',
    style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 },
    animated: true,
  },
  {
    id: 'e6-7',
    source: '6',
    target: '7',
    style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 },
    animated: true,
  },
  {
    id: 'e7-8',
    source: '7',
    target: '8',
    style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 },
    animated: true,
  },
  {
    id: 'e8-9',
    source: '8',
    target: '9',
    style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 },
    animated: true,
  },
  {
    id: 'e9-10',
    source: '9',
    target: '10',
    style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 },
    animated: true,
  },
  {
    id: 'e10-11',
    source: '10',
    target: '11',
    style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 },
    animated: true,
  },
  {
    id: 'e11-12',
    source: '11',
    target: '12',
    style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 },
    animated: true,
  },
  {
    id: 'e12-13',
    source: '12',
    target: '13',
    style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 },
    animated: true,
  },
  {
    id: 'e13-14',
    source: '13',
    target: '14',
    style: { stroke: MANOA_COLORS.accent, strokeWidth: 3 },
    animated: true,
  },
];

export default function RoadmapPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      const newEdge = {
        ...params,
        style: { stroke: MANOA_COLORS.border, strokeWidth: 2 },
      } as Edge;
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges],
  );

  // Add new node functionality
  const addNewNode = useCallback(() => {
    const newNode: Node = {
      id: `${Date.now()}`,
      data: { 
        label: '✨ New Step',
        description: 'Add your milestone'
      },
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      className: styles.lightNode,
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  // Node click handler
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null); // Clear edge selection when selecting a node
  }, []);

  // Edge click handler
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null); // Clear node selection when selecting an edge
  }, []);

  // Delete selected edge
  const deleteEdge = useCallback(() => {
    if (selectedEdge) {
      setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
      setSelectedEdge(null);
    }
  }, [selectedEdge, setEdges]);

  // Update edge style
  const updateEdgeStyle = useCallback((edgeId: string, styleKey: string, value: string | number | boolean) => {
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === edgeId
          ? { 
              ...edge, 
              style: { ...edge.style, [styleKey]: value },
              animated: styleKey === 'animated' ? value as boolean : edge.animated
            }
          : edge
      )
    );
    if (selectedEdge && selectedEdge.id === edgeId) {
      setSelectedEdge({ 
        ...selectedEdge, 
        style: { ...selectedEdge.style, [styleKey]: value },
        animated: styleKey === 'animated' ? value as boolean : selectedEdge.animated
      });
    }
  }, [setEdges, selectedEdge]);

  // Update node data
  const updateNodeData = useCallback((nodeId: string, field: string, value: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data as NodeData, [field]: value } }
          : node
      )
    );
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data as NodeData, [field]: value } });
    }
  }, [setNodes, selectedNode]);

  // Update node style (for color customization)
  const updateNodeStyle = useCallback((nodeId: string, styleUpdates: Partial<React.CSSProperties>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, style: { ...node.style, ...styleUpdates } }
          : node
      )
    );
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({ ...selectedNode, style: { ...selectedNode.style, ...styleUpdates } });
    }
  }, [setNodes, selectedNode]);

  return (
    <div className={`h-screen w-full flex flex-col ${styles.container}`}>
      {/* Header */}
      <div className={`bg-white shadow-md border-b-4 ${styles.header}`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold ${styles.headerTitle}`}>
                🌺 4-Year College Timeline
              </h1>
              <p className="text-gray-600 mt-2">
                Your complete academic journey: Fall, Spring, and Summer semesters across 4 years
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={addNewNode}
                className={`px-4 py-2 rounded-lg font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200 transform ${styles.addButton}`}
                type="button"
              >
                ➕ Add Step
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium border-2 transition-all duration-200 hover:shadow-lg ${styles.saveButton}`}
                type="button"
              >
                💾 Save Roadmap
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Floating Popup for Node Editing */}
        {selectedNode && !selectedEdge && (
          <div 
            className="absolute bg-white shadow-2xl border-4 border-green-600 rounded-lg p-4 z-50 max-h-[80vh] overflow-y-auto"
            // Centered positioning
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '320px',
            }}
          >
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className={`text-lg font-bold ${styles.sidebarTitle}`}>
                  ✏️ Edit Step
                </h3>
                <button
                  onClick={() => {
                    setSelectedNode(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                  type="button"
                >
                  ×
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label htmlFor="node-title" className="block text-xs font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    id="node-title"
                    type="text"
                    placeholder="Enter step title"
                    value={(selectedNode.data as NodeData).label || ''}
                    onChange={(e) => updateNodeData(selectedNode.id, 'label', e.target.value)}
                    className={`w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${styles.input}`}
                  />
                </div>
                <div>
                  <label htmlFor="node-description" className="block text-xs font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="node-description"
                    placeholder="Enter step description"
                    value={(selectedNode.data as NodeData).description || ''}
                    onChange={(e) => updateNodeData(selectedNode.id, 'description', e.target.value)}
                    rows={2}
                    className={`w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${styles.textarea}`}
                  />
                </div>
                <div>
                  <label htmlFor="node-bg-color" className="block text-xs font-medium text-gray-700 mb-1">
                    Background
                  </label>
                  <select
                    id="node-bg-color"
                    value={selectedNode.style?.backgroundColor || MANOA_COLORS.secondary}
                    onChange={(e) => updateNodeStyle(selectedNode.id, { backgroundColor: e.target.value })}
                    className={`w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${styles.input}`}
                  >
                    <option value={MANOA_COLORS.primary}>Primary Green</option>
                    <option value={MANOA_COLORS.secondary}>Secondary Green</option>
                    <option value={MANOA_COLORS.light}>Light Green</option>
                    <option value={MANOA_COLORS.accent}>Forest Green</option>
                    <option value="#4A90E2">Blue</option>
                    <option value="#9B59B6">Purple</option>
                    <option value="#E74C3C">Red</option>
                    <option value="#F39C12">Orange</option>
                    <option value="#1ABC9C">Teal</option>
                    <option value="#34495E">Dark Gray</option>
                    <option value="#ECF0F1">Light Gray</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="node-text-color" className="block text-xs font-medium text-gray-700 mb-1">
                    Text Color
                  </label>
                  <select
                    id="node-text-color"
                    value={selectedNode.style?.color || '#ffffff'}
                    onChange={(e) => updateNodeStyle(selectedNode.id, { color: e.target.value })}
                    className={`w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${styles.input}`}
                  >
                    <option value="#ffffff">White</option>
                    <option value="#000000">Black</option>
                    <option value={MANOA_COLORS.text}>Dark Green</option>
                    <option value="#333333">Dark Gray</option>
                    <option value="#666666">Gray</option>
                    <option value="#ECF0F1">Light Gray</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="node-border-color" className="block text-xs font-medium text-gray-700 mb-1">
                    Border
                  </label>
                  <select
                    id="node-border-color"
                    value={selectedNode.style?.borderColor || MANOA_COLORS.border}
                    onChange={(e) => updateNodeStyle(selectedNode.id, { borderColor: e.target.value })}
                    className={`w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${styles.input}`}
                  >
                    <option value={MANOA_COLORS.primary}>Primary Green</option>
                    <option value={MANOA_COLORS.secondary}>Secondary Green</option>
                    <option value={MANOA_COLORS.border}>Olive Green</option>
                    <option value="#4A90E2">Blue</option>
                    <option value="#9B59B6">Purple</option>
                    <option value="#E74C3C">Red</option>
                    <option value="#F39C12">Orange</option>
                    <option value="#000000">Black</option>
                    <option value="#666666">Gray</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Popup for Edge Editing */}
        {selectedEdge && !selectedNode && (
          <div 
            className="absolute bg-white shadow-2xl border-4 border-blue-600 rounded-lg p-4 z-50"
            // Centered positioning
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '300px',
            }}
          >
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className={`text-lg font-bold ${styles.sidebarTitle}`}>
                  🔗 Edit Connection
                </h3>
                <button
                  onClick={() => {
                    setSelectedEdge(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                  type="button"
                >
                  ×
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label htmlFor="edge-color" className="block text-xs font-medium text-gray-700 mb-1">
                    Line Color
                  </label>
                  <select
                    id="edge-color"
                    value={selectedEdge.style?.stroke || MANOA_COLORS.border}
                    onChange={(e) => updateEdgeStyle(selectedEdge.id, 'stroke', e.target.value)}
                    className={`w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${styles.input}`}
                  >
                    <option value={MANOA_COLORS.primary}>Primary Green</option>
                    <option value={MANOA_COLORS.secondary}>Secondary Green</option>
                    <option value={MANOA_COLORS.light}>Light Green</option>
                    <option value={MANOA_COLORS.accent}>Forest Green</option>
                    <option value={MANOA_COLORS.border}>Olive Green</option>
                    <option value="#000000">Black</option>
                    <option value="#666666">Gray</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="edge-width" className="block text-xs font-medium text-gray-700 mb-1">
                    Width: {selectedEdge.style?.strokeWidth || 2}px
                  </label>
                  <input
                    id="edge-width"
                    type="range"
                    min="1"
                    max="6"
                    value={selectedEdge.style?.strokeWidth || 2}
                    onChange={(e) => updateEdgeStyle(selectedEdge.id, 'strokeWidth', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    id="edge-animated"
                    type="checkbox"
                    checked={selectedEdge.animated || false}
                    onChange={(e) => updateEdgeStyle(selectedEdge.id, 'animated', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="edge-animated" className="text-xs font-medium text-gray-700">
                    Animated
                  </label>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={deleteEdge}
                    className="flex-1 px-3 py-2 text-sm rounded-md font-medium text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
                    type="button"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* React Flow Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={() => {
              setSelectedNode(null);
              setSelectedEdge(null);
            }}
            connectionMode={ConnectionMode.Loose}
            fitView
            fitViewOptions={{ padding: 0.2 }}
          >
            <Controls className={styles.controls} />
            <MiniMap 
              className={styles.minimap}
              maskColor={MANOA_COLORS.bg}
              nodeColor={(node) => {
                if (node.type === 'input') return MANOA_COLORS.primary;
                if (node.type === 'output') return MANOA_COLORS.accent;
                return MANOA_COLORS.secondary;
              }}
            />
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={2} 
              color={MANOA_COLORS.border}
            />
          </ReactFlow>
        </div>
      </div>

      {/* Footer */}
      <div className={`bg-white border-t-4 p-4 ${styles.footer}`}>
        <div className="max-w-7xl mx-auto">
          <p className={`text-center text-sm ${styles.footerText}`}>
            � Interactive 4-Year Timeline: Click semesters to customize • Edit connections • Drag nodes • Plan your complete college journey �
          </p>
        </div>
      </div>
    </div>
  );
}
