import React from 'react';

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">FollowTrain Test</h1>
        <p className="text-gray-600 mb-6">If you can see this, the app is working!</p>
        <button 
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          onClick={() => alert('Button clicked!')}
        >
          Test Button
        </button>
      </div>
    </div>
  );
};

export default App;