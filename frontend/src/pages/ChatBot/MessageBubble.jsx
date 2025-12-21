import React, { useState } from 'react';
import NutritionCard from './NutritionCard';

function MessageBubble({ message }) {
  const isUser = message.type === "user";
  const [copied, setCopied] = useState(false);

  // Feature 2: Copy message to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format bot message with proper styling for Gemini AI responses
  const formatBotMessage = (text) => {
    if (!text) return null;

    // Split by paragraphs
    const paragraphs = text.split('\n\n');

    return paragraphs.map((para, idx) => {
      const trimmedPara = para.trim();

      // Handle headings (## Heading)
      if (trimmedPara.startsWith('#')) {
        const level = trimmedPara.match(/^#+/)[0].length;
        const headingText = trimmedPara.replace(/^#+\s*/, '');
        
        if (level === 1) {
          return <h1 key={idx} className="text-xl font-bold text-gray-900 mb-2 mt-4 first:mt-0">{headingText}</h1>;
        } else if (level === 2) {
          return <h2 key={idx} className="text-lg font-bold text-gray-800 mb-2 mt-3 first:mt-0">{headingText}</h2>;
        } else {
          return <h3 key={idx} className="text-base font-semibold text-gray-700 mb-2 mt-2 first:mt-0">{headingText}</h3>;
        }
      }

      // Handle numbered lists (1. 2. 3.)
      if (/^\d+\./.test(trimmedPara)) {
        const items = para.split('\n').filter(line => line.trim());
        return (
          <ol key={idx} className="list-decimal list-inside space-y-2 my-3 pl-2">
            {items.map((item, i) => {
              const cleanItem = item.replace(/^\d+\.\s*/, '');
              const boldItem = cleanItem.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
              return (
                <li key={i} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: boldItem }} />
              );
            })}
          </ol>
        );
      }

      // Handle bullet points (• - * ✓)
      if (/^[•\-*✓]/.test(trimmedPara)) {
        const items = para.split('\n').filter(line => line.trim());
        return (
          <ul key={idx} className="space-y-2 my-3">
            {items.map((item, i) => {
              const cleanItem = item.replace(/^[•\-*✓]\s*/, '');
              const boldItem = cleanItem.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
              return (
                <li key={i} className="text-sm leading-relaxed flex items-start">
                  <span className="text-[#27AE60] mr-2 font-bold shrink-0">✓</span>
                  <span dangerouslySetInnerHTML={{ __html: boldItem }} />
                </li>
              );
            })}
          </ul>
        );
      }

      // Handle code blocks (```code```)
      if (trimmedPara.startsWith('```')) {
        const code = trimmedPara.replace(/```[\w]*\n?/g, '').replace(/```$/, '');
        return (
          <pre key={idx} className="bg-gray-100 rounded-lg p-3 my-3 overflow-x-auto">
            <code className="text-xs text-gray-800 font-mono">{code}</code>
          </pre>
        );
      }

      // Handle inline code (`code`)
      let processedText = trimmedPara.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-800">$1</code>');
      
      // Handle bold text (**text**)
      processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
      
      // Handle italic text (*text*)
      processedText = processedText.replace(/\*([^*]+)\*/g, '<em class="italic text-gray-700">$1</em>');

      // Handle links [text](url) - though Gemini rarely returns these
      processedText = processedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#27AE60] underline hover:text-[#1E8449]" target="_blank" rel="noopener noreferrer">$1</a>');
      
      // Regular paragraph
      return (
        <p 
          key={idx} 
          className="text-sm md:text-base leading-relaxed mb-3 last:mb-0"
          dangerouslySetInnerHTML={{ __html: processedText }}
        />
      );
    });
  };
  
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-xs md:max-w-md lg:max-w-lg`}>
        <div
          className={`px-4 py-3 rounded-lg shadow-md relative group ${
            isUser
              ? "bg-[#27AE60] text-white rounded-br-none"
              : "bg-white text-gray-800 border-2 border-gray-100 rounded-bl-none"
          }`}
        >
          {/* Render formatted message for bot, simple text for user */}
          {isUser ? (
            <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            <div className="prose prose-sm max-w-none">
              {formatBotMessage(message.content)}
            </div>
          )}
          
          {message.timestamp && (
            <p
              className={`text-xs mt-1 ${
                isUser ? "text-green-100" : "text-gray-500"
              }`}
            >
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
          
          {/* Feature 2: Copy button - only for bot messages */}
          {!isUser && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium shadow-sm"
              title="Copy message"
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          )}
        </div>
        
        {/* Render nutrition cards if available */}
        {!isUser && message.nutritionData && (
          <div className="mt-2 space-y-2">
            {message.nutritionData.map((item, index) => (
              <NutritionCard key={index} data={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;