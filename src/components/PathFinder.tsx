import { useState } from 'react';
import { Search, Navigation, Zap } from 'lucide-react';
import { Location } from '../lib/supabase';
import { PathResult } from '../lib/graph';

interface PathFinderProps {
  locations: Location[];
  onFindPath: (fromId: string, toId: string) => void;
  pathResult: PathResult | null;
  isLoading: boolean;
}

export default function PathFinder({ locations, onFindPath, pathResult, isLoading }: PathFinderProps) {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');

  const handleFindPath = () => {
    if (fromLocation && toLocation) {
      onFindPath(fromLocation, toLocation);
    }
  };

  const handleSwap = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Navigation className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Find Shortest Path</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Location
          </label>
          <select
            value={fromLocation}
            onChange={(e) => setFromLocation(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">Select starting location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleSwap}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Swap locations"
          >
            <Zap className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To Location
          </label>
          <select
            value={toLocation}
            onChange={(e) => setToLocation(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">Select destination</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleFindPath}
          disabled={!fromLocation || !toLocation || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          {isLoading ? 'Finding Path...' : 'Find Shortest Path'}
        </button>
      </div>

      {pathResult && (
        <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-3 text-lg">Path Found!</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Total Distance:</span>
              <span className="text-2xl font-bold text-green-600">
                {pathResult.distance.toFixed(2)} units
              </span>
            </div>
            <div>
              <span className="text-gray-700 font-medium">Route:</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {pathResult.locations.map((location, index) => (
                  <div key={location.id} className="flex items-center">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {location.name}
                    </span>
                    {index < pathResult.locations.length - 1 && (
                      <span className="mx-2 text-gray-400">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {pathResult === null && fromLocation && toLocation && !isLoading && (
        <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800">No Path Found</h3>
          <p className="text-red-600 text-sm mt-1">
            There is no route between these locations. They may be in separate networks.
          </p>
        </div>
      )}
    </div>
  );
}
