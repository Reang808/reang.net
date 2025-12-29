const DayDetailModal = ({ 
  date, 
  schedules, 
  tasks, 
  onClose, 
  onScheduleClick, 
  onTaskComplete,
  onAddSchedule 
}) => {
  const formatDate = (d) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
    return new Date(d).toLocaleDateString('ja-JP', options)
  }

  const formatTime = (time) => {
    if (!time) return ''
    return time.slice(0, 5)
  }

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

  const getPriorityLabel = (priority) => {
    const labels = { high: '高', medium: '中', low: '低' }
    return labels[priority] || priority
  }

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600',
      medium: 'text-yellow-600',
      low: 'text-green-600',
    }
    return colors[priority] || ''
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold">{formatDate(date)}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* スケジュール追加ボタン */}
          <button
            onClick={onAddSchedule}
            className="w-full mb-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
          >
            + スケジュールを追加
          </button>

          {/* スケジュール一覧 */}
          {schedules.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">📅 スケジュール</h4>
              <div className="space-y-2">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    onClick={() => onScheduleClick(schedule)}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${getColorClass(schedule.color)}`}></div>
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
                      {schedule.customer_name && (
                        <div className="text-sm text-gray-500">👤 {schedule.customer_name}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* タスク一覧 */}
          {tasks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">📋 タスク（期限）</h4>
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      task.status === 'done' ? 'bg-gray-100' : 'bg-orange-50'
                    }`}
                  >
                    {/* 完了チェックボックス */}
                    <input
                      type="checkbox"
                      checked={task.status === 'done'}
                      onChange={() => onTaskComplete(task)}
                      className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div
                        className={`font-medium ${
                          task.status === 'done' ? 'line-through text-gray-400' : ''
                        }`}
                      >
                        {task.title}
                      </div>
                      {task.description && (
                        <div
                          className={`text-sm ${
                            task.status === 'done' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          {task.description}
                        </div>
                      )}
                      <div className="flex gap-2 mt-1">
                        <span
                          className={`text-xs font-medium ${getPriorityColor(task.priority)}`}
                        >
                          優先度: {getPriorityLabel(task.priority)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 何もない場合 */}
          {schedules.length === 0 && tasks.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              この日の予定はありません
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default DayDetailModal