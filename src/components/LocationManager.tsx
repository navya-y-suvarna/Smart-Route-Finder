import { useState } from 'react';
import { MapPin, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { Location, supabase } from '../lib/supabase';

interface LocationManagerProps {
  locations: Location[];
  onLocationsChange: () => void;
}

export default function LocationManager({ locations, onLocationsChange }: LocationManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    x_coordinate: '',
    y_coordinate: '',
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', x_coordinate: '', y_coordinate: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name: formData.name,
      description: formData.description,
      x_coordinate: parseFloat(formData.x_coordinate),
      y_coordinate: parseFloat(formData.y_coordinate),
    };

    if (editingId) {
      const { error } = await supabase
        .from('locations')
        .update(data)
        .eq('id', editingId);

      if (error) {
        console.error('Error updating location:', error);
        alert('Error updating location');
        return;
      }
    } else {
      const { error } = await supabase.from('locations').insert([data]);

      if (error) {
        console.error('Error adding location:', error);
        alert('Error adding location');
        return;
      }
    }

    resetForm();
    onLocationsChange();
  };

  const handleEdit = (location: Location) => {
    setFormData({
      name: location.name,
      description: location.description,
      x_coordinate: location.x_coordinate.toString(),
      y_coordinate: location.y_coordinate.toString(),
    });
    setEditingId(location.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will also delete all routes connected to this location.')) {
      return;
    }

    const { error } = await supabase.from('locations').delete().eq('id', id);

    if (error) {
      console.error('Error deleting location:', error);
      alert('Error deleting location');
      return;
    }

    onLocationsChange();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <MapPin className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Locations</h2>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdding ? 'Cancel' : 'Add Location'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., Library"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Optional"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">X Coordinate</label>
              <input
                type="number"
                step="any"
                value={formData.x_coordinate}
                onChange={(e) => setFormData({ ...formData, x_coordinate: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., 100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Y Coordinate</label>
              <input
                type="number"
                step="any"
                value={formData.y_coordinate}
                onChange={(e) => setFormData({ ...formData, y_coordinate: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., 200"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            {editingId ? 'Update Location' : 'Add Location'}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {locations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No locations yet. Add one to get started!</p>
        ) : (
          locations.map((location) => (
            <div
              key={location.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <h3 className="font-semibold text-gray-800">{location.name}</h3>
                <p className="text-sm text-gray-600">
                  {location.description || 'No description'} • Position: ({location.x_coordinate}, {location.y_coordinate})
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(location)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(location.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
