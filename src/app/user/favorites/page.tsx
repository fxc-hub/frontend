"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../lib/api";

interface Favorite {
  id: number;
  type: 'indicator' | 'alert' | 'scanner';
  name: string;
  description: string;
  created_at: string;
  status: 'active' | 'inactive';
}

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'indicators' | 'alerts' | 'scanners'>('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      // This would be replaced with actual API call when backend is ready
      // const response = await api('/api/user/favorites', 'GET');
      // setFavorites(response.data);
      
      // Mock data for now
      const mockFavorites: Favorite[] = [
        {
          id: 1,
          type: 'indicator',
          name: 'RSI Divergence Scanner',
          description: 'Advanced RSI divergence detection with multiple timeframe analysis',
          created_at: '2024-01-15T10:30:00Z',
          status: 'active'
        },
        {
          id: 2,
          type: 'alert',
          name: 'EUR/USD Breakout Alert',
          description: 'Price breakout notifications for EUR/USD pair',
          created_at: '2024-01-10T14:20:00Z',
          status: 'active'
        },
        {
          id: 3,
          type: 'scanner',
          name: 'Multi-Pair Momentum Scanner',
          description: 'Scans multiple currency pairs for momentum opportunities',
          created_at: '2024-01-05T09:15:00Z',
          status: 'inactive'
        },
        {
          id: 4,
          type: 'indicator',
          name: 'Bollinger Bands Squeeze',
          description: 'Detects Bollinger Bands squeeze patterns for breakout trading',
          created_at: '2024-01-01T16:45:00Z',
          status: 'active'
        }
      ];
      setFavorites(mockFavorites);
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to load favorites' 
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id: number) => {
    try {
      // This would be replaced with actual API call when backend is ready
      // await api(`/api/user/favorites/${id}`, 'DELETE');
      
      setFavorites(prev => prev.filter(fav => fav.id !== id));
      setMessage({ type: 'success', text: 'Favorite removed successfully!' });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to remove favorite' 
      });
    }
  };

  const toggleStatus = async (id: number) => {
    try {
      // This would be replaced with actual API call when backend is ready
      // await api(`/api/user/favorites/${id}/toggle`, 'PUT');
      
      setFavorites(prev => prev.map(fav => 
        fav.id === id 
          ? { ...fav, status: fav.status === 'active' ? 'inactive' : 'active' }
          : fav
      ));
      setMessage({ type: 'success', text: 'Status updated successfully!' });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to update status' 
      });
    }
  };

  const filteredFavorites = favorites.filter(fav => {
    if (activeTab === 'all') return true;
    return fav.type === activeTab;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'indicator':
        return '📊';
      case 'alert':
        return '🔔';
      case 'scanner':
        return '🔍';
      default:
        return '⭐';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'indicator':
        return 'bg-yellow-600';
      case 'alert':
        return 'bg-orange-600';
      case 'scanner':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Favorites</h1>
          <p className="text-gray-300">Manage your favorite indicators, alerts, and scanners</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-900 p-1 rounded-lg">
            {[
              { key: 'all', label: 'All', count: favorites.length },
              { key: 'indicators', label: 'Indicators', count: favorites.filter(f => f.type === 'indicator').length },
              { key: 'alerts', label: 'Alerts', count: favorites.filter(f => f.type === 'alert').length },
              { key: 'scanners', label: 'Scanners', count: favorites.filter(f => f.type === 'scanner').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                                         ? 'bg-yellow-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading favorites...</p>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
            <p className="text-gray-300 mb-6">
              {activeTab === 'all' 
                ? "You haven't added any favorites yet. Start exploring our indicators, alerts, and scanners!"
                : `You haven't added any ${activeTab} to your favorites yet.`
              }
            </p>
            <button
              onClick={() => window.location.href = '/marketplace'}
                              className="px-6 py-3 rounded-lg bg-yellow-600 hover:bg-yellow-700 transition-colors"
            >
              Explore Marketplace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((favorite) => (
              <div key={favorite.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getTypeIcon(favorite.type)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(favorite.type)}`}>
                      {favorite.type.charAt(0).toUpperCase() + favorite.type.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleStatus(favorite.id)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        favorite.status === 'active'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-gray-600 hover:bg-gray-700'
                      }`}
                    >
                      {favorite.status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => removeFavorite(favorite.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Remove from favorites"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{favorite.name}</h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{favorite.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Added {new Date(favorite.created_at).toLocaleDateString()}</span>
                  <button
                    onClick={() => window.location.href = `/marketplace/${favorite.type}/${favorite.id}`}
                    className="text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {favorites.length > 0 && (
          <div className="mt-8 bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => {
                  const activeFavorites = favorites.filter(f => f.status === 'active');
                  setMessage({ type: 'success', text: `${activeFavorites.length} active favorites` });
                }}
                className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 transition-colors"
              >
                View Active ({favorites.filter(f => f.status === 'active').length})
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to remove all favorites?')) {
                    setFavorites([]);
                    setMessage({ type: 'success', text: 'All favorites removed!' });
                  }
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => window.location.href = '/marketplace'}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                Add More Favorites
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 