module.exports = [
"[project]/app/(with-sidebar)/Roadmap/roadmap.module.css [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "addButton": "roadmap-module__UgUpcG__addButton",
  "container": "roadmap-module__UgUpcG__container",
  "controls": "roadmap-module__UgUpcG__controls",
  "defaultNode": "roadmap-module__UgUpcG__defaultNode",
  "doneButton": "roadmap-module__UgUpcG__doneButton",
  "footer": "roadmap-module__UgUpcG__footer",
  "footerText": "roadmap-module__UgUpcG__footerText",
  "header": "roadmap-module__UgUpcG__header",
  "headerTitle": "roadmap-module__UgUpcG__headerTitle",
  "input": "roadmap-module__UgUpcG__input",
  "inputNode": "roadmap-module__UgUpcG__inputNode",
  "lightNode": "roadmap-module__UgUpcG__lightNode",
  "minimap": "roadmap-module__UgUpcG__minimap",
  "nodeBase": "roadmap-module__UgUpcG__nodeBase",
  "outputNode": "roadmap-module__UgUpcG__outputNode",
  "saveButton": "roadmap-module__UgUpcG__saveButton",
  "sidebar": "roadmap-module__UgUpcG__sidebar",
  "sidebarTitle": "roadmap-module__UgUpcG__sidebarTitle",
  "textarea": "roadmap-module__UgUpcG__textarea",
});
}),
"[project]/app/(with-sidebar)/Roadmap/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RoadmapPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/react/dist/esm/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/system/dist/esm/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$with$2d$sidebar$292f$Roadmap$2f$roadmap$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/app/(with-sidebar)/Roadmap/roadmap.module.css [app-ssr] (css module)");
'use client';
;
;
;
;
;
// UH Manoa Green Color Palette
const MANOA_COLORS = {
    primary: '#024731',
    secondary: '#0F7B0F',
    light: '#3E8B3E',
    accent: '#228B22',
    bg: '#F0F8F0',
    text: '#1B4332',
    white: '#FFFFFF',
    border: '#6B8E23'
};
// Initial nodes for the roadmap
const initialNodes = [
    {
        id: '1',
        type: 'input',
        data: {
            label: '🎯 Start Your Journey',
            description: 'Define your career goals'
        },
        position: {
            x: 250,
            y: 25
        },
        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$with$2d$sidebar$292f$Roadmap$2f$roadmap$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].inputNode
    },
    {
        id: '2',
        data: {
            label: '📚 Foundation Courses',
            description: 'Core prerequisites'
        },
        position: {
            x: 100,
            y: 150
        },
        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$with$2d$sidebar$292f$Roadmap$2f$roadmap$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].defaultNode
    },
    {
        id: '3',
        data: {
            label: '🔬 Specialized Track',
            description: 'Choose your specialization'
        },
        position: {
            x: 400,
            y: 150
        },
        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$with$2d$sidebar$292f$Roadmap$2f$roadmap$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].defaultNode
    },
    {
        id: '4',
        data: {
            label: '💼 Internship',
            description: 'Gain practical experience'
        },
        position: {
            x: 150,
            y: 275
        },
        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$with$2d$sidebar$292f$Roadmap$2f$roadmap$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lightNode
    },
    {
        id: '5',
        data: {
            label: '🚀 Advanced Projects',
            description: 'Build your portfolio'
        },
        position: {
            x: 350,
            y: 275
        },
        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$with$2d$sidebar$292f$Roadmap$2f$roadmap$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lightNode
    },
    {
        id: '6',
        type: 'output',
        data: {
            label: '🎓 Career Ready',
            description: 'Achieve your goals'
        },
        position: {
            x: 250,
            y: 400
        },
        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$with$2d$sidebar$292f$Roadmap$2f$roadmap$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].outputNode
    }
];
// Initial edges connecting the nodes
const initialEdges = [
    {
        id: 'e1-2',
        source: '1',
        target: '2',
        style: {
            stroke: MANOA_COLORS.primary,
            strokeWidth: 3
        },
        animated: true
    },
    {
        id: 'e1-3',
        source: '1',
        target: '3',
        style: {
            stroke: MANOA_COLORS.primary,
            strokeWidth: 3
        },
        animated: true
    },
    {
        id: 'e2-4',
        source: '2',
        target: '4',
        style: {
            stroke: MANOA_COLORS.secondary,
            strokeWidth: 2
        }
    },
    {
        id: 'e3-5',
        source: '3',
        target: '5',
        style: {
            stroke: MANOA_COLORS.secondary,
            strokeWidth: 2
        }
    },
    {
        id: 'e4-6',
        source: '4',
        target: '6',
        style: {
            stroke: MANOA_COLORS.light,
            strokeWidth: 2
        }
    },
    {
        id: 'e5-6',
        source: '5',
        target: '6',
        style: {
            stroke: MANOA_COLORS.light,
            strokeWidth: 2
        }
    }
];
function RoadmapPage() {
    const [nodes, setNodes, onNodesChange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useNodesState"])(initialNodes);
    const [edges, setEdges, onEdgesChange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useEdgesState"])(initialEdges);
    const [selectedNode, setSelectedNode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const onConnect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((params)=>{
        const newEdge = {
            ...params,
            style: {
                stroke: MANOA_COLORS.border,
                strokeWidth: 2
            }
        };
        setEdges((eds)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addEdge"])(newEdge, eds));
    }, [
        setEdges
    ]);
    // Add new node functionality
    const addNewNode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const newNode = {
            id: `${Date.now()}`,
            data: {
                label: '✨ New Step',
                description: 'Add your milestone'
            },
            position: {
                x: Math.random() * 400 + 100,
                y: Math.random() * 300 + 100
            },
            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$with$2d$sidebar$292f$Roadmap$2f$roadmap$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lightNode
        };
        setNodes((nds)=>[
                ...nds,
                newNode
            ]);
    }, [
        setNodes
    ]);
    // Node click handler
    const onNodeClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((event, node)=>{
        setSelectedNode(node);
    }, []);
    // Update node data
    const updateNodeData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((nodeId, field, value)=>{
        setNodes((nds)=>nds.map((node)=>node.id === nodeId ? {
                    ...node,
                    data: {
                        ...node.data,
                        [field]: value
                    }
                } : node));
        if (selectedNode && selectedNode.id === nodeId) {
            setSelectedNode({
                ...selectedNode,
                data: {
                    ...selectedNode.data,
                    [field]: value
                }
            });
        }
    }, [
        setNodes,
        selectedNode
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `h-screen w-full flex flex-col ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$with$2d$sidebar$292f$Roadmap$2f$roadmap$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].container}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `bg-white shadow-md border-b-4 ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$with$2d$sidebar$292f$Roadmap$2f$roadmap$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].header}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-7xl mx-auto px-4 py-6",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-between items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: `text-3xl font-bold ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$with$2d$sidebar$292f$Roadmap$2f$roadmap$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].headerTitle}`,
                                        children: "🌺 Your Academic Roadmap"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                                        lineNumber: 200,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-600 mt-2",
                                        children: "Plan your path to success with an interactive roadmap"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                                        lineNumber: 203,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                                lineNumber: 199,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: addNewNode,
                                        className: `px-4 py-2 rounded-lg font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200 transform ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$with$2d$sidebar$292f$Roadmap$2f$roadmap$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].addButton}`,
                                        type: "button",
                                        children: "➕ Add Step"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                                        lineNumber: 208,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: `px-4 py-2 rounded-lg font-medium border-2 transition-all duration-200 hover:shadow-lg ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$with$2d$sidebar$292f$Roadmap$2f$roadmap$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].saveButton}`,
                                        type: "button",
                                        children: "💾 Save Roadmap"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                                        lineNumber: 215,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                                lineNumber: 207,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                        lineNumber: 198,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                    lineNumber: 197,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                lineNumber: 196,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex",
                children: [
                    selectedNode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `w-80 bg-white shadow-lg border-r-4 p-6 ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$with$2d$sidebar$292f$Roadmap$2f$roadmap$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sidebar}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: `text-xl font-bold mb-2 ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$with$2d$sidebar$292f$Roadmap$2f$roadmap$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sidebarTitle}`,
                                    children: "Edit Step"
                                }, void 0, false, {
                                    fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                                    lineNumber: 232,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "node-title",
                                                    className: "block text-sm font-medium text-gray-700 mb-1",
                                                    children: "Title"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                                                    lineNumber: 237,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    id: "node-title",
                                                    type: "text",
                                                    placeholder: "Enter step title",
                                                    value: selectedNode.data.label || '',
                                                    onChange: (e)=>updateNodeData(selectedNode.id, 'label', e.target.value),
                                                    className: `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$with$2d$sidebar$292f$Roadmap$2f$roadmap$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].input}`
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                                                    lineNumber: 240,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                                            lineNumber: 236,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "node-description",
                                                    className: "block text-sm font-medium text-gray-700 mb-1",
                                                    children: "Description"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                                                    lineNumber: 250,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                    id: "node-description",
                                                    placeholder: "Enter step description",
                                                    value: selectedNode.data.description || '',
                                                    onChange: (e)=>updateNodeData(selectedNode.id, 'description', e.target.value),
                                                    rows: 3,
                                                    className: `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$with$2d$sidebar$292f$Roadmap$2f$roadmap$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].textarea}`
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                                                    lineNumber: 253,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                                            lineNumber: 249,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setSelectedNode(null),
                                            className: `w-full px-4 py-2 rounded-md font-medium text-white transition-colors duration-200 ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$with$2d$sidebar$292f$Roadmap$2f$roadmap$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].doneButton}`,
                                            type: "button",
                                            children: "✅ Done Editing"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                                            lineNumber: 262,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                                    lineNumber: 235,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                            lineNumber: 231,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                        lineNumber: 230,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ReactFlow"], {
                            nodes: nodes,
                            edges: edges,
                            onNodesChange: onNodesChange,
                            onEdgesChange: onEdgesChange,
                            onConnect: onConnect,
                            onNodeClick: onNodeClick,
                            connectionMode: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConnectionMode"].Loose,
                            fitView: true,
                            fitViewOptions: {
                                padding: 0.2
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Controls"], {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$with$2d$sidebar$292f$Roadmap$2f$roadmap$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].controls
                                }, void 0, false, {
                                    fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                                    lineNumber: 287,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["MiniMap"], {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$with$2d$sidebar$292f$Roadmap$2f$roadmap$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].minimap,
                                    maskColor: MANOA_COLORS.bg,
                                    nodeColor: (node)=>{
                                        if (node.type === 'input') return MANOA_COLORS.primary;
                                        if (node.type === 'output') return MANOA_COLORS.accent;
                                        return MANOA_COLORS.secondary;
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                                    lineNumber: 288,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Background"], {
                                    variant: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["BackgroundVariant"].Dots,
                                    gap: 20,
                                    size: 2,
                                    color: MANOA_COLORS.border
                                }, void 0, false, {
                                    fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                                    lineNumber: 297,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                            lineNumber: 276,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                        lineNumber: 275,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                lineNumber: 227,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `bg-white border-t-4 p-4 ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$with$2d$sidebar$292f$Roadmap$2f$roadmap$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].footer}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-7xl mx-auto",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: `text-center text-sm ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$with$2d$sidebar$292f$Roadmap$2f$roadmap$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].footerText}`,
                        children: "🌺 Click on nodes to edit • Drag to connect • Build your path to success at UH Manoa 🌺"
                    }, void 0, false, {
                        fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                        lineNumber: 310,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                    lineNumber: 309,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
                lineNumber: 308,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(with-sidebar)/Roadmap/page.tsx",
        lineNumber: 194,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=app_%28with-sidebar%29_Roadmap_0598ed73._.js.map