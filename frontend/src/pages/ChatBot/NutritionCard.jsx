import React from 'react';

function NutritionCard({ data }) {
  return (
    <div className="bg-linear-to-r from-green-50 to-emerald-50 border-l-4 border-[#27AE60] p-4 rounded-r-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <h4 className="font-bold text-[#1A4A40] text-base mb-2 flex items-center">
        <span className="mr-2">🍽️</span>
        {data.foodName}
      </h4>
      <div className="flex flex-wrap gap-3 text-sm text-gray-700">
        <div className="flex items-center">
          <span className="font-semibold text-[#27AE60] mr-1">Calories:</span>
          <span className="font-bold">{data.nutrients.calories}</span>
          <span className="ml-1 text-xs text-gray-600">kcal</span>
        </div>
        <div className="flex items-center">
          <span className="font-semibold text-[#27AE60] mr-1">Protein:</span>
          <span className="font-bold">{data.nutrients.protein}</span>
          <span className="ml-1 text-xs text-gray-600">g</span>
        </div>
        <div className="flex items-center">
          <span className="font-semibold text-[#27AE60] mr-1">Carbs:</span>
          <span className="font-bold">{data.nutrients.carbs}</span>
          <span className="ml-1 text-xs text-gray-600">g</span>
        </div>
      </div>
    </div>
  );
}

export default NutritionCard;