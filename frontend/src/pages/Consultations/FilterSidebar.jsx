import React from "react";

const FilterSidebar = ({
  specializations,
  onFilterChange,
  onClearFilters,
  filters,
  showModeFilter = true,
}) => {
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <span className="flex items-center gap-0.5">
        {'★'.repeat(fullStars)}
        {hasHalfStar && '☆'}
        {'☆'.repeat(emptyStars)}
      </span>
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-emerald-600/20 sticky top-32">
      {/* Enhanced Header */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-emerald-600/30 bg-emerald-50/50 rounded-xl px-4 py-3">
        <h2
          className="text-lg font-bold text-emerald-700 flex items-center gap-2"
          style={{
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            letterSpacing: "-0.5px",
          }}
        >
          <i className="fas fa-search text-emerald-600"></i> Filters
        </h2>
        <button
          onClick={onClearFilters}
          className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-all"
          style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
        >
          Clear All
        </button>
      </div>

      {/* Mode Filter */}
      {showModeFilter && (
        <div className="mb-8">
          <label
            className="flex items-center gap-2 text-sm font-semibold text-emerald-700 mb-4 uppercase tracking-wide"
            style={{
              fontFamily: "'Inter', 'Segoe UI', sans-serif",
              letterSpacing: "0.5px",
            }}
          >
            <i className="fas fa-video text-emerald-600"></i> Consultation Mode
          </label>
          <div className="space-y-3">
            {["online", "offline"].map((mode) => (
              <label
                key={mode}
                className="flex items-center gap-3 cursor-pointer hover:bg-emerald-50 p-3 rounded-xl transition-all border border-transparent hover:border-emerald-200"
              >
                <input
                  type="checkbox"
                  checked={filters.mode.includes(mode)}
                  onChange={() => onFilterChange("mode", mode)}
                  className="w-4 h-4 text-emerald-600 rounded accent-emerald-600 cursor-pointer"
                />
                <span
                  className="text-sm text-gray-700"
                  style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
                >
                  {mode === "online" ? "Online" : "In-person"}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Specialization Filter */}
      {specializations && specializations.length > 0 && (
        <div className="mb-8">
          <label
            className="flex items-center gap-2 text-sm font-semibold text-emerald-700 mb-4 uppercase tracking-wide"
            style={{
              fontFamily: "'Inter', 'Segoe UI', sans-serif",
              letterSpacing: "0.5px",
            }}
          >
            <i className="fas fa-bullseye text-emerald-600"></i> Specializations
          </label>
          <div className="space-y-3">
            {specializations.map((spec) => (
              <label
                key={spec.value}
                className="flex items-center gap-3 cursor-pointer hover:bg-emerald-50 p-3 rounded-xl transition-all border border-transparent hover:border-emerald-200"
              >
                <input
                  type="checkbox"
                  checked={filters.specialization.includes(spec.value)}
                  onChange={() => onFilterChange("specialization", spec.value)}
                  className="w-4 h-4 text-emerald-600 rounded accent-emerald-600 cursor-pointer"
                />
                <span
                  className="text-sm text-gray-700"
                  style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
                >
                  {spec.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}      {/* Experience Filter */}
      <div className="mb-8">
        <label
          className="flex items-center gap-2 text-sm font-semibold text-emerald-700 mb-4 uppercase tracking-wide"
          style={{
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            letterSpacing: "0.5px",
          }}
        >
          <i className="fas fa-trophy text-emerald-600"></i> Experience Level
        </label>
        <div className="space-y-3">
          {[3, 5, 10].map((exp) => (
            <label
              key={exp}
              className="flex items-center gap-3 cursor-pointer hover:bg-emerald-50 p-3 rounded-xl transition-all border border-transparent hover:border-emerald-200"
            >
              <input
                type="radio"
                name="experience"
                value={exp}
                checked={filters.experience.includes(exp)}
                onChange={() => onFilterChange("experience", exp)}
                className="w-4 h-4 text-emerald-600 cursor-pointer accent-emerald-600"
              />
              <span
                className="text-sm text-gray-700"
                style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
              >
                {exp}+ years
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Fees Filter */}
      <div className="mb-8">
        <label
          className="flex items-center gap-2 text-sm font-semibold text-emerald-700 mb-4 uppercase tracking-wide"
          style={{
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            letterSpacing: "0.5px",
          }}
        >
          <i className="fas fa-money-bill-wave text-emerald-600"></i> Budget Range
        </label>
        <div className="space-y-3">
          {[500, 1000, 1500, 2000].map((fee) => (
            <label
              key={fee}
              className="flex items-center gap-3 cursor-pointer hover:bg-emerald-50 p-3 rounded-xl transition-all border border-transparent hover:border-emerald-200"
            >
              <input
                type="radio"
                name="fees"
                value={fee}
                checked={filters.fees.includes(fee)}
                onChange={() => onFilterChange("fees", fee)}
                className="w-4 h-4 text-emerald-600 cursor-pointer accent-emerald-600"
              />
              <span
                className="text-sm text-gray-700"
                style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
              >
                ₹{fee}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Language Filter */}
      <div className="mb-8">
        <label
          className="flex items-center gap-2 text-sm font-semibold text-emerald-700 mb-4 uppercase tracking-wide"
          style={{
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            letterSpacing: "0.5px",
          }}
        >
          <i className="fas fa-language text-emerald-600"></i> Languages
        </label>
        <div className="space-y-3">
          {["English", "Hindi", "Telugu", "Tamil"].map((lang) => (
            <label
              key={lang}
              className="flex items-center gap-3 cursor-pointer hover:bg-emerald-50 p-3 rounded-xl transition-all border border-transparent hover:border-emerald-200"
            >
              <input
                type="checkbox"
                checked={filters.language.includes(lang)}
                onChange={() => onFilterChange("language", lang)}
                className="w-4 h-4 text-emerald-600 rounded accent-emerald-600 cursor-pointer"
              />
              <span
                className="text-sm text-gray-700"
                style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
              >
                {lang}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating Filter - WITH STARS - NEW RATINGS */}
      <div>
        <label
          className="flex items-center gap-2 text-sm font-semibold text-emerald-700 mb-4 uppercase tracking-wide"
          style={{
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            letterSpacing: "0.5px",
          }}
        >
          <i className="fas fa-star text-emerald-600"></i> Minimum Rating
        </label>
        <div className="space-y-3">
          {[3, 3.5, 4, 4.5].map((rating) => (
            <label
              key={rating}
              className="flex items-center gap-3 cursor-pointer hover:bg-emerald-50 p-3 rounded-xl transition-all border border-transparent hover:border-emerald-200"
            >
              <input
                type="radio"
                name="rating"
                value={rating}
                checked={filters.rating.includes(rating)}
                onChange={() => onFilterChange("rating", rating)}
                className="w-4 h-4 text-emerald-600 cursor-pointer accent-emerald-600"
              />
              <span
                className="text-sm text-gray-700 flex items-center gap-1"
                style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
              >
                <span className="text-emerald-600 font-bold text-lg">
                  {renderStars(rating)}
                </span>
                <span className="text-gray-500">{rating}</span>
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
