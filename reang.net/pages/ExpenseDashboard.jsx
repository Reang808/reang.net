import { useState, useEffect } from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import { getExpenseSummary, getExpenseYearlySummary, generateRecurringExpenses } from '../src/api/expenses'

const ExpenseDashboard = () => {
  const today = new Date()
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1)
  const [monthlySummary, setMonthlySummary] = useState(null)
  const [yearlySummary, setYearlySummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMonthlySummary()
  }, [selectedYear, selectedMonth])

  useEffect(() => {
    fetchYearlySummary()
  }, [selectedYear])

  const fetchMonthlySummary = async () => {
    try {
      const data = await getExpenseSummary(selectedYear, selectedMonth)
      setMonthlySummary(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchYearlySummary = async () => {
    try {
      const data = await getExpenseYearlySummary(selectedYear)
      setYearlySummary(data)
    } catch (err) {
      console.error(err)
    }
  }

  // 固定費から支出を生成
  const handleGenerateRecurring = async () => {
    if (!window.confirm(`${selectedYear}年${selectedMonth}月の固定費を生成しますか？`)) return
    try {
      const result = await generateRecurringExpenses(selectedYear, selectedMonth)
      alert(result.message)
      fetchMonthlySummary()
      fetchYearlySummary()
    } catch (err) {
      alert(err.message)
    }
  }

  // 月変更
  const changeMonth = (direction) => {
    let newMonth = selectedMonth + direction
    let newYear = selectedYear
    
    if (newMonth > 12) {
      newMonth = 1
      newYear++
    } else if (newMonth < 1) {
      newMonth = 12
      newYear--
    }
    
    setSelectedYear(newYear)
    setSelectedMonth(newMonth)
  }

  // 金額フォーマット
  const formatAmount = (amount) => {
    return amount.toLocaleString()
  }

  // カテゴリ別円グラフデータ
  const categoryPieData = monthlySummary?.by_category?.map(cat => ({
    name: cat.name,
    value: cat.total,
    color: getColorClass(cat.color),
  })) || []

  // 区分別円グラフデータ
  const typePieData = monthlySummary ? [
    { name: '個人', value: monthlySummary.personal_total, color: '#3B82F6' },
    { name: '会社', value: monthlySummary.business_total, color: '#10B981' },
  ].filter(item => item.value > 0) : []

  // 月別棒グラフデータ
  const monthlyBarData = yearlySummary?.monthly_data?.map(item => ({
    name: item.month_label,
    個人: item.personal_total,
    会社: item.business_total,
  })) || []

  // 色変換
  function getColorClass(color) {
    const colors = {
      red: '#EF4444',
      blue: '#3B82F6',
      green: '#10B981',
      yellow: '#F59E0B',
      purple: '#8B5CF6',
      pink: '#EC4899',
      gray: '#6B7280',
      orange: '#F97316',
      teal: '#14B8A6',
      indigo: '#6366F1',
    }
    return colors[color] || '#6B7280'
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-[200px]">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl font-semibold">📊 支出ダッシュボード</h2>
        <button
          onClick={handleGenerateRecurring}
          className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2.5 sm:py-2 rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-colors text-center text-sm"
        >
          🔄 固定費を生成
        </button>
      </div>

      {/* 月選択 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ←
          </button>
          <span className="text-lg font-medium min-w-[120px] text-center">
            {selectedYear}年{selectedMonth}月
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {/* 月間サマリー */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 text-center">
          <div className="text-sm text-gray-500 mb-1">今月の合計</div>
          <div className="text-2xl sm:text-3xl font-bold">
            {formatAmount(monthlySummary?.total || 0)}円
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4 sm:p-6 text-center">
          <div className="text-sm text-blue-600 mb-1">👤 個人</div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-700">
            {formatAmount(monthlySummary?.personal_total || 0)}円
          </div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 sm:p-6 text-center">
          <div className="text-sm text-green-600 mb-1">🏢 会社</div>
          <div className="text-2xl sm:text-3xl font-bold text-green-700">
            {formatAmount(monthlySummary?.business_total || 0)}円
          </div>
        </div>
      </div>

      {/* グラフエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* カテゴリ別円グラフ */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="font-semibold text-sm sm:text-base mb-4">カテゴリ別支出</h3>
          {categoryPieData.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center">
              <div className="w-full sm:w-1/2">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${formatAmount(value)}円`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full sm:w-1/2 sm:pl-4 mt-4 sm:mt-0">
                <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
                  {monthlySummary?.by_category?.map((cat, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getColorClass(cat.color) }}
                        ></span>
                        {cat.icon} {cat.name}
                      </span>
                      <span className="font-medium">{formatAmount(cat.total)}円</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
              データがありません
            </div>
          )}
        </div>

        {/* 区分別円グラフ */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="font-semibold text-sm sm:text-base mb-4">個人 / 会社 比率</h3>
          {typePieData.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center">
              <div className="w-full sm:w-1/2">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={typePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {typePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${formatAmount(value)}円`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full sm:w-1/2 sm:pl-4 mt-4 sm:mt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                      👤 個人
                    </span>
                    <span className="font-bold text-blue-700">
                      {formatAmount(monthlySummary?.personal_total || 0)}円
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      🏢 会社
                    </span>
                    <span className="font-bold text-green-700">
                      {formatAmount(monthlySummary?.business_total || 0)}円
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
              データがありません
            </div>
          )}
        </div>
      </div>

      {/* 年間推移グラフ */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <h3 className="font-semibold text-sm sm:text-base">年間推移</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedYear(prev => prev - 1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </button>
            <span className="text-sm min-w-[60px] text-center">{selectedYear}年</span>
            <button
              onClick={() => setSelectedYear(prev => prev + 1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              →
            </button>
          </div>
        </div>

        {/* 年間合計 */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center">
            <div className="text-xs text-gray-500">年間合計</div>
            <div className="text-sm sm:text-lg font-bold">
              {formatAmount(yearlySummary?.year_total || 0)}円
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-2 sm:p-3 text-center">
            <div className="text-xs text-blue-600">👤 個人</div>
            <div className="text-sm sm:text-lg font-bold text-blue-700">
              {formatAmount(yearlySummary?.year_personal_total || 0)}円
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-2 sm:p-3 text-center">
            <div className="text-xs text-green-600">🏢 会社</div>
            <div className="text-sm sm:text-lg font-bold text-green-700">
              {formatAmount(yearlySummary?.year_business_total || 0)}円
            </div>
          </div>
        </div>

        {monthlyBarData.some(d => d.個人 > 0 || d.会社 > 0) ? (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-[500px] sm:min-w-0 px-4 sm:px-0">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis tick={{ fontSize: 10 }} width={50} tickFormatter={(value) => `${(value / 10000).toFixed(0)}万`} />
                  <Tooltip formatter={(value) => `${formatAmount(value)}円`} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="個人" stackId="a" fill="#3B82F6" />
                  <Bar dataKey="会社" stackId="a" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
            データがありません
          </div>
        )}
      </div>

      {/* 支払方法別 */}
      {monthlySummary?.by_payment_method?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="font-semibold text-sm sm:text-base mb-4">支払方法別</h3>
          <div className="space-y-2">
            {monthlySummary.by_payment_method.map((method, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="flex items-center gap-2">
                  {method.icon} {method.name}
                </span>
                <span className="font-bold">{formatAmount(method.total)}円</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ExpenseDashboard