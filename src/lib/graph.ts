import { Location, Route } from './supabase';

export interface GraphNode {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  distance: number;
}

export interface PathResult {
  path: string[];
  distance: number;
  locations: Location[];
}

class PriorityQueue<T> {
  private items: { element: T; priority: number }[] = [];

  enqueue(element: T, priority: number): void {
    const item = { element, priority };
    let added = false;

    for (let i = 0; i < this.items.length; i++) {
      if (item.priority < this.items[i].priority) {
        this.items.splice(i, 0, item);
        added = true;
        break;
      }
    }

    if (!added) {
      this.items.push(item);
    }
  }

  dequeue(): T | undefined {
    return this.items.shift()?.element;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

export class Graph {
  private adjacencyList: Map<string, Map<string, number>> = new Map();
  private nodes: Map<string, GraphNode> = new Map();

  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, new Map());
    }
  }

  addEdge(from: string, to: string, distance: number): void {
    if (!this.adjacencyList.has(from)) {
      this.adjacencyList.set(from, new Map());
    }
    this.adjacencyList.get(from)!.set(to, distance);
  }

  dijkstra(startId: string, endId: string): PathResult | null {
    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const pq = new PriorityQueue<string>();

    for (const nodeId of this.nodes.keys()) {
      distances.set(nodeId, nodeId === startId ? 0 : Infinity);
      previous.set(nodeId, null);
    }

    pq.enqueue(startId, 0);

    while (!pq.isEmpty()) {
      const currentId = pq.dequeue();
      if (!currentId) break;

      if (currentId === endId) break;

      const currentDistance = distances.get(currentId) || Infinity;
      const neighbors = this.adjacencyList.get(currentId);

      if (neighbors) {
        for (const [neighborId, edgeDistance] of neighbors.entries()) {
          const newDistance = currentDistance + edgeDistance;
          const oldDistance = distances.get(neighborId) || Infinity;

          if (newDistance < oldDistance) {
            distances.set(neighborId, newDistance);
            previous.set(neighborId, currentId);
            pq.enqueue(neighborId, newDistance);
          }
        }
      }
    }

    const path: string[] = [];
    let current: string | null | undefined = endId;

    if (previous.get(endId) === null && startId !== endId) {
      return null;
    }

    while (current) {
      path.unshift(current);
      current = previous.get(current);
    }

    const totalDistance = distances.get(endId) || 0;
    const locations = path
      .map(id => this.nodes.get(id))
      .filter((node): node is GraphNode => node !== undefined)
      .map(node => ({
        id: node.id,
        name: node.name,
        description: '',
        x_coordinate: node.x,
        y_coordinate: node.y,
        created_at: '',
      }));

    return {
      path,
      distance: totalDistance,
      locations,
    };
  }

  bfs(startId: string): string[] {
    const visited = new Set<string>();
    const queue: string[] = [startId];
    const result: string[] = [];

    visited.add(startId);

    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);

      const neighbors = this.adjacencyList.get(current);
      if (neighbors) {
        for (const neighborId of neighbors.keys()) {
          if (!visited.has(neighborId)) {
            visited.add(neighborId);
            queue.push(neighborId);
          }
        }
      }
    }

    return result;
  }

  dfs(startId: string): string[] {
    const visited = new Set<string>();
    const result: string[] = [];

    const dfsHelper = (nodeId: string) => {
      visited.add(nodeId);
      result.push(nodeId);

      const neighbors = this.adjacencyList.get(nodeId);
      if (neighbors) {
        for (const neighborId of neighbors.keys()) {
          if (!visited.has(neighborId)) {
            dfsHelper(neighborId);
          }
        }
      }
    };

    dfsHelper(startId);
    return result;
  }

  getNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  getEdges(): GraphEdge[] {
    const edges: GraphEdge[] = [];
    for (const [from, neighbors] of this.adjacencyList.entries()) {
      for (const [to, distance] of neighbors.entries()) {
        edges.push({ from, to, distance });
      }
    }
    return edges;
  }
}

export function buildGraphFromData(locations: Location[], routes: Route[]): Graph {
  const graph = new Graph();

  for (const location of locations) {
    graph.addNode({
      id: location.id,
      name: location.name,
      x: location.x_coordinate,
      y: location.y_coordinate,
    });
  }

  for (const route of routes) {
    graph.addEdge(route.from_location_id, route.to_location_id, route.distance);
    graph.addEdge(route.to_location_id, route.from_location_id, route.distance);
  }

  return graph;
}
