import { useState, useEffect } from 'react'

// ローカル日付でフォーマット（タイムゾーンずれ防止）
const formatDateLocal = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const MobileCalendar = ({
  currentDate,
  schedules,
  tasks,
  onDateClick,
  onPrevMonth,
  onNextMonth,
  onScheduleClick,
  onTaskClick,
  onTaskComplete,
  onAddSchedule
}) => {
  const [selectedWeekStart, setSelectedWeekStart] = useState(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // 初期化: 今日を含む週を選択
  useEffect(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - dayOfWeek)
    weekStart.setHours(0, 0, 0, 0)
    setSelectedWeekStart(weekStart)
  }, [])

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

  // その日のスケジュールとタスクの件数を取得
  const getItemCountsForDate = (date) => {
    const dateStr = formatDateLocal(date)
    const scheduleCount = schedules.filter(s => s.date === dateStr).length
    const taskCount = tasks.filter(t => t.due_date === dateStr).length
    return { scheduleCount, taskCount }
  }

  // その日のスケジュールとタスクを取得
  const getItemsForDate = (date) => {
    const dateStr = formatDateLocal(date)
    return {
      schedules: schedules.filter(s => s.date === dateStr),
      tasks: tasks.filter(t => t.due_date === dateStr)
    }
  }

  // 今日かどうか
  const isToday = (date) => {
    const today = new Date()
    return formatDateLocal(date) === formatDateLocal(today)
  }

  // 今月かどうか
  const isCurrentMonth = (date) => {
    return date.getMonth() === month
  }

  // 選択された週かどうか
  const isSelectedWeek = (weekStartDate) => {
    if (!selectedWeekStart) return false
    return formatDateLocal(weekStartDate) === formatDateLocal(selectedWeekStart)
  }

  // 週を選択
  const handleWeekSelect = (weekStartDate) => {
    setSelectedWeekStart(new Date(weekStartDate))
  }

  // 前週へ
  const handlePrevWeek = () => {
    if (!selectedWeekStart) return
    const newStart = new Date(selectedWeekStart)
    newStart.setDate(newStart.getDate() - 7)
    setSelectedWeekStart(newStart)
    
    // 月をまたぐ場合
    if (newStart.getMonth() !== month) {
      onPrevMonth()
    }
  }

  // 次週へ
  const handleNextWeek = () => {
    if (!selectedWeekStart) return
    const newStart = new Date(selectedWeekStart)
    newStart.setDate(newStart.getDate() + 7)
    setSelectedWeekStart(newStart)
    
    // 月をまたぐ場合
    if (newStart.getMonth() !== month) {
      onNextMonth()
    }
  }

  // 今日へ戻る
  const handleGoToToday = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - dayOfWeek)
    weekStart.setHours(0, 0, 0, 0)
    setSelectedWeekStart(weekStart)
  }

  // 選択された週の日付を取得
  const getSelectedWeekDays = () => {
    if (!selectedWeekStart) return []
    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(selectedWeekStart)
      day.setDate(selectedWeekStart.getDate() + i)
      weekDays.push(day)
    }
    return weekDays
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

  // 時刻フォーマット
  const formatTime = (time) => {
    if (!time) return ''
    return time.slice(0, 5)
  }

  const weekDays = ['日', '月', '火', '水', '木', '金', '土']
  const selectedWeekDays = getSelectedWeekDays()

  return (
    <div className="space-y-4">
      {/* ミニ月カレンダー */}
      <div className="bg-white rounded-lg shadow p-3">
        {/* 月ナビゲーション */}
        <div className="flex justify-between items-center mb-3">
          <button
            onClick={onPrevMonth}
            className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
          >
            ←
          </button>
          <h2 className="text-base font-semibold">
            {year}年 {month + 1}月
          </h2>
          <button
            onClick={onNextMonth}
            className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
          >
            →
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 mb-1">
          {weekDays.map((day, index) => (
            <div
              key={day}
              className={`text-center text-xs font-medium py-1 ${
                index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* ミニカレンダー本体 */}
        <div className="grid grid-cols-7 gap-0.5">
          {weeks.map((week, weekIndex) => (
            week.map((date, dayIndex) => {
              const { scheduleCount, taskCount } = getItemCountsForDate(date)
              const isWeekSelected = isSelectedWeek(week[0])

              return (
                <div
                  key={formatDateLocal(date)}
                  onClick={() => handleWeekSelect(week[0])}
                  className={`
                    relative p-1 text-center cursor-pointer rounded transition-colors
                    ${isWeekSelected ? 'bg-blue-50' : 'hover:bg-gray-50 active:bg-gray-100'}
                    ${!isCurrentMonth(date) ? 'opacity-40' : ''}
                  `}
                >
                  {/* 日付 */}
                  <div
                    className={`
                      text-xs w-6 h-6 flex items-center justify-center mx-auto rounded-full
                      ${isToday(date) ? 'bg-blue-600 text-white' : ''}
                      ${dayIndex === 0 && !isToday(date) ? 'text-red-500' : ''}
                      ${dayIndex === 6 && !isToday(date) ? 'text-blue-500' : ''}
                    `}
                  >
                    {date.getDate()}
                  </div>

                  {/* 予定件数インジケーター */}
                  {(scheduleCount > 0 || taskCount > 0) && (
                    <div className="flex justify-center gap-0.5 mt-0.5">
                      {scheduleCount > 0 && (
                        <span className="text-[10px] text-green-600 font-medium">
                          {scheduleCount}
                        </span>
                      )}
                      {taskCount > 0 && (
                        <span className="text-[10px] text-orange-600 font-medium">
                          {taskCount}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          ))}
        </div>

        {/* 凡例 */}
        <div className="flex justify-center gap-4 mt-2 pt-2 border-t text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="text-green-600 font-medium">●</span> 予定
          </span>
          <span className="flex items-center gap-1">
            <span className="text-orange-600 font-medium">●</span> タスク
          </span>
        </div>
      </div>

      {/* 週詳細ビュー */}
      <div className="bg-white rounded-lg shadow">
        {/* 週ナビゲーション */}
        <div className="flex justify-between items-center p-3 border-b">
          <button
            onClick={handlePrevWeek}
            className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors text-sm"
          >
            ← 前週
          </button>
          <button
            onClick={handleGoToToday}
            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 active:bg-blue-300 transition-colors"
          >
            今日
          </button>
          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors text-sm"
          >
            次週 →
          </button>
        </div>

        {/* 週の日付ヘッダー */}
        <div className="grid grid-cols-7 border-b">
          {selectedWeekDays.map((date, index) => (
            <div
              key={formatDateLocal(date)}
              className={`
                p-2 text-center border-r last:border-r-0
                ${isToday(date) ? 'bg-blue-50' : ''}
              `}
            >
              <div className={`text-xs ${
                index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-500'
              }`}>
                {weekDays[index]}
              </div>
              <div className={`
                text-sm font-medium w-7 h-7 flex items-center justify-center mx-auto rounded-full
                ${isToday(date) ? 'bg-blue-600 text-white' : ''}
              `}>
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* 週の詳細内容 */}
        <div className="divide-y max-h-96 overflow-y-auto">
          {selectedWeekDays.map((date, index) => {
            const { schedules: daySchedules, tasks: dayTasks } = getItemsForDate(date)
            const hasItems = daySchedules.length > 0 || dayTasks.length > 0
            const dateStr = formatDateLocal(date)

            return (
              <div
                key={dateStr}
                className={`p-3 ${isToday(date) ? 'bg-blue-50/50' : ''}`}
              >
                {/* 日付ラベル */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`
                      text-sm font-medium
                      ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : ''}
                    `}>
                      {date.getMonth() + 1}/{date.getDate()}（{weekDays[index]}）
                    </span>
                    {isToday(date) && (
                      <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded">
                        今日
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onAddSchedule(dateStr)}
                    className="text-xs text-blue-600 hover:text-blue-800 active:text-blue-900 px-2 py-1"
                  >
                    + 追加
                  </button>
                </div>

                {/* スケジュール */}
                {daySchedules.map((schedule) => (
                  <div
                    key={`s-${schedule.id}`}
                    onClick={() => onScheduleClick(schedule)}
                    className="flex items-start gap-2 p-2 mb-1 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getColorClass(schedule.color)}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{schedule.title}</div>
                      {!schedule.is_all_day && schedule.start_time && (
                        <div className="text-xs text-gray-500">
                          {formatTime(schedule.start_time)}
                          {schedule.end_time && ` - ${formatTime(schedule.end_time)}`}
                        </div>
                      )}
                      {schedule.is_all_day && (
                        <div className="text-xs text-gray-500">終日</div>
                      )}
                      {schedule.location && (
                        <div className="text-xs text-gray-500 truncate">📍 {schedule.location}</div>
                      )}
                    </div>
                  </div>
                ))}

                {/* タスク */}
                {dayTasks.map((task) => (
                  <div
                    key={`t-${task.id}`}
                    className={`flex items-center gap-2 p-2 mb-1 rounded-lg ${
                      task.status === 'done' ? 'bg-gray-100' : 'bg-orange-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={task.status === 'done'}
                      onChange={() => onTaskComplete(task)}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 cursor-pointer flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm truncate ${
                        task.status === 'done' ? 'line-through text-gray-400' : ''
                      }`}>
                        {task.title}
                      </div>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                    </span>
                  </div>
                ))}

                {/* 予定なし */}
                {!hasItems && (
                  <div className="text-xs text-gray-400 text-center py-2">
                    予定なし
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default MobileCalendar