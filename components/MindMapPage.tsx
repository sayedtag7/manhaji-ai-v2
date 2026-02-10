import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { MindMapNode, MindMapEdge, MindMapData } from '../types';
import { Brain, ZoomIn, ZoomOut, Maximize2, Download, RefreshCw, BookOpen, Star, ChevronDown, Info, X, Sparkles, Loader2 } from 'lucide-react';
import { sendMessageToGemini } from '../services/geminiService';

// ═══════════════════════════════════════════════════════════════════════════
// Sample Mind Map Data (will be replaced by AI generation)
// ═══════════════════════════════════════════════════════════════════════════

const SAMPLE_MINDMAPS: Record<string, MindMapData> = {
  'linear_equations': {
    title: 'المعادلات الخطية',
    titleEn: 'Linear Equations',
    nodes: [
      { id: 'root', label: 'المعادلات الخطية', labelEn: 'Linear Equations', type: 'root', x: 400, y: 50 },
      { id: 'def', label: 'التعريف', labelEn: 'Definition', description: 'معادلة من الدرجة الأولى في متغير واحد أو أكثر', descriptionEn: 'An equation of degree one in one or more variables', type: 'concept', priority: 'high', x: 150, y: 180 },
      { id: 'forms', label: 'الصيغ', labelEn: 'Forms', type: 'concept', priority: 'high', x: 400, y: 180 },
      { id: 'methods', label: 'طرق الحل', labelEn: 'Solving Methods', type: 'concept', priority: 'high', x: 650, y: 180 },
      { id: 'slope_int', label: 'صيغة الميل والمقطع', labelEn: 'Slope-Intercept Form', description: 'y = mx + b', descriptionEn: 'y = mx + b', type: 'formula', x: 250, y: 320 },
      { id: 'standard', label: 'الصيغة القياسية', labelEn: 'Standard Form', description: 'ax + by = c', descriptionEn: 'ax + by = c', type: 'formula', x: 550, y: 320 },
      { id: 'substitution', label: 'التعويض', labelEn: 'Substitution', type: 'detail', priority: 'high', x: 500, y: 430 },
      { id: 'elimination', label: 'الحذف', labelEn: 'Elimination', type: 'detail', priority: 'medium', x: 700, y: 430 },
      { id: 'graphical', label: 'الحل البياني', labelEn: 'Graphical Solution', type: 'detail', priority: 'medium', x: 850, y: 430 },
      { id: 'example1', label: 'مثال: 2x + 3 = 7', labelEn: 'Example: 2x + 3 = 7', description: 'x = 2', descriptionEn: 'x = 2', type: 'example', x: 100, y: 430 },
    ],
    edges: [
      { id: 'e1', source: 'root', target: 'def', type: 'contains' },
      { id: 'e2', source: 'root', target: 'forms', type: 'contains' },
      { id: 'e3', source: 'root', target: 'methods', type: 'contains' },
      { id: 'e4', source: 'forms', target: 'slope_int', type: 'contains' },
      { id: 'e5', source: 'forms', target: 'standard', type: 'contains' },
      { id: 'e6', source: 'methods', target: 'substitution', type: 'contains' },
      { id: 'e7', source: 'methods', target: 'elimination', type: 'contains' },
      { id: 'e8', source: 'methods', target: 'graphical', type: 'contains' },
      { id: 'e9', source: 'def', target: 'example1', type: 'related', label: 'مثال', labelEn: 'Example' },
    ]
  },
  'matter_properties': {
    title: 'المادة وخواصها',
    titleEn: 'Matter and Its Properties',
    nodes: [
      { id: 'root', label: 'المادة وخواصها', labelEn: 'Matter & Properties', type: 'root', x: 400, y: 50 },
      { id: 'states', label: 'حالات المادة', labelEn: 'States of Matter', type: 'concept', priority: 'high', x: 150, y: 180 },
      { id: 'properties', label: 'الخواص', labelEn: 'Properties', type: 'concept', priority: 'high', x: 400, y: 180 },
      { id: 'changes', label: 'التغيرات', labelEn: 'Changes', type: 'concept', priority: 'high', x: 650, y: 180 },
      { id: 'solid', label: 'صلبة', labelEn: 'Solid', description: 'شكل وحجم ثابت', descriptionEn: 'Fixed shape and volume', type: 'detail', x: 50, y: 320 },
      { id: 'liquid', label: 'سائلة', labelEn: 'Liquid', description: 'حجم ثابت، شكل متغير', descriptionEn: 'Fixed volume, variable shape', type: 'detail', x: 200, y: 320 },
      { id: 'gas', label: 'غازية', labelEn: 'Gas', description: 'شكل وحجم متغير', descriptionEn: 'Variable shape and volume', type: 'detail', x: 350, y: 320 },
      { id: 'physical', label: 'فيزيائية', labelEn: 'Physical', type: 'detail', x: 300, y: 430 },
      { id: 'chemical', label: 'كيميائية', labelEn: 'Chemical', type: 'detail', x: 500, y: 430 },
      { id: 'phys_change', label: 'تغير فيزيائي', labelEn: 'Physical Change', description: 'لا يغير تركيب المادة', descriptionEn: 'Does not change composition', type: 'detail', x: 550, y: 320 },
      { id: 'chem_change', label: 'تغير كيميائي', labelEn: 'Chemical Change', description: 'يغير تركيب المادة', descriptionEn: 'Changes composition', type: 'detail', x: 750, y: 320 },
    ],
    edges: [
      { id: 'e1', source: 'root', target: 'states', type: 'contains' },
      { id: 'e2', source: 'root', target: 'properties', type: 'contains' },
      { id: 'e3', source: 'root', target: 'changes', type: 'contains' },
      { id: 'e4', source: 'states', target: 'solid', type: 'contains' },
      { id: 'e5', source: 'states', target: 'liquid', type: 'contains' },
      { id: 'e6', source: 'states', target: 'gas', type: 'contains' },
      { id: 'e7', source: 'properties', target: 'physical', type: 'contains' },
      { id: 'e8', source: 'properties', target: 'chemical', type: 'contains' },
      { id: 'e9', source: 'changes', target: 'phys_change', type: 'contains' },
      { id: 'e10', source: 'changes', target: 'chem_change', type: 'contains' },
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// Node Color Helpers
// ═══════════════════════════════════════════════════════════════════════════

const getNodeStyle = (node: MindMapNode) => {
  const base = {
    root: { bg: 'bg-gradient-to-br from-brand-500 to-brand-600', text: 'text-white', border: 'border-brand-600', ring: 'ring-brand-200' },
    concept: { bg: 'bg-gradient-to-br from-blue-500 to-blue-600', text: 'text-white', border: 'border-blue-600', ring: 'ring-blue-200' },
    detail: { bg: 'bg-white', text: 'text-gray-800', border: 'border-gray-200', ring: 'ring-gray-200' },
    example: { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-300', ring: 'ring-amber-200' },
    formula: { bg: 'bg-purple-50', text: 'text-purple-900', border: 'border-purple-300', ring: 'ring-purple-200' },
  };
  return base[node.type] || base.detail;
};

const getPriorityBadge = (priority?: string) => {
  if (!priority) return null;
  const styles: Record<string, string> = {
    high: 'bg-red-100 text-red-600 border-red-200',
    medium: 'bg-amber-100 text-amber-600 border-amber-200',
    low: 'bg-green-100 text-green-600 border-green-200',
  };
  const labels: Record<string, { ar: string; en: string }> = {
    high: { ar: 'مهم للامتحان', en: 'Exam Priority' },
    medium: { ar: 'متوسط', en: 'Medium' },
    low: { ar: 'اختياري', en: 'Optional' },
  };
  return { style: styles[priority], label: labels[priority] };
};

// ═══════════════════════════════════════════════════════════════════════════
// Mind Map Page Component
// ═══════════════════════════════════════════════════════════════════════════

const MindMapPage: React.FC = () => {
  const { language } = useLanguage();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [selectedTopic, setSelectedTopic] = useState('linear_equations');
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [dynamicMaps, setDynamicMaps] = useState<Record<string, MindMapData>>(SAMPLE_MINDMAPS);

  const currentMap = dynamicMaps[selectedTopic];

  const topics = [
    { id: 'linear_equations', labelAr: 'المعادلات الخطية', labelEn: 'Linear Equations' },
    { id: 'matter_properties', labelAr: 'المادة وخواصها', labelEn: 'Matter & Properties' },
  ];

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.mind-node')) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.4));
  const handleFitView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // AI-powered mind map generation
  const generateMindMap = async (topic: string) => {
    setIsGenerating(true);
    try {
      const prompt = language === 'ar'
        ? `أنشئ خريطة ذهنية تعليمية للموضوع التالي: "${topic}". 
أرجع النتيجة كـ JSON فقط بدون أي نص إضافي، بالشكل التالي (مع إحداثيات x, y لكل عقدة):
{
  "title": "عنوان الموضوع",
  "titleEn": "Topic Title",
  "nodes": [
    {"id": "root", "label": "العنوان", "labelEn": "Title", "type": "root", "x": 400, "y": 50},
    {"id": "n1", "label": "مفهوم 1", "labelEn": "Concept 1", "description": "وصف", "descriptionEn": "Description", "type": "concept", "priority": "high", "x": 200, "y": 180}
  ],
  "edges": [
    {"id": "e1", "source": "root", "target": "n1", "type": "contains"}
  ]
}
أنواع العقد: root, concept, detail, example, formula
أنواع الأحرف: contains, prerequisite, related, leads_to
أضف 8-12 عقدة مع أوصاف مفصلة ومواضع مناسبة.`
        : `Create an educational mind map for the topic: "${topic}". 
Return ONLY valid JSON with no extra text, in this format (with x, y coordinates for each node):
{
  "title": "Topic Title",
  "titleEn": "Topic Title",
  "nodes": [
    {"id": "root", "label": "Title", "labelEn": "Title", "type": "root", "x": 400, "y": 50},
    {"id": "n1", "label": "Concept", "labelEn": "Concept", "description": "Desc", "descriptionEn": "Desc", "type": "concept", "priority": "high", "x": 200, "y": 180}
  ],
  "edges": [
    {"id": "e1", "source": "root", "target": "n1", "type": "contains"}
  ]
}
Node types: root, concept, detail, example, formula
Edge types: contains, prerequisite, related, leads_to
Add 8-12 nodes with detailed descriptions and appropriate positions.`;

      const response = await sendMessageToGemini(prompt, undefined, language);
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const mapData: MindMapData = JSON.parse(jsonMatch[0]);
        const mapId = `ai_${Date.now()}`;
        setDynamicMaps(prev => ({ ...prev, [mapId]: mapData }));
        setSelectedTopic(mapId);
        // Add to topics list  
        topics.push({ id: mapId, labelAr: mapData.title, labelEn: mapData.titleEn || mapData.title });
      }
    } catch (error) {
      console.error('Failed to generate mind map:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Draw edges as SVG lines
  const renderEdges = () => {
    if (!currentMap) return null;
    return currentMap.edges.map(edge => {
      const sourceNode = currentMap.nodes.find(n => n.id === edge.source);
      const targetNode = currentMap.nodes.find(n => n.id === edge.target);
      if (!sourceNode || !targetNode || !sourceNode.x || !targetNode.x || !sourceNode.y || !targetNode.y) return null;

      const sx = sourceNode.x + 70;
      const sy = sourceNode.y + 25;
      const tx = targetNode.x + 70;
      const ty = targetNode.y + 25;
      const mx = (sx + tx) / 2;
      const my = (sy + ty) / 2;

      const edgeColor = edge.type === 'prerequisite' ? '#D32F2F' : edge.type === 'related' ? '#F9A825' : '#0D47A1';

      return (
        <g key={edge.id}>
          <path
            d={`M ${sx} ${sy} Q ${mx} ${sy} ${mx} ${my} Q ${mx} ${ty} ${tx} ${ty}`}
            fill="none"
            stroke={edgeColor}
            strokeWidth="2"
            strokeDasharray={edge.type === 'related' ? '6 3' : 'none'}
            opacity="0.6"
          />
          {edge.label && (
            <text x={mx} y={my - 8} textAnchor="middle" fill="#666" fontSize="11" fontFamily="Tajawal">
              {language === 'ar' ? edge.label : (edge.labelEn || edge.label)}
            </text>
          )}
        </g>
      );
    });
  };

  // Render nodes as interactive elements
  const renderNodes = () => {
    if (!currentMap) return null;
    return currentMap.nodes.map(node => {
      if (!node.x || !node.y) return null;
      const style = getNodeStyle(node);
      const priorityBadge = getPriorityBadge(node.priority);
      const isSelected = selectedNode?.id === node.id;
      const nodeLabel = language === 'ar' ? node.label : (node.labelEn || node.label);

      return (
        <div
          key={node.id}
          className={`mind-node absolute cursor-pointer transition-all duration-200 select-none
            ${style.bg} ${style.text} ${style.border}
            border-2 rounded-xl px-4 py-2.5 shadow-md hover:shadow-lg
            ${isSelected ? `ring-4 ${style.ring} scale-105` : 'hover:scale-102'}
            ${node.type === 'root' ? 'text-lg font-bold min-w-[140px]' : 'text-sm font-medium min-w-[100px]'}
          `}
          style={{ left: node.x, top: node.y }}
          onClick={(e) => { e.stopPropagation(); setSelectedNode(isSelected ? null : node); }}
        >
          <div className="flex items-center gap-2">
            {node.type === 'root' && <Brain className="w-5 h-5 shrink-0" />}
            {node.type === 'formula' && <span className="text-base">📐</span>}
            {node.type === 'example' && <span className="text-base">💡</span>}
            <span className="truncate max-w-[150px]">{nodeLabel}</span>
          </div>
          {priorityBadge && (
            <div className={`mt-1.5 text-[10px] px-2 py-0.5 rounded-full border ${priorityBadge.style} inline-block`}>
              <Star className="w-3 h-3 inline me-1" />
              {language === 'ar' ? priorityBadge.label.ar : priorityBadge.label.en}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {language === 'ar' ? 'الخرائط الذهنية التفاعلية' : 'Interactive Mind Maps'}
              </h1>
              <p className="text-sm text-gray-500">
                {language === 'ar' ? 'استكشف المفاهيم بصرياً' : 'Explore concepts visually'}
              </p>
            </div>
          </div>

          {/* Topic selector */}
          <div className="flex items-center gap-3">
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              {topics.map(t => (
                <option key={t.id} value={t.id}>{language === 'ar' ? t.labelAr : t.labelEn}</option>
              ))}
              {Object.keys(dynamicMaps).filter(k => k.startsWith('ai_')).map(k => (
                <option key={k} value={k}>{language === 'ar' ? dynamicMaps[k].title : (dynamicMaps[k].titleEn || dynamicMaps[k].title)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* AI Generation */}
        <div className="mt-4 flex items-center gap-3">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder={language === 'ar' ? 'أدخل موضوعاً لتوليد خريطة ذهنية بالذكاء الاصطناعي...' : 'Enter a topic to generate an AI mind map...'}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            onKeyDown={(e) => { if (e.key === 'Enter' && customTopic.trim()) generateMindMap(customTopic.trim()); }}
          />
          <button
            onClick={() => customTopic.trim() && generateMindMap(customTopic.trim())}
            disabled={isGenerating || !customTopic.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl font-medium text-sm hover:shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {language === 'ar' ? 'توليد بالذكاء الاصطناعي' : 'Generate with AI'}
          </button>
        </div>
      </div>

      {/* Mind Map Canvas */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        {/* Zoom controls */}
        <div className="absolute top-4 end-4 z-10 flex flex-col gap-2">
          <button onClick={handleZoomIn} className="p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50">
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={handleZoomOut} className="p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50">
            <ZoomOut className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={handleFitView} className="p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50">
            <Maximize2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 start-4 z-10 bg-white/90 backdrop-blur rounded-xl p-3 shadow-md border border-gray-200 text-xs">
          <div className="flex flex-wrap gap-3">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-brand-500"></span> {language === 'ar' ? 'جذر' : 'Root'}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500"></span> {language === 'ar' ? 'مفهوم' : 'Concept'}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-300"></span> {language === 'ar' ? 'صيغة' : 'Formula'}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-300"></span> {language === 'ar' ? 'مثال' : 'Example'}</span>
          </div>
        </div>

        {/* Canvas area */}
        <div
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isPanning ? 'none' : 'transform 0.2s ease',
            }}
            className="relative w-full h-full"
          >
            {/* SVG layer for edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: 1000, minHeight: 600 }}>
              {renderEdges()}
            </svg>

            {/* Node layer */}
            {renderNodes()}
          </div>
        </div>
      </div>

      {/* Node Detail Panel */}
      {selectedNode && (
        <div className="absolute bottom-8 end-8 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 p-5 z-20 animate-in slide-in-from-bottom-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-brand-500" />
              <h3 className="font-bold text-gray-800">
                {language === 'ar' ? selectedNode.label : (selectedNode.labelEn || selectedNode.label)}
              </h3>
            </div>
            <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-gray-100 rounded-lg">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          {(selectedNode.description || selectedNode.descriptionEn) && (
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              {language === 'ar' ? selectedNode.description : (selectedNode.descriptionEn || selectedNode.description)}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`px-2 py-1 rounded-full border ${
              selectedNode.type === 'root' ? 'bg-brand-50 text-brand-600 border-brand-200' :
              selectedNode.type === 'concept' ? 'bg-blue-50 text-blue-600 border-blue-200' :
              selectedNode.type === 'formula' ? 'bg-purple-50 text-purple-600 border-purple-200' :
              selectedNode.type === 'example' ? 'bg-amber-50 text-amber-600 border-amber-200' :
              'bg-gray-50 text-gray-600 border-gray-200'
            }`}>
              {selectedNode.type}
            </span>
            {selectedNode.priority && (
              <span className={`px-2 py-1 rounded-full border ${getPriorityBadge(selectedNode.priority)?.style}`}>
                {language === 'ar' ? getPriorityBadge(selectedNode.priority)?.label.ar : getPriorityBadge(selectedNode.priority)?.label.en}
              </span>
            )}
          </div>

          <button
            className="mt-4 w-full py-2 bg-brand-50 text-brand-600 rounded-xl text-sm font-medium hover:bg-brand-100 transition-colors flex items-center justify-center gap-2"
            onClick={() => {/* Could open chat about this node */}}
          >
            <BookOpen className="w-4 h-4" />
            {language === 'ar' ? 'اسأل الذكاء الاصطناعي عن هذا' : 'Ask AI about this'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MindMapPage;
