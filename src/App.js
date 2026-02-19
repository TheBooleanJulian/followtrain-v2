import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Copy, Plus, Sparkles, QrCode } from 'lucide-react';
import { supabase } from './supabaseClient';
import QRCode from 'react-qr-code';

const App = () => {
  console.log('App component mounted');
  
  const [darkMode, setDarkMode] = useState(false); // Default to false initially
  
  // Set the initial dark mode after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (window.matchMedia) {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldUseDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
        setDarkMode(shouldUseDark);
      } else if (savedTheme) {
        setDarkMode(savedTheme === 'dark');
      }
    }
  }, []); // Run once after mount
  
  // Debug: Log every second to verify JavaScript is running
  useEffect(() => {
    console.log('App is running, time:', new Date().toISOString());
    const interval = setInterval(() => {
      console.log('Heartbeat:', new Date().toISOString());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const [currentView, setCurrentView] = useState('home');
  const [trainId, setTrainId] = useState('');
  const [trainName, setTrainName] = useState('');

  const [participants, setParticipants] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [joinFormData, setJoinFormData] = useState({
    displayName: '',
    instagram: '',
    tiktok: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    twitch: '',
    bio: ''
  });
  const [createFormData, setCreateFormData] = useState({
    trainName: '',
    displayName: '',
    instagram: '',
    tiktok: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    twitch: '',
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

  // Apply dark mode class to body and save preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  }, [darkMode]);

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

  // Validate usernames for different platforms
  const isValidUsername = (username, platform) => {
    if (!username.trim()) return true; // Empty is allowed
    
    // Remove @ symbol if present
    const cleanUsername = username.replace(/^@/, '');
    
    // Platform-specific validation
    switch (platform) {
      case 'instagram':
        // Instagram: alphanumeric, dots, underscores only, max 30 chars
        return /^[a-zA-Z0-9._]{1,30}$/.test(cleanUsername);
      case 'tiktok':
        // TikTok: alphanumeric, dots, underscores, max 50 chars
        return /^[a-zA-Z0-9._]{1,50}$/.test(cleanUsername);
      case 'twitter':
        // Twitter: alphanumeric, underscores, max 50 chars
        return /^[a-zA-Z0-9_]{1,50}$/.test(cleanUsername);
      case 'linkedin':
        // LinkedIn: alphanumeric, dashes, dots, max 100 chars
        return /^[a-zA-Z0-9.-]{1,100}$/.test(cleanUsername);
      case 'youtube':
        // YouTube: alphanumeric, max 100 chars
        return /^[a-zA-Z0-9]{1,100}$/.test(cleanUsername);
      case 'twitch':
        // Twitch: alphanumeric, underscores, max 50 chars
        return /^[a-zA-Z0-9_]{1,50}$/.test(cleanUsername);
      default:
        return true;
    }
  };

  // Check if at least one platform is provided
  const hasAtLeastOnePlatform = (formData) => {
    return formData.instagram || formData.tiktok || formData.twitter || 
           formData.linkedin || formData.youtube || formData.twitch;
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Create a new train
  const handleCreateTrain = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate inputs
    if (!createFormData.trainName.trim() || !createFormData.displayName.trim()) {
      setError('Train name and display name are required.');
      setLoading(false);
      return;
    }

    if (!hasAtLeastOnePlatform(createFormData)) {
      setError('At least one social platform username is required.');
      setLoading(false);
      return;
    }

    // Validate each platform username
    const platforms = ['instagram', 'tiktok', 'twitter', 'linkedin', 'youtube', 'twitch'];
    for (const platform of platforms) {
      if (createFormData[platform] && !isValidUsername(createFormData[platform], platform)) {
        setError(`Invalid ${platform} username. Please check the format requirements.`);
        setLoading(false);
        return;
      }
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
      console.error('Train creation error:', trainError);
      setError(`Failed to create train: ${trainError.message || 'Please try again.'}`);
      setLoading(false);
      return;
    }

    // Insert host participant
    const participantData = {
      train_id: newTrainId,
      display_name: createFormData.displayName,
      instagram_username: createFormData.instagram ? createFormData.instagram.replace(/^@/, '').toLowerCase() : null,
      tiktok_username: createFormData.tiktok ? createFormData.tiktok.replace(/^@/, '').toLowerCase() : null,
      twitter_username: createFormData.twitter ? createFormData.twitter.replace(/^@/, '').toLowerCase() : null,
      linkedin_username: createFormData.linkedin ? createFormData.linkedin.replace(/^@/, '').toLowerCase() : null,
      youtube_username: createFormData.youtube ? createFormData.youtube.replace(/^@/, '').toLowerCase() : null,
      twitch_username: createFormData.twitch ? createFormData.twitch.replace(/^@/, '').toLowerCase() : null,
      bio: createFormData.bio,
      is_host: true
    };

    console.log('Inserting participant data:', participantData);

    const { error: participantError } = await supabase
      .from('participants')
      .insert([participantData]);

    if (participantError) {
      console.error('Participant insertion error:', participantError);
      setError(`Failed to add participant: ${participantError.message || 'Please try again.'}`);
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
    if (!joinFormData.displayName.trim()) {
      setError('Display name is required.');
      setLoading(false);
      return;
    }

    if (!hasAtLeastOnePlatform(joinFormData)) {
      setError('At least one social platform username is required.');
      setLoading(false);
      return;
    }

    // Validate each platform username
    const platforms = ['instagram', 'tiktok', 'twitter', 'linkedin', 'youtube', 'twitch'];
    for (const platform of platforms) {
      if (joinFormData[platform] && !isValidUsername(joinFormData[platform], platform)) {
        setError(`Invalid ${platform} username. Please check the format requirements.`);
        setLoading(false);
        return;
      }
    }

    // Check for duplicate usernames in the same train
    for (const platform of platforms) {
      if (joinFormData[platform]) {
        const existingParticipant = participants.find(p => 
          p[`${platform}_username`] === joinFormData[platform].replace(/^@/, '').toLowerCase()
        );

        if (existingParticipant) {
          setError(`This ${platform} username is already in the train.`);
          setLoading(false);
          return;
        }
      }
    }

    // Insert participant
    const joinParticipantData = {
      train_id: trainId,
      display_name: joinFormData.displayName,
      instagram_username: joinFormData.instagram ? joinFormData.instagram.replace(/^@/, '').toLowerCase() : null,
      tiktok_username: joinFormData.tiktok ? joinFormData.tiktok.replace(/^@/, '').toLowerCase() : null,
      twitter_username: joinFormData.twitter ? joinFormData.twitter.replace(/^@/, '').toLowerCase() : null,
      linkedin_username: joinFormData.linkedin ? joinFormData.linkedin.replace(/^@/, '').toLowerCase() : null,
      youtube_username: joinFormData.youtube ? joinFormData.youtube.replace(/^@/, '').toLowerCase() : null,
      twitch_username: joinFormData.twitch ? joinFormData.twitch.replace(/^@/, '').toLowerCase() : null,
      bio: joinFormData.bio,
      is_host: false
    };

    console.log('Joining participant data:', joinParticipantData);

    const { error: participantError } = await supabase
      .from('participants')
      .insert([joinParticipantData]);

    if (participantError) {
      console.error('Join participant error:', participantError);
      setError(`Failed to join train: ${participantError.message || 'Please try again.'}`);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex flex-col items-center justify-center p-4 dark:from-gray-800 dark:to-gray-900">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center relative">
        <div className="flex justify-center mb-6 relative">
          <Sparkles className="h-12 w-12 text-purple-500" />
          <button
            onClick={toggleDarkMode}
            className="absolute top-0 right-0 bg-gray-200 text-gray-800 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            {darkMode ? " Light" : " Dark"}
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2 dark:text-white">FollowTrain</h1>
        <p className="text-gray-600 mb-8 dark:text-gray-300">A lightweight app to share and follow each other on Instagram</p>
        <div className="space-y-4">
          <button
            onClick={() => {
              console.log('Create Train button clicked!');
              console.log('Current time:', new Date().toISOString());
              setCurrentView('create');
            }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity w-full"
          >
            Create a Train
          </button>
          
          <button
            onClick={() => {
              console.log('TEST BUTTON CLICKED!');
              alert('Test button works! Time: ' + new Date().toISOString());
            }}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity w-full"
          >
            🔧 Test Button (Debug)
          </button>
        </div>
      </div>
    </div>
  );

  // Render create train view
  const renderCreateView = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex flex-col items-center justify-center p-4 dark:from-gray-800 dark:to-gray-900">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Create a Train</h2>
          <button
            onClick={toggleDarkMode}
            className="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            {darkMode ? "" : ""}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900 dark:border-red-700 dark:text-red-200">
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
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-3">
              Social Media Platforms (at least one required)
            </label>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="instagram">
                  Instagram Username
                </label>
                <input
                  id="instagram"
                  type="text"
                  value={createFormData.instagram}
                  onChange={(e) => setCreateFormData({...createFormData, instagram: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="@username"
                />
                <p className="text-xs text-gray-500 mt-1">Letters, numbers, dots, underscores (max 30 chars)</p>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="tiktok">
                  TikTok Username
                </label>
                <input
                  id="tiktok"
                  type="text"
                  value={createFormData.tiktok}
                  onChange={(e) => setCreateFormData({...createFormData, tiktok: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="@username"
                />
                <p className="text-xs text-gray-500 mt-1">Letters, numbers, dots, underscores (max 50 chars)</p>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="twitter">
                  Twitter/X Username
                </label>
                <input
                  id="twitter"
                  type="text"
                  value={createFormData.twitter}
                  onChange={(e) => setCreateFormData({...createFormData, twitter: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="@username"
                />
                <p className="text-xs text-gray-500 mt-1">Letters, numbers, underscores (max 50 chars)</p>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="linkedin">
                  LinkedIn Username
                </label>
                <input
                  id="linkedin"
                  type="text"
                  value={createFormData.linkedin}
                  onChange={(e) => setCreateFormData({...createFormData, linkedin: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="username"
                />
                <p className="text-xs text-gray-500 mt-1">Letters, numbers, dashes, dots (max 100 chars)</p>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="youtube">
                  YouTube Channel Name
                </label>
                <input
                  id="youtube"
                  type="text"
                  value={createFormData.youtube}
                  onChange={(e) => setCreateFormData({...createFormData, youtube: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="channelname"
                />
                <p className="text-xs text-gray-500 mt-1">Letters, numbers only (max 100 chars)</p>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="twitch">
                  Twitch Username
                </label>
                <input
                  id="twitch"
                  type="text"
                  value={createFormData.twitch}
                  onChange={(e) => setCreateFormData({...createFormData, twitch: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="@username"
                />
                <p className="text-xs text-gray-500 mt-1">Letters, numbers, underscores (max 50 chars)</p>
              </div>
            </div>
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
      <div className="min-h-screen bg-gradient-to-b from-purple-500 to-pink-500 dark:from-gray-800 dark:to-gray-900">
        {/* Header */}
        <div className="bg-white shadow-md p-4 dark:bg-gray-800 dark:text-white">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">{trainName || `Train ${trainId}`}</h1>
              <p className="text-gray-600 text-sm dark:text-gray-300">{participants.length} participant{participants.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-2 bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                {darkMode ? "Light" : "Dark"}
              </button>
              <button
                onClick={() => setShowQRModal(true)}
                className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <QrCode size={16} />
                QR Code
              </button>
              <button
                onClick={copyShareLink}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Copy size={16} />
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>

        {/* Participants Grid */}
        <div className="p-4 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="block cursor-pointer"
                onClick={() => {
                  // Open the first available platform URL
                  if (participant.instagram_username) {
                    window.open(`https://instagram.com/${participant.instagram_username}`, '_blank');
                  } else if (participant.tiktok_username) {
                    window.open(`https://tiktok.com/@${participant.tiktok_username}`, '_blank');
                  } else if (participant.twitter_username) {
                    window.open(`https://twitter.com/${participant.twitter_username}`, '_blank');
                  } else if (participant.linkedin_username) {
                    window.open(`https://linkedin.com/in/${participant.linkedin_username}`, '_blank');
                  } else if (participant.youtube_username) {
                    window.open(`https://youtube.com/${participant.youtube_username}`, '_blank');
                  } else if (participant.twitch_username) {
                    window.open(`https://twitch.tv/${participant.twitch_username}`, '_blank');
                  }
                }}
              >
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full dark:bg-gray-700">
                  <div className="p-4">
                    <div className="flex items-center mb-3">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(participant.display_name)}&size=48`}
                        alt={participant.display_name}
                        className="w-12 h-12 rounded-full mr-3"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate dark:text-white">{participant.display_name}</h3>
                        {participant.is_host && (
                          <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mt-1 dark:bg-purple-900 dark:text-purple-100">
                            Host
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Platform usernames */}
                    <div className="space-y-1 mb-3">
                      {participant.instagram_username && (
                        <div className="flex items-center text-sm dark:text-gray-300">
                          <span className="font-medium text-gray-700 w-20 dark:text-gray-400">Instagram:</span>
                          <span className="text-purple-600 truncate dark:text-purple-400">@{participant.instagram_username}</span>
                        </div>
                      )}
                      {participant.tiktok_username && (
                        <div className="flex items-center text-sm dark:text-gray-300">
                          <span className="font-medium text-gray-700 w-20 dark:text-gray-400">TikTok:</span>
                          <span className="text-purple-600 truncate dark:text-purple-400">@{participant.tiktok_username}</span>
                        </div>
                      )}
                      {participant.twitter_username && (
                        <div className="flex items-center text-sm dark:text-gray-300">
                          <span className="font-medium text-gray-700 w-20 dark:text-gray-400">Twitter:</span>
                          <span className="text-purple-600 truncate dark:text-purple-400">@{participant.twitter_username}</span>
                        </div>
                      )}
                      {participant.linkedin_username && (
                        <div className="flex items-center text-sm dark:text-gray-300">
                          <span className="font-medium text-gray-700 w-20 dark:text-gray-400">LinkedIn:</span>
                          <span className="text-purple-600 truncate dark:text-purple-400">@{participant.linkedin_username}</span>
                        </div>
                      )}
                      {participant.youtube_username && (
                        <div className="flex items-center text-sm dark:text-gray-300">
                          <span className="font-medium text-gray-700 w-20 dark:text-gray-400">YouTube:</span>
                          <span className="text-purple-600 truncate dark:text-purple-400">@{participant.youtube_username}</span>
                        </div>
                      )}
                      {participant.twitch_username && (
                        <div className="flex items-center text-sm dark:text-gray-300">
                          <span className="font-medium text-gray-700 w-20 dark:text-gray-400">Twitch:</span>
                          <span className="text-purple-600 truncate dark:text-purple-400">@{participant.twitch_username}</span>
                        </div>
                      )}
                    </div>
                    {participant.bio && (
                      <p className="text-gray-600 text-sm dark:text-gray-300">{participant.bio}</p>
                    )}
                  </div>
                </div>
              </div>
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

  // Render QR code modal
  const renderQRModal = () => {
    if (!showQRModal) return null;
    
    const shareLink = `${window.location.origin}/?train=${trainId}`;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full dark:bg-gray-800 dark:text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 dark:text-white">Share via QR Code</h2>
            <p className="text-gray-600 mb-6 dark:text-gray-300">Scan this QR code to join the train</p>
            
            <div className="bg-gray-50 p-6 rounded-xl flex items-center justify-center mb-6 dark:bg-gray-700">
              <QRCode 
                value={shareLink} 
                size={200}
                level="H"
                includeMargin={true}
                className="bg-white p-2 rounded-lg"
              />
            </div>
            
            <div className="text-sm text-gray-500 mb-6 dark:text-gray-400">
              <p className="font-medium dark:text-gray-300">Train ID: {trainId}</p>
              <p className="truncate dark:text-gray-400">{shareLink}</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowQRModal(false);
                  copyShareLink();
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity dark:hover:opacity-75"
              >
                <Copy size={16} />
                Copy Link
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Close
              </button>
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
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full dark:bg-gray-800 dark:text-white">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center dark:text-white">Join Train</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900 dark:border-red-700 dark:text-red-200">
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
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-3">
                Social Media Platforms (at least one required)
              </label>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="joinInstagram">
                    Instagram Username
                  </label>
                  <input
                    id="joinInstagram"
                    type="text"
                    value={joinFormData.instagram}
                    onChange={(e) => setJoinFormData({...joinFormData, instagram: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="@username"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="joinTiktok">
                    TikTok Username
                  </label>
                  <input
                    id="joinTiktok"
                    type="text"
                    value={joinFormData.tiktok}
                    onChange={(e) => setJoinFormData({...joinFormData, tiktok: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="@username"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="joinTwitter">
                    Twitter/X Username
                  </label>
                  <input
                    id="joinTwitter"
                    type="text"
                    value={joinFormData.twitter}
                    onChange={(e) => setJoinFormData({...joinFormData, twitter: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="@username"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="joinLinkedin">
                    LinkedIn Username
                  </label>
                  <input
                    id="joinLinkedin"
                    type="text"
                    value={joinFormData.linkedin}
                    onChange={(e) => setJoinFormData({...joinFormData, linkedin: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="username"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="joinYoutube">
                    YouTube Channel Name
                  </label>
                  <input
                    id="joinYoutube"
                    type="text"
                    value={joinFormData.youtube}
                    onChange={(e) => setJoinFormData({...joinFormData, youtube: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="channelname"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="joinTwitch">
                    Twitch Username
                  </label>
                  <input
                    id="joinTwitch"
                    type="text"
                    value={joinFormData.twitch}
                    onChange={(e) => setJoinFormData({...joinFormData, twitch: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="@username"
                  />
                </div>
              </div>
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
      {renderQRModal()}
    </div>
  );
};

export default App;