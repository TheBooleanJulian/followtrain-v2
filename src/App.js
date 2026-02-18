import React from 'react';

const App = () => {
  // Log to console to help with debugging
  console.log('App component is rendering');
  console.log('Window object available:', typeof window !== 'undefined');
  console.log('Document object available:', typeof document !== 'undefined');
  
  if (typeof window !== 'undefined') {
    console.log('Browser environment detected');
    console.log('Location:', window.location);
    console.log('Navigator:', window.navigator.userAgent);
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">FollowTrain Debug</h1>
        <p className="text-gray-600 mb-2">Status: Component Loaded</p>
        <p className="text-gray-600 mb-4">Check browser console for logs</p>
        <div className="text-left text-xs bg-gray-100 p-2 rounded mb-4">
          <div>Window available: {typeof window !== 'undefined' ? 'Yes' : 'No'}</div>
          <div>Document available: {typeof document !== 'undefined' ? 'Yes' : 'No'}</div>
          <div>Location: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
        </div>
        <button 
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          onClick={() => console.log('Button clicked!', new Date().toISOString())}
        >
          Debug Button
        </button>
      </div>
    </div>
  );
};

export default App;