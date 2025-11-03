'use client';

import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
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
import { Button } from "@/app/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/app/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

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

// Pathway types matching the database schema
interface Course {
  name: string;
  credits: number;
}

interface Semester {
  semester_name: string;
  credits: number;
  courses: Course[];
  activities?: string[];
  internships?: string[];
  milestones?: string[];
}

interface Year {
  year_number: number;
  semesters: Semester[];
}

interface PathwayData {
  program_name: string;
  institution: string;
  total_credits: number;
  years: Year[];
}

interface PathwayRecord {
  id: number;
  programName: string;
  institution: string;
  totalCredits: string;
  pathwayData?: PathwayData;
  createdAt: Date;
  updatedAt: Date;
}

// Map semester names to display names
const SEMESTER_NAMES: Record<string, string> = {
  fall_semester: '🍂 Fall',
  spring_semester: '🌸 Spring',
  summer_semester: '☀️ Summer',
};

// Helper function to create comprehensive semester nodes
function createSemesterNode(
  id: string,
  semester: string,
  year: number,
  position: { x: number; y: number },
  data: {
    courses: string[];
    activities?: string[];
    internships?: string[];
    milestones?: string[];
  }
): Node {
  const coursesList = data.courses.map(c => `📚 ${c}`).join('\n');
  const activitiesList = data.activities ? data.activities.map(a => `🎯 ${a}`).join('\n') : '';
  const internshipsList = data.internships ? data.internships.map(i => `💼 ${i}`).join('\n') : '';
  const milestonesList = data.milestones ? data.milestones.map(m => `⭐ ${m}`).join('\n') : '';
  
  const description = [
    coursesList,
    activitiesList && `\nActivities:\n${activitiesList}`,
    internshipsList && `\nWork Experience:\n${internshipsList}`,
    milestonesList && `\nMilestones:\n${milestonesList}`,
  ].filter(Boolean).join('\n');

  return {
    id,
    data: {
      label: `${semester} - Year ${year}`,
      description,
      courses: data.courses,
      activities: data.activities || [],
      internships: data.internships || [],
      type: 'course' as const,
    },
    position,
    className: styles.semesterNode,
    style: {
      backgroundColor: MANOA_COLORS.course,
      color: '#ffffff',
      border: `3px solid ${MANOA_COLORS.primary}`,
      borderRadius: '12px',
      padding: '15px',
      minWidth: '280px',
      fontSize: '14px',
    },
  };
}

// Convert pathway data to nodes and edges
function pathwayToNodesAndEdges(pathwayData: PathwayData): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Start Node
  nodes.push({
    id: 'start',
    type: 'input',
    data: { 
      label: '🎓 Start College Journey',
      description: `Begin your path at ${pathwayData.institution}\n${pathwayData.program_name}`,
      type: 'start',
    },
    position: { x: 50, y: 400 },
    className: styles.inputNode,
    style: {
      backgroundColor: MANOA_COLORS.primary,
      color: '#ffffff',
      border: `4px solid ${MANOA_COLORS.accent}`,
      borderRadius: '15px',
      padding: '20px',
      fontSize: '16px',
      fontWeight: 'bold',
    },
  });

  // Position configuration
  const xOffset = 400;
  const xSpacing = 350;
  const yOffset = 50;
  const ySpacing = 300;

  // Generate nodes for each year and semester
  pathwayData.years.forEach((year) => {
    year.semesters.forEach((semester, semesterIndex) => {
      const semesterKey = semester.semester_name;
      const semesterDisplay = SEMESTER_NAMES[semesterKey] || semester.semester_name;
      
      // Create node ID
      const nodeId = `y${year.year_number}-${semesterKey}`;
      
      // Calculate position
      const x = xOffset + (semesterIndex * xSpacing);
      const y = yOffset + ((year.year_number - 1) * ySpacing);

      // Format course list
      const courses = semester.courses.map(c => `${c.name} (${c.credits} cr)`);

      // Create semester node
      nodes.push(createSemesterNode(
        nodeId,
        semesterDisplay,
        year.year_number,
        { x, y },
        {
          courses,
          activities: semester.activities,
          internships: semester.internships,
          milestones: semester.milestones,
        }
      ));

      // Create edges connecting semesters
      if (semesterIndex > 0) {
        // Connect to previous semester in same year
        const prevNodeId = `y${year.year_number}-${year.semesters[semesterIndex - 1].semester_name}`;
        edges.push({
          id: `e-${prevNodeId}-${nodeId}`,
          source: prevNodeId,
          target: nodeId,
          style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 },
          animated: true,
        });
      } else if (year.year_number > 1) {
        // Connect to last semester of previous year
        const prevYear = pathwayData.years.find(y => y.year_number === year.year_number - 1);
        if (prevYear && prevYear.semesters.length > 0) {
          const lastSemesterOfPrevYear = prevYear.semesters[prevYear.semesters.length - 1];
          const prevNodeId = `y${prevYear.year_number}-${lastSemesterOfPrevYear.semester_name}`;
          edges.push({
            id: `e-${prevNodeId}-${nodeId}`,
            source: prevNodeId,
            target: nodeId,
            style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 },
            animated: true,
          });
        }
      } else if (year.year_number === 1 && semesterIndex === 0) {
        // Connect start to first semester
        edges.push({
          id: `e-start-${nodeId}`,
          source: 'start',
          target: nodeId,
          style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 },
          animated: true,
        });
      }
    });
  });

  // Career Ready Node
  const lastYear = pathwayData.years[pathwayData.years.length - 1];
  const lastSemester = lastYear.semesters[lastYear.semesters.length - 1];
  const lastNodeId = `y${lastYear.year_number}-${lastSemester.semester_name}`;
  
  nodes.push({
    id: 'career',
    type: 'output',
    data: { 
      label: '🎯 Career Ready!',
      description: `✅ ${pathwayData.program_name} Complete\n💼 Work Experience\n🤝 Professional Network\n📊 Strong Portfolio\n🚀 Job Offers!\n🌟 Ready for Industry`,
      type: 'career',
    },
    position: { x: xOffset + (3 * xSpacing), y: yOffset + ((lastYear.year_number - 1) * ySpacing) },
    className: styles.outputNode,
    style: {
      backgroundColor: MANOA_COLORS.accent,
      color: '#ffffff',
      border: `4px solid ${MANOA_COLORS.primary}`,
      borderRadius: '15px',
      padding: '20px',
      minWidth: '250px',
      fontSize: '16px',
      fontWeight: 'bold',
    },
  });

  // Connect last semester to career
  edges.push({
    id: `e-${lastNodeId}-career`,
    source: lastNodeId,
    target: 'career',
    style: { stroke: MANOA_COLORS.accent, strokeWidth: 4 },
    animated: true,
  });

  return { nodes, edges };
}

// Initial nodes for the roadmap - Comprehensive College Journey
const getInitialNodes = (): Node[] => [
  // Start Node
  {
    id: 'start',
    type: 'input',
    data: { 
      label: '🎓 Start College Journey',
      description: 'Begin your path at University of Hawaii\nChoose your major and set your goals',
      type: 'start',
    },
    position: { x: 50, y: 400 },
    className: styles.inputNode,
    style: {
      backgroundColor: MANOA_COLORS.primary,
      color: '#ffffff',
      border: `4px solid ${MANOA_COLORS.accent}`,
      borderRadius: '15px',
      padding: '20px',
      fontSize: '16px',
      fontWeight: 'bold',
    },
  },

  // FRESHMAN YEAR (Year 1)
  createSemesterNode('y1-fall', '🍂 Fall', 1, { x: 400, y: 50 }, {
    courses: ['ENG 100 - Composition I', 'MATH 140 - Calculus I', 'ICS 111 - Intro to CS', 'General Education'],
    activities: ['Join 2-3 clubs', 'Attend orientation events', 'Meet with academic advisor'],
    milestones: ['Declare major', 'Build study routine'],
  }),

  createSemesterNode('y1-spring', '🌸 Spring', 1, { x: 750, y: 50 }, {
    courses: ['ENG 200 - Writing Workshop', 'MATH 141 - Calculus II', 'ICS 211 - Data Structures', 'GE Course'],
    activities: ['Leadership position in club', 'Volunteer work', 'Join professional org'],
    internships: ['Part-time campus job'],
    milestones: ['Complete prerequisites', 'Network with professors'],
  }),

  createSemesterNode('y1-summer', '☀️ Summer', 1, { x: 1100, y: 50 }, {
    courses: ['Optional: Light course load or rest'],
    activities: ['Community service', 'Skill development workshops'],
    internships: ['Summer job or internship search prep'],
    milestones: ['Prepare resume', 'Build portfolio start'],
  }),

  // SOPHOMORE YEAR (Year 2)
  createSemesterNode('y2-fall', '🍂 Fall', 2, { x: 400, y: 350 }, {
    courses: ['ICS 311 - Algorithms', 'ICS 314 - Software Engineering', 'PHYS 170 - Physics I', 'Elective'],
    activities: ['Hackathons', 'Study groups', 'Professional workshops'],
    internships: ['Part-time tech role'],
    milestones: ['Build GitHub portfolio', 'Technical interview prep'],
  }),

  createSemesterNode('y2-spring', '🌸 Spring', 2, { x: 750, y: 350 }, {
    courses: ['ICS 321 - Database Systems', 'ICS 332 - Operating Systems', 'MATH 307 - Linear Algebra', 'Elective'],
    activities: ['Club leadership role', 'Attend tech conferences'],
    internships: ['Apply for summer internships'],
    milestones: ['Complete core courses', 'Network in industry'],
  }),

  createSemesterNode('y2-summer', '☀️ Summer', 2, { x: 1100, y: 350 }, {
    courses: [],
    activities: ['Professional development seminars'],
    internships: ['First major internship', 'Company experience', 'Build professional network'],
    milestones: ['Real-world project completion', 'Industry connections established'],
  }),

  // JUNIOR YEAR (Year 3)
  createSemesterNode('y3-fall', '🍂 Fall', 3, { x: 400, y: 650 }, {
    courses: ['ICS 414 - Software Engineering II', 'ICS 415 - Mobile App Dev', 'ICS Elective', 'Technical Elective'],
    activities: ['Lead club projects', 'Mentor freshmen', 'Research opportunities'],
    internships: ['Part-time position in field'],
    milestones: ['Capstone project start', 'Build specialization'],
  }),

  createSemesterNode('y3-spring', '🌸 Spring', 3, { x: 750, y: 650 }, {
    courses: ['ICS 435 - Security & Trust', 'ICS 451 - Network Design', 'Advanced Elective', 'GE Course'],
    activities: ['Professional presentations', 'Conference attendance', 'Industry panels'],
    internships: ['Apply for advanced internships'],
    milestones: ['Complete major requirements', 'Career planning sessions'],
  }),

  createSemesterNode('y3-summer', '☀️ Summer', 3, { x: 1100, y: 650 }, {
    courses: [],
    activities: ['Industry networking events'],
    internships: ['Advanced internship role', 'Leadership opportunities', 'Return offer pursuit'],
    milestones: ['Technical depth achievement', 'Industry credibility built'],
  }),

  // SENIOR YEAR (Year 4)
  createSemesterNode('y4-fall', '🍂 Fall', 4, { x: 400, y: 950 }, {
    courses: ['ICS 499 - Capstone Project', 'ICS Elective', 'Free Elective', 'GE Course'],
    activities: ['Career fairs', 'Mock interviews', 'Alumni networking'],
    internships: ['Part-time or final internship'],
    milestones: ['Job applications sent', 'Interview rounds', 'Complete capstone'],
  }),

  createSemesterNode('y4-spring', '🌸 Spring', 4, { x: 750, y: 950 }, {
    courses: ['Final Electives', 'Complete remaining credits', 'Capstone presentation'],
    activities: ['Graduation preparation', 'Final presentations', 'Senior send-off events'],
    internships: ['Accept job offers', 'Negotiate salary'],
    milestones: ['Finish degree requirements', 'Job offer acceptance'],
  }),

  createSemesterNode('y4-summer', '☀️ Summer', 4, { x: 1100, y: 950 }, {
    courses: [],
    activities: ['Graduation ceremonies', 'Celebrate achievements', 'Alumni transition'],
    internships: ['Start full-time position', 'Onboarding process'],
    milestones: ['Graduate!', 'Career transition', 'Professional life begins'],
  }),

  // Career Ready Node
  {
    id: 'career',
    type: 'output',
    data: { 
      label: '🎯 Career Ready!',
      description: '✅ Degree Complete\n💼 Work Experience\n🤝 Professional Network\n📊 Strong Portfolio\n🚀 Job Offers!\n🌟 Ready for Industry',
      type: 'career',
    },
    position: { x: 1450, y: 500 },
    className: styles.outputNode,
    style: {
      backgroundColor: MANOA_COLORS.accent,
      color: '#ffffff',
      border: `4px solid ${MANOA_COLORS.primary}`,
      borderRadius: '15px',
      padding: '20px',
      minWidth: '250px',
      fontSize: '16px',
      fontWeight: 'bold',
    },
  },
];

// Initial edges connecting the nodes - Complete pathway
const getInitialEdges = (): Edge[] => [
  // Start to Year 1
  { id: 'e-start-y1f', source: 'start', target: 'y1-fall', style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 }, animated: true },
  
  // Year 1 connections
  { id: 'e-y1f-y1s', source: 'y1-fall', target: 'y1-spring', style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 }, animated: true },
  { id: 'e-y1s-y1sum', source: 'y1-spring', target: 'y1-summer', style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 }, animated: true },
  { id: 'e-y1sum-y2f', source: 'y1-summer', target: 'y2-fall', style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 }, animated: true },
  
  // Year 2 connections
  { id: 'e-y2f-y2s', source: 'y2-fall', target: 'y2-spring', style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 }, animated: true },
  { id: 'e-y2s-y2sum', source: 'y2-spring', target: 'y2-summer', style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 }, animated: true },
  { id: 'e-y2sum-y3f', source: 'y2-summer', target: 'y3-fall', style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 }, animated: true },
  
  // Year 3 connections
  { id: 'e-y3f-y3s', source: 'y3-fall', target: 'y3-spring', style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 }, animated: true },
  { id: 'e-y3s-y3sum', source: 'y3-spring', target: 'y3-summer', style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 }, animated: true },
  { id: 'e-y3sum-y4f', source: 'y3-summer', target: 'y4-fall', style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 }, animated: true },
  
  // Year 4 connections
  { id: 'e-y4f-y4s', source: 'y4-fall', target: 'y4-spring', style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 }, animated: true },
  { id: 'e-y4s-y4sum', source: 'y4-spring', target: 'y4-summer', style: { stroke: MANOA_COLORS.primary, strokeWidth: 3 }, animated: true },
  { id: 'e-y4sum-career', source: 'y4-summer', target: 'career', style: { stroke: MANOA_COLORS.accent, strokeWidth: 4 }, animated: true },
];

export default function RoadmapPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [selectedPathway, setSelectedPathway] = useState<string>('');
  const [availablePathways, setAvailablePathways] = useState<PathwayRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Load available pathways on mount
  useEffect(() => {
    const loadPathways = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/pathways');
        if (!response.ok) {
          throw new Error('Failed to fetch pathways');
        }
        const pathways = await response.json();
        setAvailablePathways(pathways);
        
        // Auto-select first pathway if available
        if (pathways.length > 0 && !selectedPathway) {
          setSelectedPathway(pathways[0].programName);
        }
      } catch (err) {
        console.error('Error loading pathways:', err);
        setError('Failed to load pathways');
        // Fall back to default nodes if loading fails
        const defaultNodesEdges = { nodes: getInitialNodes(), edges: getInitialEdges() };
        setNodes(defaultNodesEdges.nodes);
        setEdges(defaultNodesEdges.edges);
      } finally {
        setIsLoading(false);
      }
    };

    loadPathways();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load pathway data when selection changes
  useEffect(() => {
    const loadPathwayData = async () => {
      if (!selectedPathway) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/pathways?programName=${encodeURIComponent(selectedPathway)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch pathway data');
        }
        const pathwayRecord = await response.json();
        
        if (pathwayRecord.pathwayData) {
          const { nodes: newNodes, edges: newEdges } = pathwayToNodesAndEdges(pathwayRecord.pathwayData);
          setNodes(newNodes);
          setEdges(newEdges);
        }
      } catch (err) {
        console.error('Error loading pathway data:', err);
        setError('Failed to load pathway details');
      } finally {
        setIsLoading(false);
      }
    };

    loadPathwayData();
  }, [selectedPathway]); // eslint-disable-line react-hooks/exhaustive-deps

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
      id: `custom-${Date.now()}`,
      data: { 
        label: '✨ New Step',
        description: 'Add your milestone, course, or activity',
        type: 'milestone',
      },
      position: { 
        x: Math.random() * 400 + 400, 
        y: Math.random() * 300 + 400 
      },
      className: styles.lightNode,
      style: {
        backgroundColor: MANOA_COLORS.milestone,
        color: '#ffffff',
        border: `2px solid ${MANOA_COLORS.primary}`,
        borderRadius: '10px',
        padding: '12px',
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  // Node click handler
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  // Edge click handler
  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
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

  // Update node style
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
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold ${styles.headerTitle}`}>
                🌺 UH Academic Journey Roadmap
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                {isLoading ? 'Loading pathways...' : 'Complete 4-year pathway: Courses • Activities • Internships • Career Ready'}
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[400px] justify-between text-xs border-2 border-green-600"
                    disabled={isLoading || availablePathways.length === 0}
                  >
                    <span className="truncate flex-1 text-left">
                      {selectedPathway
                        ? availablePathways.find((pathway) => pathway.programName === selectedPathway)?.programName
                        : "Select pathway..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search pathways..." />
                    <CommandList>
                      <CommandEmpty>No pathway found.</CommandEmpty>
                      <CommandGroup>
                        {availablePathways.map((pathway) => (
                          <CommandItem
                            key={pathway.id}
                            value={pathway.programName}
                            onSelect={(currentValue) => {
                              setSelectedPathway(currentValue === selectedPathway ? "" : currentValue);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedPathway === pathway.programName ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {pathway.programName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <button
                onClick={addNewNode}
                className={`px-4 py-2 rounded-lg font-medium text-white text-sm shadow-lg hover:shadow-xl transition-all duration-200 transform ${styles.addButton}`}
                type="button"
                disabled={isLoading}
              >
                ➕ Add Step
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium text-sm border-2 transition-all duration-200 hover:shadow-lg ${styles.saveButton}`}
                type="button"
                disabled={isLoading}
              >
                💾 Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white border-b px-4 py-2">
        <div className="max-w-7xl mx-auto flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded ${styles.legendCourse}`}></div>
            <span>Courses</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded ${styles.legendActivity}`}></div>
            <span>🎯 Activities/Clubs</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded ${styles.legendInternship}`}></div>
            <span>💼 Internships</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded ${styles.legendMilestone}`}></div>
            <span>⭐ Milestones</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Floating Popup for Node Editing */}
        {selectedNode && !selectedEdge && (
          <div 
            className={`${styles.popup} absolute bg-white shadow-2xl border-4 border-green-600 rounded-lg p-4 z-50 max-h-[80vh] overflow-y-auto`}
          >
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className={`text-lg font-bold ${styles.sidebarTitle}`}>
                  ✏️ Edit Step
                </h3>
                <button
                  onClick={() => setSelectedNode(null)}
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
                    placeholder="Enter courses, activities, internships..."
                    value={(selectedNode.data as NodeData).description || ''}
                    onChange={(e) => updateNodeData(selectedNode.id, 'description', e.target.value)}
                    rows={6}
                    className={`w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${styles.textarea}`}
                  />
                </div>
                <div>
                  <label htmlFor="node-bg-color" className="block text-xs font-medium text-gray-700 mb-1">
                    Background Color
                  </label>
                  <select
                    id="node-bg-color"
                    value={selectedNode.style?.backgroundColor || MANOA_COLORS.course}
                    onChange={(e) => updateNodeStyle(selectedNode.id, { backgroundColor: e.target.value })}
                    className={`w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${styles.input}`}
                  >
                    <option value={MANOA_COLORS.primary}>Primary Green</option>
                    <option value={MANOA_COLORS.secondary}>Secondary Green</option>
                    <option value={MANOA_COLORS.course}>Blue (Courses)</option>
                    <option value={MANOA_COLORS.activity}>Orange (Activities)</option>
                    <option value={MANOA_COLORS.internship}>Purple (Internships)</option>
                    <option value={MANOA_COLORS.milestone}>Gold (Milestones)</option>
                    <option value="#E74C3C">Red</option>
                    <option value="#1ABC9C">Teal</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Popup for Edge Editing */}
        {selectedEdge && !selectedNode && (
          <div 
            className={`${styles.popup} absolute bg-white shadow-2xl border-4 border-blue-600 rounded-lg p-4 z-50`}
          >
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className={`text-lg font-bold ${styles.sidebarTitle}`}>
                  🔗 Edit Connection
                </h3>
                <button
                  onClick={() => setSelectedEdge(null)}
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
                    value={selectedEdge.style?.stroke || MANOA_COLORS.primary}
                    onChange={(e) => updateEdgeStyle(selectedEdge.id, 'stroke', e.target.value)}
                    className={`w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${styles.input}`}
                  >
                    <option value={MANOA_COLORS.primary}>Primary Green</option>
                    <option value={MANOA_COLORS.secondary}>Secondary Green</option>
                    <option value={MANOA_COLORS.accent}>Forest Green</option>
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
                <button
                  onClick={deleteEdge}
                  className="w-full px-3 py-2 text-sm rounded-md font-medium text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
                  type="button"
                >
                  🗑️ Delete Connection
                </button>
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
            minZoom={0.1}
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
            translateExtent={[[-500, -500], [3000, 1500]]}
            nodeExtent={[[-500, -500], [3000, 1500]]}
          >
            <Controls className={styles.controls} />
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
      <div className={`bg-white border-t-4 p-3 ${styles.footer}`}>
        <div className="max-w-7xl mx-auto">
          <p className={`text-center text-sm ${styles.footerText}`}>
            📚 Interactive Journey: Click nodes to view/edit details • Drag to rearrange • Connect pathways • Track your complete college experience 🎓
          </p>
        </div>
      </div>
    </div>
  );
}
