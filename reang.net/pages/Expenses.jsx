import { useLocation, useNavigate } from 'react-router-dom'
import ExpenseDashboard from './ExpenseDashboard'
import ExpenseList from './ExpenseList'
import RecurringExpenses from './RecurringExpenses'
import ExpenseSettings from './ExpenseSettings'

const expenseTabs = [
  { key: 'dashboard', path: '/expenses/dashboard', label: 'ダッシュボード', icon: '📊' },
  { key: 'list', path: '/expenses', label: '支出一覧', icon: '💰' },
  { key: 'recurring', path: '/expenses/recurring', label: '固定費', icon: '🔄' },
  { key: 'settings', path: '/expenses/settings', label: '設定', icon: '⚙️' },
]

const Expenses = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // より長いパスを優先してマッチさせる
  const activeTab = (() => {
    const path = location.pathname
    if (path.startsWith('/expenses/settings')) return 'settings'
    if (path.startsWith('/expenses/recurring')) return 'recurring'
    if (path.startsWith('/expenses/dashboard')) return 'dashboard'
    return 'list'
  })()

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ExpenseDashboard />
      case 'recurring':
        return <RecurringExpenses />
      case 'settings':
        return <ExpenseSettings />
      case 'list':
      default:
        return <ExpenseList />
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">💸 支出管理</h1>
          <p className="text-sm text-gray-500 mt-1">ダッシュボード・支出一覧・固定費・設定をタブで切り替え</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow px-3 sm:px-4">
        <div className="flex flex-wrap gap-2 border-b">
          {expenseTabs.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => navigate(tab.path)}
                className={`relative pb-2 pt-3 px-2 sm:px-3 text-sm sm:text-base transition-colors ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="mr-1">{tab.icon}</span>
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-blue-600" aria-hidden="true" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {renderContent()}
    </div>
  )
}

export default Expenses