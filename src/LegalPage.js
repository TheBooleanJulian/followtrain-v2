import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const LegalPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const fileName = type === 'terms' ? 'TERMS.txt' : 'PRIVACY.txt';
        const response = await fetch(`/${fileName}`);
        const text = await response.text();
        setContent(text);
      } catch (error) {
        console.error('Error loading legal content:', error);
        setContent('Content not available.');
      } finally {
        setLoading(false);
      }
    };

    if (type === 'terms' || type === 'privacy') {
      loadContent();
    } else {
      navigate('/'); // Redirect to home if invalid type
    }
  }, [type, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4 dark:from-gray-800 dark:to-gray-900">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const title = type === 'terms' ? 'Terms of Service' : 'Privacy Policy';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex flex-col items-center p-4 dark:from-gray-800 dark:to-gray-900">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl w-full mt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          <button
            onClick={() => navigate('/')}
            className="text-purple-600 hover:text-purple-800 font-medium"
          >
            ← Back to Home
          </button>
        </div>
        
        <div className="prose max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
            {content}
          </pre>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>
            © 2026 TheBooleanJulian. All rights reserved.
            <br />
            Not affiliated with Meta, LinkedIn, X, or any listed platforms. |{' '}
            <a href="/terms" className="text-purple-600 hover:underline">Terms</a> |{' '}
            <a href="/privacy" className="text-purple-600 hover:underline">Privacy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;