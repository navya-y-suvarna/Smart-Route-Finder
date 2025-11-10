import { useEffect, useState } from 'react';
import { Map } from 'lucide-react';
import { supabase, Location, Route } from './lib/supabase';
import { buildGraphFromData, PathResult } from './lib/graph';
import GraphVisualization from './components/GraphVisualization';
import PathFinder from './components/PathFinder';
import LocationManager from './components/LocationManager';
import RouteManager from './components/RouteManager';
import { useMemo } from 'react';

function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [pathResult, setPathResult] = useState<PathResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'find' | 'manage'>('find');

  useEffect(() => {
    import('./lib/supabase').then(({ testSupabaseConnection }) => {
      testSupabaseConnection();
    });
    loadData();
  }, []);

  useEffect(() => {
    setPathResult(null);
  }, [locations, routes]);


  const loadData = async () => {
    const [locationsResult, routesResult] = await Promise.all([
      supabase.from('locations').select('*').order('name'),
      supabase.from('routes').select('*'),
    ]);

    console.log("Locations from Supabase:", locationsResult.data);
    console.log("Routes from Supabase:", routesResult.data);

    if (locationsResult.data) {
      setLocations(locationsResult.data);
    }

    if (routesResult.data) {
      setRoutes(routesResult.data);
    }
  };

  const handleFindPath = (fromId: string, toId: string) => {
  console.log("Finding path between:", fromId, "and", toId);
  setIsLoading(true);
  try {
    if (!graph) {
      console.warn("Graph not built yet!");
      setPathResult(null);
      return;
    }
    const result = graph.dijkstra(fromId, toId);
    console.log("Path result:", result);
    setPathResult(result);
  } catch (error) {
    console.error("Error finding path:", error);
    setPathResult(null);
  } finally {
    setIsLoading(false);
  }
};


  const graph = useMemo(() => {
    if (!locations || !routes) return null;
    return buildGraphFromData(locations, routes);
  }, [locations, routes]);

  const nodes = graph ? graph.getNodes() : [];
  const edges = graph ? graph.getEdges() : [];



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Map className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Smart Route Finder</h1>
              <p className="text-gray-600 text-sm">
                Graph-based pathfinding with Dijkstra's algorithm
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setActiveTab('find')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'find'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
          >
            Find Routes
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'manage'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
          >
            Manage Data
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 h-[600px]">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Network Visualization</h2>
              <div className="h-[calc(100%-3rem)] border-2 border-gray-200 rounded-lg overflow-hidden">
                <GraphVisualization
                  nodes={nodes}
                  edges={edges}
                  highlightedPath={pathResult?.path || []}
                />
              </div>
            </div>
          </div>

          <div>
            {activeTab === 'find' ? (
              <PathFinder
                locations={locations}
                onFindPath={handleFindPath}
                pathResult={pathResult}
                isLoading={isLoading}
              />
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                <LocationManager locations={locations} onLocationsChange={loadData} />
                <RouteManager routes={routes} locations={locations} onRoutesChange={loadData} />
              </div>
            )}
          </div>
        </div>

        {locations.length === 0 && activeTab === 'find' && (
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-blue-900 mb-2">Welcome to Smart Route Finder!</h3>
            <p className="text-blue-700 mb-4">
              Get started by adding locations and routes in the Manage Data tab.
            </p>
            <button
              onClick={() => setActiveTab('manage')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Go to Manage Data
            </button>
          </div>
        )}
      </main>

      <footer className="mt-12 pb-8 text-center text-gray-600 text-sm">
        <p>
          Built with React, TypeScript, Supabase, and Dijkstra's Algorithm
        </p>
      </footer>
    </div>
  );
}

export default App;
