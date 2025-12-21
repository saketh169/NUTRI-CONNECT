import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TermsOfUse = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleClose = () => {
    navigate('/');
  };

  useEffect(() => {
    const fetchTermsOfUse = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/settings');
        setContent(response.data.termsOfService || 'Terms of service content not available.');
      } catch (err) {
        console.error('Error fetching terms of use:', err);
        setError('Failed to load terms of use. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTermsOfUse();
  }, []);

  // Ensure the page is at the top when this component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  // Simple markdown renderer for basic formatting
  const renderMarkdown = (text) => {
    if (!text) return '<p class="text-gray-500 italic">Content not available.</p>';

    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2 text-[#28B463]">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3 text-[#28B463] border-b-2 border-[#E8F5E9] pb-1">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 text-[#1E6F5C]">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/- (.*$)/gim, '<li class="flex items-start"><span class="text-[#28B463] mr-2">•</span>$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br/>');
  };

  if (loading) {
    return (
      <main className="flex-1 w- mx-auto p-8 bg-cover bg-center min-h-screen bg-green-50">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-7xl mx-auto border-2 border-[#E8F5E9]">
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-4xl text-[#28B463] mb-4"></i>
              <p className="text-gray-600">Loading Terms of Use...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 w- mx-auto p-8 bg-cover bg-center min-h-screen bg-green-50">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-7xl mx-auto border-2 border-[#E8F5E9]">
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-[#28B463] text-white px-6 py-2 rounded-lg hover:bg-[#1E6F5C] transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 w- mx-auto p-8 bg-cover bg-center min-h-screen bg-green-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-7xl mx-auto border-2 border-[#E8F5E9]">
        {/* Close Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1E6F5C]">Terms and Conditions</h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Welcome to Nutri-Connect! By accessing this website, we assume you accept these terms and conditions. Do not continue to use Nutri-Connect if you do not agree to all the terms and conditions stated on this page.
          </p>
          <p className="text-sm text-gray-500 mt-2">Last Updated: November 26, 2025</p>
        </div>

        {/* Dynamic Content */}
        <div className="prose prose-lg max-w-none text-gray-700">
          <div
            dangerouslySetInnerHTML={{ __html: `<p class="mb-4">${renderMarkdown(content)}</p>` }}
          />
        </div>

        {/* Floating Scroll-to-top button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          className="fixed right-6 bottom-6 bg-emerald-600 text-white w-11 h-11 rounded-full shadow-lg flex items-center justify-center hover:bg-emerald-700 transition-colors"
        >
          <i className="fas fa-chevron-up"></i>
        </button>
      </div>
    </main>
  );
};

export default TermsOfUse;