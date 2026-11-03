import type { FC } from 'react'
import type { TabType } from '../types/student'
import { BarChartIcon, TrashIcon, UsersIcon } from './Icons'

interface TabNavigationProps {
  currentTab: TabType
  onTabChange: (tab: TabType) => void
  activeCount: number
  deletedCount: number
}

export const TabNavigation: FC<TabNavigationProps> = ({
  currentTab,
  onTabChange,
  activeCount,
  deletedCount,
}) => {
  return (
    <div className="tab-navigation-bar">
      <div className="tabs-container" role="tablist">
        <button
          role="tab"
          aria-selected={currentTab === 'active'}
          className={`tab-btn ${currentTab === 'active' ? 'tab-btn-active' : ''}`}
          onClick={() => onTabChange('active')}
        >
          <UsersIcon size={16} />
          <span>Active Students</span>
          <span className="tab-counter">{activeCount}</span>
        </button>

        <button
          role="tab"
          aria-selected={currentTab === 'deleted'}
          className={`tab-btn ${currentTab === 'deleted' ? 'tab-btn-active' : ''}`}
          onClick={() => onTabChange('deleted')}
        >
          <TrashIcon size={16} />
          <span>Recycle Bin</span>
          {deletedCount > 0 && <span className="tab-counter tab-counter-danger">{deletedCount}</span>}
        </button>

        <button
          role="tab"
          aria-selected={currentTab === 'analytics'}
          className={`tab-btn ${currentTab === 'analytics' ? 'tab-btn-active' : ''}`}
          onClick={() => onTabChange('analytics')}
        >
          <BarChartIcon size={16} />
          <span>Course Breakdown</span>
        </button>
      </div>
    </div>
  )
}
