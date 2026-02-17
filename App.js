import React, { useState, useEffect } from 'react';
import { Copy, Plus, User, Sparkles } from 'lucide-react';
import { supabase } from './supabaseClient';

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [trainId, setTrainId] = useState('');
  const [trainName, setTrainName] = useState('');
  const [trains, setTrains] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinFormData, setJoinFormData] = useState({
    displayName: '',
    username: '',
    bio: ''
  });
  const [createFormData, setCreateFormData] = useState({
    trainName: '',
    displayName: '',
    username: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Extract train ID from URL on initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const trainParam = urlParams.get('train');
    if (trainParam) {
      setTrainId(trainParam.toUpperCase());
      setCurrentView('train');
    }
  }, []);

  // Subscribe to real-time updates for participants
  useEffect(() => {
    if (!trainId) return;

    const channel = supabase
      .channel(`participants:${trainId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'participants',
          filter: `train_id=eq.${trainId}`
        },
        (payload) => {
          setParticipants(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [trainId]);

  // Load participants when trainId changes
  useEffect(() => {
    if (!trainId) return;

    const fetchParticipants = async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('train_id', trainId)
        .order('joined_at', { ascending: true });

      if (error) {
        console.error('Error fetching participants:', error);
      } else {
        setParticipants(data || []);
      }
    };

    fetchParticipants();
  }, [trainId]);

  // Validate Instagram username
  const isValidUsername = (username) => {
    // Remove @ symbol if present
    const cleanUsername = username.replace(/^@/, '');
    // Check if username is valid (alphanumeric, dots, underscores only, max 30 chars)
    const regex = /^[a-zA-Z0-9._]{1,30}$/;
    return regex.test(cleanUsername);
  };

  // Create a new train
  const handleCreateTrain = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate inputs
    if (!createFormData.trainName.trim() || !createFormData.displayName.trim() || !createFormData.username.trim()) {
      setError('All required fields must be filled.');
      setLoading(false);
      return;
    }

    if (!isValidUsername(createFormData.username)) {
      setError('Invalid Instagram username. Only letters, numbers, dots, and underscores allowed (max 30 characters).');
      setLoading(false);
      return;
    }

    // Generate random 6-character ID
    const generateId = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const newTrainId = generateId();

    // Insert train
    const { data: trainData, error: trainError } = await supabase
      .from('trains')
      .insert([{ id: newTrainId, name: createFormData.trainName }])
      .select()
      .single();

    if (trainError) {
      setError('Failed to create train. Please try again.');
      setLoading(false);
      return;
    }

    // Insert host participant
    const { error: participantError } = await supabase
      .from('participants')
      .insert([{
        train_id: newTrainId,
        display_name: createFormData.displayName,
        username: createFormData.username.replace(/^@/, '').toLowerCase(),
        bio: createFormData.bio,
        is_host: true
      }]);

    if (participantError) {
      setError('Failed to add participant. Please try again.');
      setLoading(false);
      return;
    }

    // Update state and redirect
    setTrainId(newTrainId);
    setTrainName(trainData.name);
    setCurrentView('train');
    setLoading(false);
  };

  // Join an existing train
  const handleJoinTrain = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate inputs
    if (!joinFormData.displayName.trim() || !joinFormData.username.trim()) {
      setError('Display name and username are required.');
      setLoading(false);
      return;
    }

    if (!isValidUsername(joinFormData.username)) {
      setError('Invalid Instagram username. Only letters, numbers, dots, and underscores allowed (max 30 characters).');
      setLoading(false);
      return;
    }

    // Check for duplicate username in the same train
    const existingParticipant = participants.find(p => 
      p.username === joinFormData.username.replace(/^@/, '').toLowerCase()
    );

    if (existingParticipant) {
      setError('This Instagram username is already in the train.');
      setLoading(false);
      return;
    }

    // Insert participant
    const { error: participantError } = await supabase
      .from('participants')
      .insert([{
        train_id: trainId,
        display_name: joinFormData.displayName,
        username: joinFormData.username.replace(/^@/, '').toLowerCase(),
        bio: joinFormData.bio,
        is_host: false
      }]);

    if (participantError) {
      setError('Failed to join train. Please try again.');
      setLoading(false);
      return;
    }

    // Close modal and reset form
    setShowJoinModal(false);
    setJoinFormData({ displayName: '', username: '', bio: '' });
    setLoading(false);
  };

  // Copy shareable link to clipboard
  const copyShareLink = () => {
    const link = `${window.location.origin}/?train=${trainId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render home view
  const renderHomeView = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <Sparkles className="h-12 w-12 text-purple-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">FollowTrain</h1>
        <p className="text-gray-600 mb-8">A lightweight app to share and follow each other on Instagram</p>
        <button
          onClick={() => setCurrentView('create')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity w-full"
        >
          Create a Train
        </button>
      </div>
    </div>
  );

  // Render create train view
  const renderCreateView = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create a Train</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleCreateTrain}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="trainName">
              Train Name *
            </label>
            <input
              id="trainName"
              type="text"
              value={createFormData.trainName}
              onChange={(e) => setCreateFormData({...createFormData, trainName: e.target.value})}
              maxLength="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="My Awesome Train"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="displayName">
              Your Display Name *
            </label>
            <input
              id="displayName"
              type="text"
              value={createFormData.displayName}
              onChange={(e) => setCreateFormData({...createFormData, displayName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="John Doe"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="username">
              Your Instagram Username *
            </label>
            <input
              id="username"
              type="text"
              value={createFormData.username}
              onChange={(e) => setCreateFormData({...createFormData, username: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="@username"
              required
            />
            <p className="text-xs text-gray-500 mt-1">We'll strip the @ symbol automatically</p>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="bio">
              Bio (Optional)
            </label>
            <textarea
              id="bio"
              value={createFormData.bio}
              onChange={(e) => setCreateFormData({...createFormData, bio: e.target.value})}
              maxLength="100"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Tell us about yourself..."
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Train'}
          </button>
        </form>
        
        <button
          onClick={() => setCurrentView('home')}
          className="mt-4 w-full text-purple-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );

  // Render train view
  const renderTrainView = () => {
    if (!trainId) return null;

    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-500 to-pink-500">
        {/* Header */}
        <div className="bg-white shadow-md p-4">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{trainName || `Train ${trainId}`}</h1>
              <p className="text-gray-600 text-sm">{participants.length} participant{participants.length !== 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={copyShareLink}
              className="mt-2 sm:mt-0 flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Copy size={16} />
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Participants Grid */}
        <div className="p-4 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {participants.map((participant) => (
              <a
                key={participant.id}
                href={`https://instagram.com/${participant.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <div className="p-4">
                    <div className="flex items-center mb-3">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(participant.display_name)}&size=48`}
                        alt={participant.display_name}
                        className="w-12 h-12 rounded-full mr-3"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">{participant.display_name}</h3>
                        <p className="text-purple-600 text-sm truncate">@{participant.username}</p>
                        {participant.is_host && (
                          <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mt-1">
                            Host
                          </span>
                        )}
                      </div>
                    </div>
                    {participant.bio && (
                      <p className="text-gray-600 text-sm">{participant.bio}</p>
                    )}
                  </div>
                </div>
              </a>
            ))}
            
            {/* Plus Card for joining */}
            <div 
              onClick={() => setShowJoinModal(true)}
              className="bg-white border-2 border-dashed border-gray-300 rounded-xl shadow-md flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 transition-colors h-full"
              style={{ minHeight: '160px' }}
            >
              <Plus className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-500 font-medium">Join Train</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render join modal
  const renderJoinModal = () => {
    if (!showJoinModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Join Train</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleJoinTrain}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="joinDisplayName">
                Display Name *
              </label>
              <input
                id="joinDisplayName"
                type="text"
                value={joinFormData.displayName}
                onChange={(e) => setJoinFormData({...joinFormData, displayName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="John Doe"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="joinUsername">
                Instagram Username *
              </label>
              <input
                id="joinUsername"
                type="text"
                value={joinFormData.username}
                onChange={(e) => setJoinFormData({...joinFormData, username: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="@username"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="joinBio">
                Bio (Optional)
              </label>
              <textarea
                id="joinBio"
                value={joinFormData.bio}
                onChange={(e) => setJoinFormData({...joinFormData, bio: e.target.value})}
                maxLength="100"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Tell us about yourself..."
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowJoinModal(false);
                  setError('');
                  setJoinFormData({ displayName: '', username: '', bio: '' });
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Join Train'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="font-sans">
      {currentView === 'home' && renderHomeView()}
      {currentView === 'create' && renderCreateView()}
      {currentView === 'train' && renderTrainView()}
      {renderJoinModal()}
    </div>
  );
};

export default App;