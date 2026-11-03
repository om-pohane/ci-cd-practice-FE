import type { FC } from 'react'
import type { FilterState, SortField, ViewMode } from '../types/student'
import { CloseIcon, GridIcon, RefreshIcon, SearchIcon, TableIcon } from './Icons'

interface FilterBarProps {
  filter: FilterState
  availableCourses: string[]
  onFilterChange: (updated: Partial<FilterState>) => void
  onCourseSearchSubmit: (course: string) => void
  onResetFilters: () => void
  isSearchingBackendCourse: boolean
}

export const FilterBar: FC<FilterBarProps> = ({
  filter,
  availableCourses,
  onFilterChange,
  onCourseSearchSubmit,
  onResetFilters,
  isSearchingBackendCourse,
}) => {
  const hasActiveFilters =
    filter.searchQuery.trim() !== '' || filter.selectedCourse !== '' || isSearchingBackendCourse

  const handleCourseSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    onFilterChange({ selectedCourse: val })
    if (val) {
      onCourseSearchSubmit(val)
    } else {
      onResetFilters()
    }
  }

  return (
    <div className="filter-bar">
      <div className="filter-row">
        {/* Search input */}
        <div className="search-input-wrap">
          <SearchIcon size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, email, or ID..."
            value={filter.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
          />
          {filter.searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => onFilterChange({ searchQuery: '' })}
              aria-label="Clear search"
            >
              <CloseIcon size={14} />
            </button>
          )}
        </div>

        {/* Course Filter Dropdown (triggers backend search endpoint /api/student/search?course=...) */}
        <div className="filter-select-wrap">
          <select
            className="filter-select"
            value={filter.selectedCourse}
            onChange={handleCourseSelect}
            aria-label="Filter by course"
          >
            <option value="">All Courses</option>
            {availableCourses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Field */}
        <div className="filter-select-wrap">
          <select
            className="filter-select"
            value={filter.sortField}
            onChange={(e) => onFilterChange({ sortField: e.target.value as SortField })}
            aria-label="Sort by"
          >
            <option value="id">Sort by ID</option>
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="age">Sort by Age</option>
            <option value="course">Sort by Course</option>
          </select>
        </div>

        {/* Sort Order Toggle */}
        <button
          className="btn btn-secondary sort-dir-btn"
          onClick={() =>
            onFilterChange({
              sortDirection: filter.sortDirection === 'asc' ? 'desc' : 'asc',
            })
          }
          title={`Currently ${filter.sortDirection.toUpperCase()}`}
        >
          <span>{filter.sortDirection === 'asc' ? '↑ ASC' : '↓ DESC'}</span>
        </button>

        {/* Reset button if filtered */}
        {hasActiveFilters && (
          <button
            className="btn btn-ghost filter-reset-btn"
            onClick={onResetFilters}
            title="Clear all filters"
          >
            <RefreshIcon size={14} />
            <span>Clear Filters</span>
          </button>
        )}

        {/* View mode toggle (Table vs Cards) */}
        <div className="view-mode-group">
          <button
            className={`view-mode-btn ${filter.viewMode === 'table' ? 'active' : ''}`}
            onClick={() => onFilterChange({ viewMode: 'table' as ViewMode })}
            title="Table View"
            aria-label="Table View"
          >
            <TableIcon size={16} />
          </button>
          <button
            className={`view-mode-btn ${filter.viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => onFilterChange({ viewMode: 'cards' as ViewMode })}
            title="Cards View"
            aria-label="Cards View"
          >
            <GridIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
