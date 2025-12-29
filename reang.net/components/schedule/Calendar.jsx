import { useState } from 'react'

const Calendar = ({ 
  currentDate, 
  schedules, 
  tasks, 
  onDateClick, 
  onPrevMonth, 
  onNextMonth,
  onScheduleClick,
  onTaskClick 
}) => {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // 月の最初の日と最後の日
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // カレンダーの開始日（前月の日曜日から）
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  // カレンダーの終了日（翌月の土曜日まで）
  const endDate = new Date(lastDay)
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))

  // 日付の配列を生成
  const days = []
  const current = new Date(startDate)
  while (current <= endDate) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  // 週ごとに分割
  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  // 日付をYYYY-MM-DD形式に変換
  const formatDate = (date) => {
    return date.toISOString().split('T')[0]
  }

  // その日のスケジュールとタスクを取得
  const getItemsForDate = (date) => {
    const dateStr = formatDate(date)
    const daySchedules = schedules.filter(s => s.date === dateStr)
    const dayTasks = tasks.filter(t => t.due_date === dateStr)
    return { schedules: daySchedules, tasks: dayTasks }
  }

  // 色のクラスを取得
  const getColorClass = (color) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      pink: 'bg-pink-500',
      gray: 'bg-gray-500',
    }
    return colors[color] || 'bg-blue-500'
  }

  // 今日かどうか
  const isToday = (date) => {
    const today = new Date()
    return formatDate(date) === formatDate(today)
  }

  // 今月かどうか
  const isCurrentMonth = (date) => {
    return date.getMonth() === month
  }

  const weekDays = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div className="bg-white rounded-lg shadow">
      {/* ヘッダー */}
      <div className="flex justify-between items-center p-4 border-b">
        <button
          onClick={onPrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          ← 前月
        </button>
        <h2 className="text-xl font-semibold">
          {year}年 {month + 1}月
        </h2>
        <button
          onClick={onNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          次月 →
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 border-b">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`p-2 text-center text-sm font-medium ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダー本体 */}
      <div className="grid grid-cols-7">
        {weeks.map((week, weekIndex) =>
          week.map((date, dayIndex) => {
            const { schedules: daySchedules, tasks: dayTasks } = getItemsForDate(date)
            const hasItems = daySchedules.length > 0 || dayTasks.length > 0

            return (
              <div
                key={formatDate(date)}
                onClick={() => onDateClick(date)}
                className={`min-h-24 border-b border-r p-1 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !isCurrentMonth(date) ? 'bg-gray-50' : ''
                }`}
              >
                {/* 日付 */}
                <div
                  className={`text-sm mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                    isToday(date)
                      ? 'bg-blue-600 text-white'
                      : dayIndex === 0
                      ? 'text-red-500'
                      : dayIndex === 6
                      ? 'text-blue-500'
                      : !isCurrentMonth(date)
                      ? 'text-gray-400'
                      : ''
                  }`}
                >
                  {date.getDate()}
                </div>

                {/* スケジュール */}
                {daySchedules.slice(0, 2).map((schedule) => (
                  <div
                    key={`s-${schedule.id}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onScheduleClick(schedule)
                    }}
                    className={`text-xs text-white px-1 py-0.5 rounded mb-0.5 truncate cursor-pointer hover:opacity-80 ${getColorClass(
                      schedule.color
                    )}`}
                  >
                    {schedule.title}
                  </div>
                ))}

                {/* タスク（期限） */}
                {dayTasks.slice(0, 2 - daySchedules.length).map((task) => (
                  <div
                    key={`t-${task.id}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onTaskClick(task)
                    }}
                    className={`text-xs px-1 py-0.5 rounded mb-0.5 truncate cursor-pointer hover:opacity-80 ${
                      task.status === 'done'
                        ? 'bg-gray-200 text-gray-500 line-through'
                        : 'bg-orange-100 text-orange-800 border border-orange-300'
                    }`}
                  >
                    📋 {task.title}
                  </div>
                ))}

                {/* もっとある場合 */}
                {daySchedules.length + dayTasks.length > 2 && (
                  <div className="text-xs text-gray-500 px-1">
                    +{daySchedules.length + dayTasks.length - 2}件
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default Calendar