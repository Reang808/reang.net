import { useState, useEffect } from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import { getMonthlyStats, getYearlyStats, getOverdueTasks, getDailyData } from '../src/api/dashboard'
import { updateTask } from '../src/api/tasks'

const Dashboard = () => {
  const today = new Date()
  
  // 月別統計
  const [monthlyStats, setMonthlyStats] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1
  })
  
  // 年別統計
  const [yearlyStats, setYearlyStats] = useState(null)
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())
  
  // 日別予定
  const [selectedDate, setSelectedDate] = useState(today)
  const [dailyData, setDailyData] = useState({ schedules: [], tasks: [] })
  
  // 期限切れタスク
  const [overdueTasks, setOverdueTasks] = useState([])
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllData()
  }, [])

  useEffect(() => {
    fetchMonthlyStats()
  }, [selectedMonth])

  useEffect(() => {
    fetchYearlyStats()
  }, [selectedYear])

  useEffect(() => {
    fetchDailyData()
  }, [selectedDate])

  const fetchAllData = async () => {
    setLoading(true)
    await Promise.all([
      fetchMonthlyStats(),
      fetchYearlyStats(),
      fetchDailyData(),
      fetchOverdueTasks()
    ])
    setLoading(false)
  }

  const fetchMonthlyStats = async () => {
    try {
      const data = await getMonthlyStats(selectedMonth.year, selectedMonth.month)
      setMonthlyStats(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchYearlyStats = async () => {
    try {
      const data = await getYearlyStats(selectedYear)
      setYearlyStats(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchDailyData = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const data = await getDailyData(dateStr)
      setDailyData(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchOverdueTasks = async () => {
    try {
      const data = await getOverdueTasks()
      setOverdueTasks(data)
    } catch (err) {
      console.error(err)
    }
  }

  // タスク完了処理
  const handleTaskComplete = async (task) => {
    try {
      const newStatus = task.status === 'done' ? 'todo' : 'done'
      await updateTask(task.id, { ...task, status: newStatus })
      fetchDailyData()
      fetchOverdueTasks()
      fetchMonthlyStats()
      fetchYearlyStats()
    } catch (err) {
      alert(err.message)
    }
  }

  // 日付変更
  const changeDate = (days) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    setSelectedDate(newDate)
  }

  // 月変更
  const changeMonth = (direction) => {
    setSelectedMonth(prev => {
      let newMonth = prev.month + direction
      let newYear = prev.year
      
      if (newMonth > 12) {
        newMonth = 1
        newYear++
      } else if (newMonth < 1) {
        newMonth = 12
        newYear--
      }
      
      return { year: newYear, month: newMonth }
    })
  }

  // 日付フォーマット
  const formatDate = (date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    })
  }

  // 時刻フォーマット
  const formatTime = (time) => {
    if (!time) return ''
    return time.slice(0, 5)
  }

  // 円グラフ用データ
  const pieData = monthlyStats ? [
    { name: '完了', value: monthlyStats.done, color: '#10B981' },
    { name: '進行中', value: monthlyStats.in_progress, color: '#3B82F6' },
    { name: '未着手', value: monthlyStats.todo, color: '#9CA3AF' },
  ].filter(item => item.value > 0) : []

  // 棒グラフ用データ
  const barData = yearlyStats ? yearlyStats.data.map(item => ({
    name: `${item.month}月`,
    完了: item.done,
    未完了: item.total - item.done,
    達成率: item.completion_rate
  })) : []

  if (loading) {
    return <div className="p-6">読み込み中...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">📊 ダッシュボード</h2>

      {/* 上段：グラフ */}
      <div className="grid grid-cols-2 gap-6">
        {/* 月別達成率（円グラフ） */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">月別タスク達成率</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeMonth(-1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ←
              </button>
              <span className="text-sm">
                {selectedMonth.year}年{selectedMonth.month}月
              </span>
              <button
                onClick={() => changeMonth(1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                →
              </button>
            </div>
          </div>
          
          {monthlyStats && monthlyStats.total > 0 ? (
            <div className="flex items-center">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 pl-4">
                <div className="text-4xl font-bold text-center mb-2">
                  {monthlyStats.completion_rate}%
                </div>
                <div className="text-gray-500 text-center text-sm mb-4">達成率</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      完了
                    </span>
                    <span>{monthlyStats.done}件</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                      進行中
                    </span>
                    <span>{monthlyStats.in_progress}件</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                      未着手
                    </span>
                    <span>{monthlyStats.todo}件</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-medium">合計</span>
                    <span className="font-medium">{monthlyStats.total}件</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              この月のタスクはありません
            </div>
          )}
        </div>

        {/* 年別達成率（棒グラフ） */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">年別タスク達成状況</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedYear(prev => prev - 1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ←
              </button>
              <span className="text-sm">{selectedYear}年</span>
              <button
                onClick={() => setSelectedYear(prev => prev + 1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                →
              </button>
            </div>
          </div>
          
          {yearlyStats && yearlyStats.data.some(d => d.total > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="完了" stackId="a" fill="#10B981" />
                <Bar dataKey="未完了" stackId="a" fill="#E5E7EB" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              この年のタスクはありません
            </div>
          )}
        </div>
      </div>

      {/* 下段：予定と期限切れ */}
      <div className="grid grid-cols-2 gap-6">
        {/* 今日の予定 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">📅 予定</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeDate(-1)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                前日
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
              >
                今日
              </button>
              <button
                onClick={() => changeDate(1)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                翌日
              </button>
            </div>
          </div>
          <div className="p-4 border-b bg-gray-50">
            <div className="text-center font-medium">{formatDate(selectedDate)}</div>
          </div>
          <div className="p-4 max-h-80 overflow-y-auto">
            {/* スケジュール */}
            {dailyData.schedules.length > 0 && (
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-2">スケジュール</div>
                <div className="space-y-2">
                  {dailyData.schedules.map((schedule) => (
                    <div
                      key={`s-${schedule.id}`}
                      className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                    >
                      <div className="text-blue-600 mt-0.5">📅</div>
                      <div className="flex-1">
                        <div className="font-medium">{schedule.title}</div>
                        {!schedule.is_all_day && schedule.start_time && (
                          <div className="text-sm text-gray-500">
                            {formatTime(schedule.start_time)}
                            {schedule.end_time && ` - ${formatTime(schedule.end_time)}`}
                          </div>
                        )}
                        {schedule.is_all_day && (
                          <div className="text-sm text-gray-500">終日</div>
                        )}
                        {schedule.location && (
                          <div className="text-sm text-gray-500">📍 {schedule.location}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* タスク */}
            {dailyData.tasks.length > 0 && (
              <div>
                <div className="text-sm text-gray-500 mb-2">タスク（期限）</div>
                <div className="space-y-2">
                  {dailyData.tasks.map((task) => (
                    <div
                      key={`t-${task.id}`}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        task.status === 'done' ? 'bg-gray-100' : 'bg-orange-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={task.status === 'done'}
                        onChange={() => handleTaskComplete(task)}
                        className="w-5 h-5 rounded border-gray-300 text-green-600 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className={`font-medium ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>
                          {task.title}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dailyData.schedules.length === 0 && dailyData.tasks.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                この日の予定はありません
              </div>
            )}
          </div>
        </div>

        {/* 期限切れタスク */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">⚠️ 期限切れタスク</h3>
            {overdueTasks.length > 0 && (
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm">
                {overdueTasks.length}件
              </span>
            )}
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            {overdueTasks.length > 0 ? (
              <div className="space-y-2">
                {overdueTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={task.status === 'done'}
                      onChange={() => handleTaskComplete(task)}
                      className="w-5 h-5 rounded border-gray-300 text-green-600 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-red-600">
                        期限: {task.due_date}
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                期限切れのタスクはありません 🎉
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard