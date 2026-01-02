'use client';

import React, { useState, useEffect } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Load saved API key from localStorage
    const savedKey = localStorage.getItem('userGeminiApiKey');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    // Save to localStorage
    localStorage.setItem('userGeminiApiKey', apiKey.trim());
    setError('');
    onSubmit(apiKey.trim());
  };

  const handleClear = () => {
    localStorage.removeItem('userGeminiApiKey');
    setApiKey('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1a1a1b] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">API Key Required</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-4">
          The default API key quota has been exhausted. Please enter your own Google Gemini API key to continue.
        </p>

        <div className="bg-[#0f0f10] border border-white/5 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-500 mb-2">Get your API key from:</p>
          <a 
            href="https://aistudio.google.com/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#a855f7] hover:text-[#c084fc] text-sm underline"
          >
            Google AI Studio →
          </a>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="apiKey" className="block text-sm text-gray-300 mb-2">
              Gemini API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-[#0f0f10] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#a855f7] transition-colors"
            />
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 px-4 py-2.5 bg-[#0f0f10] border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 transition-colors"
            >
              Clear
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-[#a855f7] text-white rounded-lg hover:bg-[#9333ea] transition-colors shadow-lg shadow-[#a855f7]/20"
            >
              Save & Continue
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Your API key is stored locally and never sent to our servers.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyModal;
