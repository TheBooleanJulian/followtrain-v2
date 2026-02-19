import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Copy, Plus, QrCode } from 'lucide-react';
import { supabase } from './supabaseClient';
import QRCode from 'react-qr-code';

// Utility function to detect mobile devices
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Function to create smart links with deep linking priority on mobile
const createSmartLink = (platform, username) => {
  if (!username) return null;
  
  const isMobile = isMobileDevice();
  
  // Define deep link schemes for mobile
  const deepLinks = {
    instagram: `instagram://user?username=${username.replace('@', '')}`,
    tiktok: `tiktok://@${username.replace('@', '')}`,
    twitter: `twitter://user?screen_name=${username.replace('@', '')}`,
    snapchat: `snapchat://add/${username.replace('@', '')}`,
    youtube: `youtube://user/${username.replace('@', '')}`,
    twitch: `twitch://channel/${username.replace('@', '')}`,
  };
  
  // Define web URLs
  const webUrls = {
    instagram: `https://instagram.com/${username.replace('@', '')}`,
    tiktok: `https://tiktok.com/@${username.replace('@', '')}`,
    twitter: `https://twitter.com/${username.replace('@', '')}`,
    snapchat: `https://snapchat.com/add/${username.replace('@', '')}`,
    youtube: `https://youtube.com/${username.replace('@', '')}`,
    twitch: `https://twitch.tv/${username.replace('@', '')}`,
  };
  
  if (isMobile && deepLinks[platform]) {
    // Try deep link first, fallback to web
    return {
      url: deepLinks[platform],
      fallback: webUrls[platform],
      isDeepLink: true
    };
  }
  
  return {
    url: webUrls[platform],
    isDeepLink: false
  };
};

// Function to handle link click with fallback
const handleLinkClick = (smartLink) => {
  if (!smartLink) return;
  
  if (smartLink.isDeepLink && smartLink.fallback) {
    // For deep links with fallback, try deep link and fall back to web
    const startTime = Date.now();
    window.location.href = smartLink.url;
    
    // Fallback to web URL if deep link fails
    setTimeout(() => {
      if (Date.now() - startTime < 2000) { // 2 second threshold
        window.open(smartLink.fallback, '_blank');
      }
    }, 1000);
  } else {
    // For web links or deep links without fallback
    window.open(smartLink.url, '_blank');
  }
};

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
    }, 10000); // Reduced to every 10 seconds to reduce console spam
    
    return () => clearInterval(interval);
  }, []);
  
  // Optimize loading by deferring non-critical operations
  useEffect(() => {
    // Small delay to ensure DOM is fully ready
    const timer = setTimeout(() => {
      console.log('App fully initialized');
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  const [currentView, setCurrentView] = useState('home');
  const [trainId, setTrainId] = useState('');
  const [trainName, setTrainName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false); // Track if current user is the host/admin
  const [adminToken, setAdminToken] = useState(''); // Store admin token
  const [trainLocked, setTrainLocked] = useState(false); // Track if train is locked
  const [showAdminPanel, setShowAdminPanel] = useState(false); // Show/hide admin panel

  const [participants, setParticipants] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  
  // Rate limiting state
  const [lastJoinRequest, setLastJoinRequest] = useState(0);
  const [rateLimitEnabled, setRateLimitEnabled] = useState(true); // Toggle for debugging
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
    primaryPlatform: '',
    primaryHandle: '',
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
  const [guestTrainId, setGuestTrainId] = useState('');
  
  // Auto-fill states for social media usernames
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState({});
  const [showAutocomplete, setShowAutocomplete] = useState({});
  const [autocompleteLoading, setAutocompleteLoading] = useState({});

  // Extract train ID or debug flag from URL on initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const trainParam = urlParams.get('train');
    const path = window.location.pathname;
    
    if (path === '/debug') {
      setCurrentView('debug');
    } else if (trainParam) {
      setTrainId(trainParam.toUpperCase());
      setCurrentView('train');
    }
  }, []);

  // Subscribe to real-time updates for participants
  useEffect(() => {
    if (!trainId) return;

    // Fetch the train lock status
    const fetchTrainStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('trains')
          .select('locked')
          .eq('id', trainId)
          .single();
        
        if (error) {
          console.error('Error fetching train status:', error);
          return;
        }
        
        setTrainLocked(data.locked);
      } catch (err) {
        console.error('Error in fetchTrainStatus:', err);
      }
    };
    
    fetchTrainStatus();

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
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'participants',
          filter: `train_id=eq.${trainId}`
        },
        (payload) => {
          setParticipants(prev =>
            prev.map(p => p.id === payload.new.id ? payload.new : p)
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'participants',
          filter: `train_id=eq.${trainId}`
        },
        (payload) => {
          setParticipants(prev =>
            prev.filter(p => p.id !== payload.old.id)
          );
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
        // LinkedIn URL validation
        return isValidUrl(username, 'linkedin');
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

  // Validate URL format for LinkedIn and Facebook
  const isValidUrl = (url, platform) => {
    if (!url.trim()) return true; // Empty is allowed
    
    try {
      const urlObj = new URL(url);
      
      // Platform-specific URL validation
      switch (platform) {
        case 'linkedin':
          return urlObj.hostname === 'www.linkedin.com' || urlObj.hostname === 'linkedin.com';
        case 'facebook':
          return urlObj.hostname === 'www.facebook.com' || urlObj.hostname === 'facebook.com';
        default:
          return false;
      }
    } catch (e) {
      return false; // Invalid URL format
    }
  };

  // Sanitize URL by removing tracking parameters
  const sanitizeUrl = (url) => {
    if (!url.trim()) return url;
    
    try {
      const urlObj = new URL(url);
      // Remove common tracking parameters
      urlObj.search = '';
      urlObj.hash = '';
      return urlObj.toString();
    } catch (e) {
      return url; // Return original if invalid URL
    }
  };


  // Test database connection
  const testDatabaseConnection = async () => {
    try {
      console.log('Testing database connection...');
      const { error } = await supabase
        .from('trains')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('Database connection test failed:', error);
        alert(`Database Error: ${error.message}`);
      } else {
        console.log('Database connection successful');
        alert('Database connection successful!');
      }
    } catch (err) {
      console.error('Database test error:', err);
      alert(`Connection Error: ${err.message}`);
    }
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
    
    // Validate primary platform and handle
    if (!createFormData.primaryPlatform || !createFormData.primaryHandle) {
      setError('Please select a primary platform and enter a handle for avatar generation.');
      setLoading(false);
      return;
    }
    
    // Validate primary handle format
    if (!isValidUsername(createFormData.primaryHandle, createFormData.primaryPlatform)) {
      setError(`Invalid ${createFormData.primaryPlatform} username. Please check the format requirements.`);
      setLoading(false);
      return;
    }
    
    // Validate additional platforms
    const platforms = ['instagram', 'tiktok', 'twitter', 'linkedin', 'youtube', 'twitch'];
    for (const platform of platforms) {
      if (createFormData[platform]) {
        if (platform === 'linkedin') {
          // Special validation for LinkedIn URLs
          if (!isValidUrl(createFormData[platform], 'linkedin')) {
            setError('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/your-profile)');
            setLoading(false);
            return;
          }
        } else {
          // Regular username validation for other platforms
          if (!isValidUsername(createFormData[platform], platform)) {
            setError(`Invalid ${platform} username. Please check the format requirements.`);
            setLoading(false);
            return;
          }
        }
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

    // Check if tables exist first
    try {
      const { error: tableError } = await supabase
        .from('trains')
        .select('id')
        .limit(1);
      
      if (tableError && tableError.message.includes('not found')) {
        console.error('Database tables not found:', tableError);
        setError('Database not set up. Please run the schema.sql file in your Supabase SQL editor.');
        setLoading(false);
        return;
      }
    } catch (checkError) {
      console.error('Table check failed:', checkError);
    }

    // Generate admin token for host
    const newAdminToken = generateId() + generateId(); // Double ID for stronger token
    
    // Try/catch retry logic for ID collision handling
    let newTrainId;
    let trainData;
    let trainError;
    let attempts = 0;
    const maxAttempts = 3; // Limit retries to prevent infinite loops
    
    while (attempts < maxAttempts) {
      newTrainId = generateId();
      attempts++;
      
      try {
        // Insert train with the generated ID
        const result = await supabase
          .from('trains')
          .insert([{ id: newTrainId, name: createFormData.trainName, locked: false }])
          .select()
          .single();
        
        trainData = result.data;
        trainError = result.error;
        
        // If successful, break out of the retry loop
        if (!trainError) {
          break;
        }
        
        // If it's not a unique constraint error, re-throw to handle normally
        if (!trainError.message.includes('duplicate key value') && 
            !trainError.message.includes('unique constraint')) {
          throw trainError;
        }
        
        // If we've reached max attempts, show error
        if (attempts >= maxAttempts) {
          throw new Error(`Failed to generate unique train ID after ${maxAttempts} attempts. Please try again.`);
        }
        
        // Log collision and continue to retry
        console.log(`Train ID collision detected for ID: ${newTrainId}, retrying... (${attempts}/${maxAttempts})`);
        
      } catch (error) {
        // Handle any errors that aren't caught by the supabase error checking
        if (attempts >= maxAttempts) {
          console.error('Train creation failed after max retries:', error);
          setError(`Failed to create train: ${error.message || 'Please try again.'}`);
          setLoading(false);
          return;
        }
        // For other errors during retry attempts, continue to next iteration
        console.log(`Attempt ${attempts} failed, retrying...`);
      }
    }
    
    // Final error check after all retry attempts
    if (trainError) {
      console.error('Train creation error:', trainError);
      setError(`Failed to create train: ${trainError.message || 'Please try again.'}`);
      setLoading(false);
      return;
    }

    // Generate avatar URL for host
    const hostAvatarUrl = await generateAvatarUrl(
      createFormData.primaryPlatform,
      createFormData.primaryHandle,
      createFormData.displayName
    );

    // Sanitize LinkedIn URL if provided
    const sanitizedLinkedin = createFormData.linkedin ? sanitizeUrl(createFormData.linkedin) : null;
    
    // Insert host participant
    const participantData = {
      train_id: newTrainId,
      display_name: createFormData.displayName,
      instagram_username: createFormData.instagram ? createFormData.instagram.replace(/^@/, '').toLowerCase() : null,
      tiktok_username: createFormData.tiktok ? createFormData.tiktok.replace(/^@/, '').toLowerCase() : null,
      twitter_username: createFormData.twitter ? createFormData.twitter.replace(/^@/, '').toLowerCase() : null,
      linkedin_username: sanitizedLinkedin,
      youtube_username: createFormData.youtube ? createFormData.youtube.replace(/^@/, '').toLowerCase() : null,
      twitch_username: createFormData.twitch ? createFormData.twitch.replace(/^@/, '').toLowerCase() : null,
      bio: createFormData.bio,
      is_host: true,
      admin_token: newAdminToken,
      avatar_url: hostAvatarUrl
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
    setIsAdmin(true); // Set as admin since they created the train
    setAdminToken(newAdminToken); // Store admin token
    setCurrentView('train');
    
    // Reset form
    setCreateFormData({
      trainName: '',
      displayName: '',
      primaryPlatform: '',
      primaryHandle: '',
      instagram: '',
      tiktok: '',
      twitter: '',
      linkedin: '',
      youtube: '',
      twitch: '',
      bio: ''
    });
    
    setLoading(false);
  };

  // Function to generate avatar URL with fallback
  const generateAvatarUrl = async (primaryPlatform, primaryHandle, displayName) => {
    // If no primary platform is selected, use display name only
    if (!primaryPlatform || !primaryHandle) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=48&background=random`;
    }
    
    // Try to fetch avatar from the primary platform
    const platformUrls = {
      instagram: `https://unavatar.io/instagram/${primaryHandle.replace(/^@/, '')}`,
      twitter: `https://unavatar.io/twitter/${primaryHandle.replace(/^@/, '')}`,
      youtube: `https://unavatar.io/youtube/${primaryHandle.replace(/^@/, '')}`,
      twitch: `https://unavatar.io/twitch/${primaryHandle.replace(/^@/, '')}`,
      tiktok: `https://unavatar.io/tiktok/${primaryHandle.replace(/^@/, '')}`,
      linkedin: `https://unavatar.io/linkedin/${primaryHandle.replace(/^@/, '')}`
    };
    
    // Return the primary platform avatar URL
    if (platformUrls[primaryPlatform]) {
      return platformUrls[primaryPlatform];
    }
    
    // Fallback to ui-avatars if platform is not supported
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=48&background=random`;
  };
  
  // Auto-complete functions for social media usernames
  const fetchAutocompleteSuggestions = async (platform, query, fieldId) => {
    if (!query || query.length < 2) {
      setAutocompleteSuggestions(prev => ({ ...prev, [fieldId]: [] }));
      setShowAutocomplete(prev => ({ ...prev, [fieldId]: false }));
      return;
    }
    
    setAutocompleteLoading(prev => ({ ...prev, [fieldId]: true }));
    
    try {
      // Simulate API call - in a real implementation, you'd call the actual platform APIs
      // For demo purposes, we'll generate mock suggestions
      const mockSuggestions = [];
      
      // Generate 3-5 mock suggestions with different avatars
      const suggestionCount = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < suggestionCount; i++) {
        const randomSuffix = Math.floor(Math.random() * 1000);
        const username = `${query}${randomSuffix}`;
        const displayName = `${query.charAt(0).toUpperCase() + query.slice(1)} User ${randomSuffix}`;
        
        mockSuggestions.push({
          username: username,
          displayName: displayName,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=40&background=random&${i}`
        });
      }
      
      // Add the exact match if it's a valid username
      if (isValidUsername(query, platform)) {
        mockSuggestions.unshift({
          username: query,
          displayName: `${query.charAt(0).toUpperCase() + query.slice(1)} (Exact Match)`,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(query)}&size=40&background=00aa00&color=ffffff`
        });
      }
      
      setAutocompleteSuggestions(prev => ({ ...prev, [fieldId]: mockSuggestions }));
      setShowAutocomplete(prev => ({ ...prev, [fieldId]: true }));
      
    } catch (error) {
      console.error('Autocomplete error:', error);
      setAutocompleteSuggestions(prev => ({ ...prev, [fieldId]: [] }));
    } finally {
      setAutocompleteLoading(prev => ({ ...prev, [fieldId]: false }));
    }
  };
  
  const handleAutocompleteSelect = (username, fieldId, formDataUpdater) => {
    formDataUpdater(prev => ({ ...prev, [fieldId]: username }));
    setAutocompleteSuggestions(prev => ({ ...prev, [fieldId]: [] }));
    setShowAutocomplete(prev => ({ ...prev, [fieldId]: false }));
  };
  
  const handleAutocompleteBlur = (fieldId) => {
    // Small delay to allow click events on suggestions to fire first
    setTimeout(() => {
      setShowAutocomplete(prev => ({ ...prev, [fieldId]: false }));
    }, 150);
  };
  
  // Create autocomplete input component
  const AutoCompleteInput = ({ platform, value, onChange, placeholder, formDataUpdater, fieldId, maxLength, className }) => {
    const [localValue, setLocalValue] = useState(value || '');
    
    useEffect(() => {
      setLocalValue(value || '');
    }, [value]);
    
    const handleChange = (e) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(e);
      
      // Trigger autocomplete after 300ms of no typing
      clearTimeout(window.autocompleteTimer);
      window.autocompleteTimer = setTimeout(() => {
        fetchAutocompleteSuggestions(platform, newValue.replace('@', ''), fieldId);
      }, 300);
    };
    
    return (
      <div className="relative">
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          onBlur={() => handleAutocompleteBlur(fieldId)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={className}
        />
        
        {/* Autocomplete dropdown */}
        {showAutocomplete[fieldId] && autocompleteSuggestions[fieldId] && autocompleteSuggestions[fieldId].length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
            {autocompleteLoading[fieldId] ? (
              <div className="px-4 py-3 text-gray-500 text-center dark:text-gray-400">
                Loading suggestions...
              </div>
            ) : (
              autocompleteSuggestions[fieldId].map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleAutocompleteSelect(suggestion.username, fieldId, formDataUpdater)}
                  className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 dark:hover:bg-gray-700 dark:border-gray-700"
                >
                  <img
                    src={suggestion.avatar}
                    alt={suggestion.displayName}
                    className="w-10 h-10 rounded-full mr-3"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(suggestion.displayName)}&size=40&background=cccccc&color=666666`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate dark:text-white">
                      @{suggestion.username}
                    </div>
                    <div className="text-sm text-gray-500 truncate dark:text-gray-400">
                      {suggestion.displayName}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };
  
  // Join an existing train
  const handleJoinTrain = async (e) => {
    e.preventDefault();
    
    // Rate limiting check
    const now = Date.now();
    const timeSinceLastRequest = now - lastJoinRequest;
    const rateLimitDelay = 2000; // 2 seconds between requests
    
    if (rateLimitEnabled && timeSinceLastRequest < rateLimitDelay) {
      setError(`Please wait before submitting again. ${Math.ceil((rateLimitDelay - timeSinceLastRequest) / 1000)}s remaining.`);
      return;
    }
    
    setLoading(true);
    setError('');

    // Validate inputs
    if (!joinFormData.displayName.trim()) {
      setError('Display name is required.');
      setLoading(false);
      return;
    }
    
    // Validate primary platform and handle
    if (!joinFormData.primaryPlatform || !joinFormData.primaryHandle) {
      setError('Please select a primary platform and enter a handle for avatar generation.');
      setLoading(false);
      return;
    }
    
    // Validate primary handle format
    if (!isValidUsername(joinFormData.primaryHandle, joinFormData.primaryPlatform)) {
      setError(`Invalid ${joinFormData.primaryPlatform} username. Please check the format requirements.`);
      setLoading(false);
      return;
    }
    
    // Validate additional platforms
    const platforms = ['instagram', 'tiktok', 'twitter', 'linkedin', 'youtube', 'twitch'];
    for (const platform of platforms) {
      if (joinFormData[platform]) {
        if (platform === 'linkedin') {
          // Special validation for LinkedIn URLs
          if (!isValidUrl(joinFormData[platform], 'linkedin')) {
            setError('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/your-profile)');
            setLoading(false);
            return;
          }
        } else {
          // Regular username validation for other platforms
          if (!isValidUsername(joinFormData[platform], platform)) {
            setError(`Invalid ${platform} username. Please check the format requirements.`);
            setLoading(false);
            return;
          }
        }
      }
    }
    
    // Update last request time
    setLastJoinRequest(now);

    // Check if train is locked
    const { data: trainData, error: trainCheckError } = await supabase
      .from('trains')
      .select('locked')
      .eq('id', trainId)
      .single();
    
    if (trainCheckError) {
      console.error('Error checking train lock status:', trainCheckError);
      setError('Failed to check train status. Please try again.');
      setLoading(false);
      return;
    }
    
    if (trainData.locked) {
      setError('This train is locked. No new members can join.');
      setLoading(false);
      return;
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
    
    // Generate avatar URL
    const avatarUrl = await generateAvatarUrl(
      joinFormData.primaryPlatform,
      joinFormData.primaryHandle,
      joinFormData.displayName
    );

    // Insert participant
    // Sanitize LinkedIn URL if provided
    const sanitizedLinkedin = joinFormData.linkedin ? sanitizeUrl(joinFormData.linkedin) : null;
    
    const joinParticipantData = {
      train_id: trainId,
      display_name: joinFormData.displayName,
      instagram_username: joinFormData.instagram ? joinFormData.instagram.replace(/^@/, '').toLowerCase() : null,
      tiktok_username: joinFormData.tiktok ? joinFormData.tiktok.replace(/^@/, '').toLowerCase() : null,
      twitter_username: joinFormData.twitter ? joinFormData.twitter.replace(/^@/, '').toLowerCase() : null,
      linkedin_username: sanitizedLinkedin,
      youtube_username: joinFormData.youtube ? joinFormData.youtube.replace(/^@/, '').toLowerCase() : null,
      twitch_username: joinFormData.twitch ? joinFormData.twitch.replace(/^@/, '').toLowerCase() : null,
      bio: joinFormData.bio,
      is_host: false,
      avatar_url: avatarUrl
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
    setJoinFormData({ 
      displayName: '', 
      primaryPlatform: '', 
      primaryHandle: '', 
      instagram: '',
      tiktok: '',
      twitter: '',
      linkedin: '',
      youtube: '',
      twitch: '',
      bio: '' 
    });
    setLoading(false);
  };

  // Admin control functions
  const toggleTrainLock = async () => {
    try {
      const { error } = await supabase
        .from('trains')
        .update({ locked: !trainLocked })
        .eq('id', trainId);
      
      if (error) {
        console.error('Error toggling train lock:', error);
        setError('Failed to toggle train lock status');
        return;
      }
      
      setTrainLocked(!trainLocked);
      console.log('Train lock status updated to:', !trainLocked);
    } catch (err) {
      console.error('Error in toggleTrainLock:', err);
      setError('Failed to update train lock status');
    }
  };
  
  const kickUser = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user from the train?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', userId)
        .eq('train_id', trainId);
      
      if (error) {
        console.error('Error kicking user:', error);
        setError('Failed to remove user from train');
        return;
      }
      
      console.log('User kicked successfully');
      // The participant list will update via real-time subscription
    } catch (err) {
      console.error('Error in kickUser:', err);
      setError('Failed to remove user from train');
    }
  };
  
  const clearTrain = async () => {
    if (!window.confirm('⚠️ DANGER ZONE ⚠️\n\nAre you sure you want to clear the entire train? This will remove ALL users and cannot be undone!')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('train_id', trainId);
      
      if (error) {
        console.error('Error clearing train:', error);
        setError('Failed to clear train');
        return;
      }
      
      console.log('Train cleared successfully');
      // The participant list will update via real-time subscription
    } catch (err) {
      console.error('Error in clearTrain:', err);
      setError('Failed to clear train');
    }
  };
  // Handle guest train ID entry
  const handleGuestJoinTrain = async (e) => {
    e.preventDefault();
    const id = guestTrainId.trim().toUpperCase();
    
    if (!id) {
      setError('Please enter a train ID.');
      return;
    }
    
    if (id.length !== 6) {
      setError('Train ID must be 6 characters long.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Check if train exists and get its details
      const { data, error: trainError } = await supabase
        .from('trains')
        .select('id, name, locked, expires_at')
        .eq('id', id)
        .single();
      
      if (trainError || !data) {
        setError('Invalid or expired Train ID.');
        setLoading(false);
        return;
      }

      // Check if train is locked
      if (data.locked) {
        setError('This train is locked. No new members can join.');
        setLoading(false);
        return;
      }
      
      // Check if train has expired
      if (data.expires_at) {
        const expiryDate = new Date(data.expires_at);
        if (expiryDate < new Date()) {
          setError('This train has expired.');
          setLoading(false);
          return;
        }
      }
      
      // Train is valid, set state and navigate
      setTrainId(id);
      setTrainName(data.name);
      setIsAdmin(false);
      setCurrentView('train');
      setGuestTrainId('');
      setLoading(false);
    } catch (err) {
      console.error('Error joining train:', err);
      setError('Failed to access train. Please try again.');
      setLoading(false);
    }
  };

  // Export utility functions
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    instagram: true,
    tiktok: true,
    twitter: true,
    linkedin: true,
    youtube: true,
    twitch: true
  });
  
  const [showExportPanel, setShowExportPanel] = useState(false);
  
  const togglePlatformSelection = (platform) => {
    setSelectedPlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };
  
  const toggleAllPlatforms = (selectAll) => {
    setSelectedPlatforms({
      instagram: selectAll,
      tiktok: selectAll,
      twitter: selectAll,
      linkedin: selectAll,
      youtube: selectAll,
      twitch: selectAll
    });
  };
  
  // Actually use adminToken in the UI
  useEffect(() => {
    if (adminToken) {
      console.log('Admin token stored for this session');
    }
  }, [adminToken]);
  
  const copyAllHandles = () => {
    const platformNames = {
      instagram: 'Instagram',
      tiktok: 'TikTok',
      twitter: 'Twitter',
      linkedin: 'LinkedIn',
      youtube: 'YouTube',
      twitch: 'Twitch'
    };
    
    let exportText = `Train: ${trainName || trainId}\nParticipants: ${participants.length}\n\n`;
    
    participants.forEach((participant, index) => {
      exportText += `${index + 1}. ${participant.display_name}${participant.is_host ? ' (Host)' : ''}\n`;
      
      Object.entries(selectedPlatforms).forEach(([platform, isSelected]) => {
        if (isSelected && participant[`${platform}_username`]) {
          exportText += `   ${platformNames[platform]}: @${participant[`${platform}_username`]}\n`;
        }
      });
      
      if (participant.bio) {
        exportText += `   Bio: ${participant.bio}\n`;
      }
      exportText += '\n';
    });
    
    navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    alert('All handles copied to clipboard!');
  };
  
  const exportToFile = (format = 'txt') => {
    const platformNames = {
      instagram: 'Instagram',
      tiktok: 'TikTok',
      twitter: 'Twitter',
      linkedin: 'LinkedIn',
      youtube: 'YouTube',
      twitch: 'Twitch'
    };
    
    let content = `Train: ${trainName || trainId}\nParticipants: ${participants.length}\n\n`;
    
    participants.forEach((participant, index) => {
      content += `${index + 1}. ${participant.display_name}${participant.is_host ? ' (Host)' : ''}\n`;
      
      Object.entries(selectedPlatforms).forEach(([platform, isSelected]) => {
        if (isSelected && participant[`${platform}_username`]) {
          content += `   ${platformNames[platform]}: @${participant[`${platform}_username`]}\n`;
        }
      });
      
      if (participant.bio) {
        content += `   Bio: ${participant.bio}\n`;
      }
      content += '\n';
    });
    
    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `followtrain-${trainId}-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center relative dark:bg-gray-800 dark:text-white">
        <div className="flex justify-center mb-6 relative">
          <img src="/followtrain-icon.png" alt="FollowTrain Icon" className="h-24 w-24 object-contain" />
          <button
            onClick={toggleDarkMode}
            className="absolute top-0 right-0 bg-gray-200 text-gray-800 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            {darkMode ? " Light" : " Dark"}
          </button>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2 dark:text-white">FollowTrain</h1>
        <p className="text-gray-600 mb-1 dark:text-gray-300">Share and follow each other on all social media platforms</p>
        <p className="text-gray-500 text-sm mb-8 dark:text-gray-400">No login required. Fast, easy, and fun!</p>
        
        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Created by{' '}
            <a 
              href="https://github.com/TheBooleanJulian" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline dark:text-purple-400"
            >
              TheBooleanJulian
            </a>
          </p>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900 dark:border-red-700 dark:text-red-200">
            {error}
          </div>
        )}
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
          
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 dark:bg-gray-800 dark:text-gray-400">Or</span>
            </div>
          </div>
          
          <form onSubmit={handleGuestJoinTrain} className="space-y-2">
            <input
              type="text"
              value={guestTrainId}
              onChange={(e) => setGuestTrainId(e.target.value.toUpperCase())}
              placeholder="Enter Train ID"
              maxLength="6"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:ring-purple-400 text-center font-mono tracking-widest"
            />
            <button
              type="submit"
              disabled={loading || !guestTrainId.trim()}
              className="w-full bg-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-600 dark:hover:bg-gray-500"
            >
              {loading ? 'Joining...' : 'Join Train'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  // Render create train view
  const renderCreateView = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex flex-col items-center justify-center p-4 dark:from-gray-800 dark:to-gray-900 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Create a Train</h2>
          <button
            onClick={toggleDarkMode}
            className="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            {darkMode ? " Light" : " Dark"}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder="John Doe"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Primary Platform (for Avatar) *
            </label>
            
            <div className="flex gap-3 mb-3">
              <select
                value={createFormData.primaryPlatform}
                onChange={(e) => setCreateFormData({...createFormData, primaryPlatform: e.target.value})}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              >
                <option value="">Select Platform</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="twitter">Twitter</option>
                <option value="youtube">YouTube</option>
                <option value="twitch">Twitch</option>
                <option value="linkedin">LinkedIn</option>
              </select>
              
              <input
                type="text"
                value={createFormData.primaryHandle}
                onChange={(e) => setCreateFormData({...createFormData, primaryHandle: e.target.value})}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="@username"
                required
              />
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              This will be used to generate your avatar
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-3">
              Optional Additional Links
            </label>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="instagram">
                  Instagram Username
                </label>
                <AutoCompleteInput
                  platform="instagram"
                  value={createFormData.instagram}
                  onChange={(e) => setCreateFormData({...createFormData, instagram: e.target.value})}
                  formDataUpdater={setCreateFormData}
                  fieldId="instagram"
                  placeholder="@username"
                  maxLength="30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">Letters, numbers, dots, underscores (max 30 chars)</p>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="tiktok">
                  TikTok Username
                </label>
                <AutoCompleteInput
                  platform="tiktok"
                  value={createFormData.tiktok}
                  onChange={(e) => setCreateFormData({...createFormData, tiktok: e.target.value})}
                  formDataUpdater={setCreateFormData}
                  fieldId="tiktok"
                  placeholder="@username"
                  maxLength="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">Letters, numbers, dots, underscores (max 50 chars)</p>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="twitter">
                  Twitter/X Username
                </label>
                <AutoCompleteInput
                  platform="twitter"
                  value={createFormData.twitter}
                  onChange={(e) => setCreateFormData({...createFormData, twitter: e.target.value})}
                  formDataUpdater={setCreateFormData}
                  fieldId="twitter"
                  placeholder="@username"
                  maxLength="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">Letters, numbers, underscores (max 50 chars)</p>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="linkedin">
                  LinkedIn Profile URL
                </label>
                <input
                  id="linkedin"
                  type="text"
                  value={createFormData.linkedin}
                  onChange={(e) => setCreateFormData({...createFormData, linkedin: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder="https://linkedin.com/in/your-profile"
                />
                <p className="text-xs text-gray-500 mt-1">Please paste your full profile link to ensure users find the correct page.</p>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
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
          
        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Created by{' '}
            <a 
              href="https://github.com/TheBooleanJulian" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline dark:text-purple-400"
            >
              TheBooleanJulian
            </a>
          </p>
        </div>
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
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors dark:bg-green-700 dark:hover:bg-green-600"
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
              {isAdmin && (
                <button
                  onClick={() => setShowAdminPanel(!showAdminPanel)}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Admin Panel
                </button>
              )}
              <button
                onClick={() => setShowExportPanel(!showExportPanel)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Copy size={16} />
                Export Options
              </button>
              
              {/* Export Panel */}
              {showExportPanel && (
                <div className="mt-4 p-4 bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Export Options</h3>
                    <button 
                      onClick={() => setShowExportPanel(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      ✕
                    </button>
                  </div>
                  
                  {/* Export Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    <button
                      onClick={copyAllHandles}
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors w-full"
                    >
                      <Copy size={16} />
                      Copy to Clipboard
                    </button>
                    <button
                      onClick={() => exportToFile('txt')}
                      className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors w-full"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download TXT File
                    </button>
                  </div>
                  
                  {/* Platform Selection with Checkboxes */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-700 dark:text-gray-300">Select Platforms to Export:</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleAllPlatforms(true)}
                          className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300"
                        >
                          Select All
                        </button>
                        <button
                          onClick={() => toggleAllPlatforms(false)}
                          className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(selectedPlatforms).map(([platform, isSelected]) => (
                        <label key={platform} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePlatformSelection(platform)}
                            className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                            {platform}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Participants Grid */}
        <div className="p-4 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="block"
              >
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full dark:bg-gray-700">
                  <div className="p-4">
                    <div className="flex items-center mb-3">
                      <img
                        src={participant.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.display_name)}&size=48&background=random`}
                        alt={participant.display_name}
                        className="w-12 h-12 rounded-full mr-3"
                        onError={(e) => {
                          // Fallback to a default avatar if the stored avatar fails
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.display_name)}&size=48&background=cccccc&color=ffffff`;
                        }}
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
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              const smartLink = createSmartLink('instagram', participant.instagram_username);
                              handleLinkClick(smartLink);
                            }}
                            className="text-purple-600 truncate hover:underline cursor-pointer bg-transparent border-none p-0 font-inherit text-left"
                          >
                            @{participant.instagram_username}
                          </button>
                        </div>
                      )}
                      {participant.tiktok_username && (
                        <div className="flex items-center text-sm dark:text-gray-300">
                          <span className="font-medium text-gray-700 w-20 dark:text-gray-400">TikTok:</span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              const smartLink = createSmartLink('tiktok', participant.tiktok_username);
                              handleLinkClick(smartLink);
                            }}
                            className="text-purple-600 truncate hover:underline cursor-pointer bg-transparent border-none p-0 font-inherit text-left dark:text-purple-400"
                          >
                            @{participant.tiktok_username}
                          </button>
                        </div>
                      )}
                      {participant.twitter_username && (
                        <div className="flex items-center text-sm dark:text-gray-300">
                          <span className="font-medium text-gray-700 w-20 dark:text-gray-400">Twitter:</span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              const smartLink = createSmartLink('twitter', participant.twitter_username);
                              handleLinkClick(smartLink);
                            }}
                            className="text-purple-600 truncate hover:underline cursor-pointer bg-transparent border-none p-0 font-inherit text-left dark:text-purple-400"
                          >
                            @{participant.twitter_username}
                          </button>
                        </div>
                      )}
                      {participant.linkedin_username && (
                        <div className="flex items-center text-sm dark:text-gray-300">
                          <span className="font-medium text-gray-700 w-20 dark:text-gray-400">LinkedIn:</span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              // For LinkedIn URLs, use the stored URL directly
                              handleLinkClick(participant.linkedin_username);
                            }}
                            className="text-purple-600 truncate hover:underline cursor-pointer bg-transparent border-none p-0 font-inherit text-left dark:text-purple-400"
                          >
                            {participant.linkedin_username.replace('https://', '').replace('www.', '').split('/')[2] || 'Profile'}
                          </button>
                        </div>
                      )}
                      {participant.youtube_username && (
                        <div className="flex items-center text-sm dark:text-gray-300">
                          <span className="font-medium text-gray-700 w-20 dark:text-gray-400">YouTube:</span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              const smartLink = createSmartLink('youtube', participant.youtube_username);
                              handleLinkClick(smartLink);
                            }}
                            className="text-purple-600 truncate hover:underline cursor-pointer bg-transparent border-none p-0 font-inherit text-left dark:text-purple-400"
                          >
                            @{participant.youtube_username}
                          </button>
                        </div>
                      )}
                      {participant.twitch_username && (
                        <div className="flex items-center text-sm dark:text-gray-300">
                          <span className="font-medium text-gray-700 w-20 dark:text-gray-400">Twitch:</span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              const smartLink = createSmartLink('twitch', participant.twitch_username);
                              handleLinkClick(smartLink);
                            }}
                            className="text-purple-600 truncate hover:underline cursor-pointer bg-transparent border-none p-0 font-inherit text-left dark:text-purple-400"
                          >
                            @{participant.twitch_username}
                          </button>
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
        
        {/* Admin Panel */}
        {isAdmin && showAdminPanel && (
          <div className="max-w-4xl mx-auto p-4 mt-4 bg-red-50 border border-red-200 rounded-xl dark:bg-red-900/20 dark:border-red-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-red-800 dark:text-red-200">Admin Panel</h3>
              <button 
                onClick={() => setShowAdminPanel(false)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
              >
                Close
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-700">
                <h4 className="font-medium text-gray-800 mb-2 dark:text-white">Train Controls</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={toggleTrainLock}
                    className={`px-4 py-2 rounded-lg font-medium ${trainLocked ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                  >
                    {trainLocked ? 'Unlock Train' : 'Lock Train'}
                  </button>
                  <button
                    onClick={clearTrain}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                  >
                    Clear Train
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2 dark:text-gray-300">
                  Status: {trainLocked ? '🔒 Locked (no new joins)' : '🔓 Unlocked (open for joins)'}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-700">
                <h4 className="font-medium text-gray-800 mb-2 dark:text-white">Participants ({participants.length})</h4>
                <div className="max-h-40 overflow-y-auto">
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                      <div>
                        <span className="font-medium">{participant.display_name}</span>
                        {participant.is_host && (
                          <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full dark:bg-purple-900 dark:text-purple-100">
                            Host
                          </span>
                        )}
                      </div>
                      {!participant.is_host && (
                        <button
                          onClick={() => kickUser(participant.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium dark:text-red-400 dark:hover:text-red-200"
                        >
                          Kick
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="max-w-4xl mx-auto p-4 mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Created by{' '}
            <a 
              href="https://github.com/TheBooleanJulian" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline dark:text-purple-400"
            >
              TheBooleanJulian
            </a>
          </p>
        </div>
      </div>
    );
  };

  // Render QR code modal
  const renderQRModal = () => {
    if (!showQRModal) return null;
    
    const shareLink = `${window.location.origin}/?train=${trainId}`;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full dark:bg-gray-800 dark:text-white max-h-[90vh] overflow-y-auto">
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full dark:bg-gray-800 dark:text-white max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center dark:text-white">Join Train</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900 dark:border-red-700 dark:text-red-200">
              {error}
            </div>
          )}
          
          <form onSubmit={handleJoinTrain}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="joinDisplayName">
                Display Name *
              </label>
              <input
                id="joinDisplayName"
                type="text"
                value={joinFormData.displayName}
                onChange={(e) => setJoinFormData({...joinFormData, displayName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="John Doe"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Primary Platform (for Avatar) *
              </label>
              
              <div className="flex gap-3 mb-3">
                <select
                  value={joinFormData.primaryPlatform}
                  onChange={(e) => setJoinFormData({...joinFormData, primaryPlatform: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  required
                >
                  <option value="">Select Platform</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="twitter">Twitter</option>
                  <option value="youtube">YouTube</option>
                  <option value="twitch">Twitch</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
                
                <input
                  type="text"
                  value={joinFormData.primaryHandle}
                  onChange={(e) => setJoinFormData({...joinFormData, primaryHandle: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder="@username"
                  required
                />
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                This will be used to generate your avatar
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-3">
                Optional Additional Links
              </label>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="joinInstagram">
                    Instagram Username
                  </label>
                  <AutoCompleteInput
                    platform="instagram"
                    value={joinFormData.instagram}
                    onChange={(e) => setJoinFormData({...joinFormData, instagram: e.target.value})}
                    formDataUpdater={setJoinFormData}
                    fieldId="joinInstagram"
                    placeholder="@username"
                    maxLength="30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="joinTiktok">
                    TikTok Username
                  </label>
                  <AutoCompleteInput
                    platform="tiktok"
                    value={joinFormData.tiktok}
                    onChange={(e) => setJoinFormData({...joinFormData, tiktok: e.target.value})}
                    formDataUpdater={setJoinFormData}
                    fieldId="joinTiktok"
                    placeholder="@username"
                    maxLength="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="joinTwitter">
                    Twitter/X Username
                  </label>
                  <AutoCompleteInput
                    platform="twitter"
                    value={joinFormData.twitter}
                    onChange={(e) => setJoinFormData({...joinFormData, twitter: e.target.value})}
                    formDataUpdater={setJoinFormData}
                    fieldId="joinTwitter"
                    placeholder="@username"
                    maxLength="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="joinLinkedin">
                    LinkedIn Profile URL
                  </label>
                  <input
                    id="joinLinkedin"
                    type="text"
                    value={joinFormData.linkedin}
                    onChange={(e) => setJoinFormData({...joinFormData, linkedin: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                  <p className="text-xs text-gray-500 mt-1">Please paste your full profile link to ensure users find the correct page.</p>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
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

  // Render debug view
  const renderDebugView = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex flex-col items-center justify-center p-4 dark:from-gray-800 dark:to-gray-900">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center relative dark:bg-gray-800 dark:text-white">
        <div className="flex justify-center mb-6 relative">
          <img src="/followtrain-icon.png" alt="FollowTrain Icon" className="h-24 w-24 object-contain" />
          <button
            onClick={toggleDarkMode}
            className="absolute top-0 right-0 bg-gray-200 text-gray-800 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            {darkMode ? " Light" : " Dark"}
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2 dark:text-white">Debug Page</h1>
        <p className="text-gray-600 mb-8 dark:text-gray-300">Developer testing tools</p>
        
        <div className="space-y-4">
          <button
            onClick={() => {
              console.log('TEST BUTTON CLICKED!');
              alert('Test button works! Time: ' + new Date().toISOString());
            }}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity w-full"
          >
            🔧 Test Button (Debug)
          </button>
          
          <button
            onClick={testDatabaseConnection}
            className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity w-full"
          >
            🧪 Test Database Connection
          </button>
          
          <button
            onClick={() => setRateLimitEnabled(!rateLimitEnabled)}
            className={`w-full px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity ${rateLimitEnabled ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
          >
            {rateLimitEnabled ? 'Disable' : 'Enable'} Rate Limiting
          </button>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Current status: {rateLimitEnabled ? 'ENABLED (2s cooldown)' : 'DISABLED'}
          </p>
          <button
            onClick={() => setCurrentView('home')}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors w-full dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="font-sans">
      {currentView === 'home' && renderHomeView()}
      {currentView === 'create' && renderCreateView()}
      {currentView === 'train' && renderTrainView()}
      {currentView === 'debug' && renderDebugView()}
      {renderJoinModal()}
      {renderQRModal()}
    </div>
  );
};

export default App;








