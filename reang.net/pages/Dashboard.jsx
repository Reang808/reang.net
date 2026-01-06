import { useState, useEffect } from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import { getMonthlyStats, getYearlyStats, getOverdueTasks, getDailyData } from '../src/api/dashboard'
import { updateTask, deleteTask } from '../src/api/tasks'
import { updateSchedule, deleteSchedule } from '../src/api/schedules'
import Modal from '../components/common/Modal'
import ScheduleForm from '../components/schedule/ScheduleForm'
import TaskForm from '../components/tasks/TaskForm'

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

  // モーダル用のstate
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)

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

  // タスク完了処理（チェックボックス用）
  const handleTaskComplete = async (task, e) => {
    // イベントの伝播を止めてクリックイベントが発火しないようにする
    e.stopPropagation()
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

  // スケジュールクリック時
  const handleScheduleClick = (schedule) => {
    setSelectedSchedule(schedule)
    setIsScheduleModalOpen(true)
  }

  // タスククリック時
  const handleTaskClick = (task) => {
    setSelectedTask(task)
    setIsTaskModalOpen(true)
  }

  // スケジュール更新
  const handleScheduleUpdate = async (formData) => {
    try {
      await updateSchedule(selectedSchedule.id, formData)
      setIsScheduleModalOpen(false)
      setSelectedSchedule(null)
      fetchDailyData()
    } catch (err) {
      alert(err.message)
    }
  }

  // スケジュール削除
  const handleScheduleDelete = async () => {
    if (!window.confirm('このスケジュールを削除しますか？')) return
    try {
      await deleteSchedule(selectedSchedule.id)
      setIsScheduleModalOpen(false)
      setSelectedSchedule(null)
      fetchDailyData()
    } catch (err) {
      alert(err.message)
    }
  }

  // タスク更新
  const handleTaskUpdate = async (formData) => {
    try {
      await updateTask(selectedTask.id, formData)
      setIsTaskModalOpen(false)
      setSelectedTask(null)
      fetchDailyData()
      fetchOverdueTasks()
      fetchMonthlyStats()
      fetchYearlyStats()
    } catch (err) {
      alert(err.message)
    }
  }

  // タスク削除
  const handleTaskDelete = async () => {
    if (!window.confirm('このタスクを削除しますか？')) return
    try {
      await deleteTask(selectedTask.id)
      setIsTaskModalOpen(false)
      setSelectedTask(null)
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

  // 日付フォーマット（短縮版・スマホ用）
  const formatDateShort = (date) => {
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
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
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-[200px]">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <h2 className="text-lg sm:text-xl font-semibold">📊 ダッシュボード</h2>

      {/* 下段：予定と期限切れ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* 今日の予定 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-3 sm:p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="font-semibold text-sm sm:text-base">📅 予定</h3>
            <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
              <button
                onClick={() => changeDate(-1)}
                className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                前日
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
              >
                今日
              </button>
              <button
                onClick={() => changeDate(1)}
                className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                翌日
              </button>
            </div>
          </div>
          <div className="p-3 sm:p-4 border-b bg-gray-50">
            <div className="text-center font-medium text-sm sm:text-base">
              <span className="hidden sm:inline">{formatDate(selectedDate)}</span>
              <span className="sm:hidden">{formatDateShort(selectedDate)}</span>
            </div>
          </div>
          <div className="p-3 sm:p-4 max-h-60 sm:max-h-80 overflow-y-auto">
            {/* スケジュール */}
            {dailyData.schedules.length > 0 && (
              <div className="mb-4">
                <div className="text-xs sm:text-sm text-gray-500 mb-2">スケジュール</div>
                <div className="space-y-2">
                  {dailyData.schedules.map((schedule) => (
                    <div
                      key={`s-${schedule.id}`}
                      onClick={() => handleScheduleClick(schedule)}
                      className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                    >
                      <div className="text-blue-600 mt-0.5 text-sm sm:text-base">📅</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base truncate">{schedule.title}</div>
                        {!schedule.is_all_day && schedule.start_time && (
                          <div className="text-xs sm:text-sm text-gray-500">
                            {formatTime(schedule.start_time)}
                            {schedule.end_time && ` - ${formatTime(schedule.end_time)}`}
                          </div>
                        )}
                        {schedule.is_all_day && (
                          <div className="text-xs sm:text-sm text-gray-500">終日</div>
                        )}
                        {schedule.location && (
                          <div className="text-xs sm:text-sm text-gray-500 truncate">📍 {schedule.location}</div>
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
                <div className="text-xs sm:text-sm text-gray-500 mb-2">タスク（期限）</div>
                <div className="space-y-2">
                  {dailyData.tasks.map((task) => (
                    <div
                      key={`t-${task.id}`}
                      onClick={() => handleTaskClick(task)}
                      className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg cursor-pointer transition-colors ${
                        task.status === 'done' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-orange-50 hover:bg-orange-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={task.status === 'done'}
                        onChange={(e) => handleTaskComplete(task, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 rounded border-gray-300 text-green-600 cursor-pointer flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium text-sm sm:text-base truncate ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>
                          {task.title}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dailyData.schedules.length === 0 && dailyData.tasks.length === 0 && (
              <div className="text-center text-gray-500 py-6 sm:py-8 text-sm">
                この日の予定はありません
              </div>
            )}
          </div>
        </div>

        {/* 期限切れタスク */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-3 sm:p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-sm sm:text-base">⚠️ 期限切れタスク</h3>
            {overdueTasks.length > 0 && (
              <span className="bg-red-100 text-red-700 px-2 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm">
                {overdueTasks.length}件
              </span>
            )}
          </div>
          <div className="p-3 sm:p-4 max-h-72 sm:max-h-96 overflow-y-auto">
            {overdueTasks.length > 0 ? (
              <div className="space-y-2">
                {overdueTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={task.status === 'done'}
                      onChange={(e) => handleTaskComplete(task, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 rounded border-gray-300 text-green-600 cursor-pointer flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm sm:text-base truncate">{task.title}</div>
                      <div className="text-xs sm:text-sm text-red-600">
                        期限: {task.due_date}
                      </div>
                    </div>
                    <div className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex-shrink-0 ${
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
              <div className="text-center text-gray-500 py-6 sm:py-8 text-sm">
                期限切れのタスクはありません 🎉
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 上段：グラフ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* 月別達成率（円グラフ） */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <h3 className="font-semibold text-sm sm:text-base">月別タスク達成率</h3>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="前月"
              >
                ←
              </button>
              <span className="text-sm min-w-[100px] text-center">
                {selectedMonth.year}年{selectedMonth.month}月
              </span>
              <button
                onClick={() => changeMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="次月"
              >
                →
              </button>
            </div>
          </div>
          
          {monthlyStats && monthlyStats.total > 0 ? (
            <div className="flex flex-col sm:flex-row items-center">
              <div className="w-full sm:w-1/2">
                <ResponsiveContainer width="100%" height={160} className="sm:h-[200px]">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full sm:w-1/2 sm:pl-4 mt-4 sm:mt-0">
                <div className="text-3xl sm:text-4xl font-bold text-center mb-1 sm:mb-2">
                  {monthlyStats.completion_rate}%
                </div>
                <div className="text-gray-500 text-center text-xs sm:text-sm mb-3 sm:mb-4">達成率</div>
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
            <div className="h-40 sm:h-48 flex items-center justify-center text-gray-500 text-sm">
              この月のタスクはありません
            </div>
          )}
        </div>

        {/* 年別達成率（棒グラフ） */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <h3 className="font-semibold text-sm sm:text-base">年別タスク達成状況</h3>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setSelectedYear(prev => prev - 1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="前年"
              >
                ←
              </button>
              <span className="text-sm min-w-[60px] text-center">{selectedYear}年</span>
              <button
                onClick={() => setSelectedYear(prev => prev + 1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="次年"
              >
                →
              </button>
            </div>
          </div>
          
          {yearlyStats && yearlyStats.data.some(d => d.total > 0) ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-[500px] sm:min-w-0 px-4 sm:px-0">
                <ResponsiveContainer width="100%" height={180} className="sm:h-[200px]">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                    <YAxis tick={{ fontSize: 10 }} width={30} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="完了" stackId="a" fill="#10B981" />
                    <Bar dataKey="未完了" stackId="a" fill="#E5E7EB" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="h-40 sm:h-48 flex items-center justify-center text-gray-500 text-sm">
              この年のタスクはありません
            </div>
          )}
        </div>
      </div>

      {/* スケジュール編集モーダル */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false)
          setSelectedSchedule(null)
        }}
        title="スケジュール編集"
      >
        {selectedSchedule && (
          <ScheduleForm
            initialData={selectedSchedule}
            isEdit={true}
            onSubmit={handleScheduleUpdate}
            onCancel={() => {
              setIsScheduleModalOpen(false)
              setSelectedSchedule(null)
            }}
            onDelete={handleScheduleDelete}
          />
        )}
      </Modal>

      {/* タスク編集モーダル */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false)
          setSelectedTask(null)
        }}
        title="タスク編集"
      >
        {selectedTask && (
          <TaskForm
            initialData={selectedTask}
            isEdit={true}
            onSubmit={handleTaskUpdate}
            onCancel={() => {
              setIsTaskModalOpen(false)
              setSelectedTask(null)
            }}
            onDelete={handleTaskDelete}
          />
        )}
      </Modal>
    </div>
  )
}

export default Dashboard