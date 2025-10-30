import { useState } from 'react';
import { Route as RouteIcon, Plus, Trash2, X, Check } from 'lucide-react';
import { Location, Route, supabase } from '../lib/supabase';

interface RouteManagerProps {
  routes: Route[];
  locations: Location[];
  onRoutesChange: () => void;
}

export default function RouteManager({ routes, locations, onRoutesChange }: RouteManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    from_location_id: '',
    to_location_id: '',
    distance: '',
    bidirectional: true,
  });

  const resetForm = () => {
    setFormData({ from_location_id: '', to_location_id: '', distance: '', bidirectional: true });
    setIsAdding(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const distance = parseFloat(formData.distance);
    const routesToAdd = [
      {
        from_location_id: formData.from_location_id,
        to_location_id: formData.to_location_id,
        distance,
      },
    ];

    if (formData.bidirectional) {
      routesToAdd.push({
        from_location_id: formData.to_location_id,
        to_location_id: formData.from_location_id,
        distance,
      });
    }

    const { error } = await supabase.from('routes').insert(routesToAdd);

    if (error) {
      console.error('Error adding route:', error);
      alert('Error adding route. It may already exist.');
      return;
    }

    resetForm();
    onRoutesChange();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this route?')) {
      return;
    }

    const { error } = await supabase.from('routes').delete().eq('id', id);

    if (error) {
      console.error('Error deleting route:', error);
      alert('Error deleting route');
      return;
    }

    onRoutesChange();
  };

  const getLocationName = (id: string) => {
    return locations.find((loc) => loc.id === id)?.name || 'Unknown';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <RouteIcon className="w-6 h-6 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Routes</h2>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdding ? 'Cancel' : 'Add Route'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Location</label>
              <select
                value={formData.from_location_id}
                onChange={(e) => setFormData({ ...formData, from_location_id: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Location</label>
              <select
                value={formData.to_location_id}
                onChange={(e) => setFormData({ ...formData, to_location_id: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Distance</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.distance}
              onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="e.g., 5.5"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="bidirectional"
              checked={formData.bidirectional}
              onChange={(e) => setFormData({ ...formData, bidirectional: e.target.checked })}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="bidirectional" className="text-sm font-medium text-gray-700">
              Bidirectional (create route in both directions)
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Add Route
          </button>
        </form>
      )}

      <div className="space-y-2">
        {routes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No routes yet. Add locations first, then create routes between them!
          </p>
        ) : (
          routes.map((route) => (
            <div
              key={route.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-800">{getLocationName(route.from_location_id)}</span>
                <span className="text-gray-400">→</span>
                <span className="font-semibold text-gray-800">{getLocationName(route.to_location_id)}</span>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                  {route.distance} units
                </span>
              </div>
              <button
                onClick={() => handleDelete(route.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
