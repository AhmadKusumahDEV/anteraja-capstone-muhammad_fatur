import React from 'react';

export function FilterBar({
  searchQuery,
  onSearchChange,
  priorityOnly,
  onPriorityToggle,
  totalCount,
  priorityCount
}) {
  return (
    <div className="filter-bar">
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search hub by name or ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#9CA3AF',
              padding: '0 4px',
              fontSize: '14px'
            }}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <div className="segmented-control">
        <button
          type="button"
          className={`segment-btn ${!priorityOnly ? 'active' : ''}`}
          onClick={() => onPriorityToggle(false)}
        >
          All Hubs ({totalCount})
        </button>
        <button
          type="button"
          className={`segment-btn ${priorityOnly ? 'active' : ''}`}
          onClick={() => onPriorityToggle(true)}
        >
          Priority Only ({priorityCount})
        </button>
      </div>
    </div>
  );
}
