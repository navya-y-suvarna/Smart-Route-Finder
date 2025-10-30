import { useEffect, useRef } from 'react';
import { GraphNode, GraphEdge } from '../lib/graph';

interface GraphVisualizationProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  highlightedPath?: string[];
  onNodeClick?: (nodeId: string) => void;
}

export default function GraphVisualization({
  nodes,
  edges,
  highlightedPath = [],
  onNodeClick,
}: GraphVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const padding = 60;

    ctx.clearRect(0, 0, width, height);

    if (nodes.length === 0) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = '16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('No locations to display', width / 2, height / 2);
      return;
    }

    const minX = Math.min(...nodes.map(n => n.x));
    const maxX = Math.max(...nodes.map(n => n.x));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxY = Math.max(...nodes.map(n => n.y));

    const scaleX = (maxX - minX) > 0 ? (width - 2 * padding) / (maxX - minX) : 1;
    const scaleY = (maxY - minY) > 0 ? (height - 2 * padding) / (maxY - minY) : 1;

    const scale = Math.min(scaleX, scaleY);

    const centerX = width / 2;
    const centerY = height / 2;
    const graphCenterX = (minX + maxX) / 2;
    const graphCenterY = (minY + maxY) / 2;

    const transform = (x: number, y: number) => {
      const scaledX = (x - graphCenterX) * scale + centerX;
      const scaledY = (y - graphCenterY) * scale + centerY;
      return { x: scaledX, y: scaledY };
    };

    const pathSet = new Set(highlightedPath);
    const pathEdges = new Set<string>();

    for (let i = 0; i < highlightedPath.length - 1; i++) {
      pathEdges.add(`${highlightedPath[i]}-${highlightedPath[i + 1]}`);
    }

    edges.forEach(edge => {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);

      if (fromNode && toNode) {
        const from = transform(fromNode.x, fromNode.y);
        const to = transform(toNode.x, toNode.y);

        const isHighlighted = pathEdges.has(`${edge.from}-${edge.to}`);

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = isHighlighted ? '#3b82f6' : '#d1d5db';
        ctx.lineWidth = isHighlighted ? 3 : 2;
        ctx.stroke();

        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const arrowSize = 10;
        const headX = to.x - Math.cos(angle) * 20;
        const headY = to.y - Math.sin(angle) * 20;

        ctx.beginPath();
        ctx.moveTo(headX, headY);
        ctx.lineTo(
          headX - arrowSize * Math.cos(angle - Math.PI / 6),
          headY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          headX - arrowSize * Math.cos(angle + Math.PI / 6),
          headY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = isHighlighted ? '#3b82f6' : '#d1d5db';
        ctx.fill();

        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(midX, midY, 16, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = isHighlighted ? '#3b82f6' : '#9ca3af';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = isHighlighted ? '#3b82f6' : '#4b5563';
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(edge.distance.toFixed(1), midX, midY);
      }
    });

    nodes.forEach(node => {
      const pos = transform(node.x, node.y);
      const isHighlighted = pathSet.has(node.id);

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 18, 0, 2 * Math.PI);
      ctx.fillStyle = isHighlighted ? '#3b82f6' : '#ffffff';
      ctx.fill();
      ctx.strokeStyle = isHighlighted ? '#2563eb' : '#6b7280';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = isHighlighted ? '#ffffff' : '#1f2937';
      ctx.font = 'bold 14px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(node.name, pos.x, pos.y + 24);
    });
  }, [nodes, edges, highlightedPath]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onNodeClick || nodes.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;
    const padding = 60;

    const minX = Math.min(...nodes.map(n => n.x));
    const maxX = Math.max(...nodes.map(n => n.x));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxY = Math.max(...nodes.map(n => n.y));

    const scaleX = (maxX - minX) > 0 ? (width - 2 * padding) / (maxX - minX) : 1;
    const scaleY = (maxY - minY) > 0 ? (height - 2 * padding) / (maxY - minY) : 1;
    const scale = Math.min(scaleX, scaleY);

    const centerX = width / 2;
    const centerY = height / 2;
    const graphCenterX = (minX + maxX) / 2;
    const graphCenterY = (minY + maxY) / 2;

    const transform = (nx: number, ny: number) => {
      const scaledX = (nx - graphCenterX) * scale + centerX;
      const scaledY = (ny - graphCenterY) * scale + centerY;
      return { x: scaledX, y: scaledY };
    };

    for (const node of nodes) {
      const pos = transform(node.x, node.y);
      const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);

      if (distance <= 18) {
        onNodeClick(node.id);
        break;
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      className="w-full h-full cursor-pointer"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
