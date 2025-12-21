import React from "react";
import { FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function ChatBotHeader() {
  const navigate = useNavigate();
  
  return (
    <div className="w-full flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-linear-to-br from-[#27AE60] to-[#1E8449] rounded-full flex items-center justify-center shadow-md">
          <span className="text-white text-xl font-bold">🤖</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1A4A40]">NutriConnect AI</h1>
          <p className="text-xs text-gray-600">Your Nutrition Assistant</p>
        </div>
      </div>
      <button
        onClick={() => navigate(-1)}
        className="text-gray-600 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-all duration-300 transform hover:scale-110"
        aria-label="Close chatbot"
      >
        <FiX className="text-3xl" />
      </button>
    </div>
  );
}

export default ChatBotHeader;