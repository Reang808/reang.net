import { useState, useEffect } from 'react'
import { getCalendarData, createSchedule, updateSchedule, deleteSchedule } from '../src/api/schedules'
import { updateTask } from '../src/api/tasks'
import Calendar from '../components/schedule/Calendar'
import MobileCalendar from '../components/schedule/MobileCalendar'
import Modal from '../components/common/Modal'
import ScheduleForm from '../components/schedule/ScheduleForm'
import DayDetailModal from '../components/schedule/DayDetailModal'

// ローカル日付でフォーマット（タイムゾーンずれ防止）
const formatDateLocal = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const Schedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [schedules, setSchedules] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // モーダル制御
  const [selectedDate, setSelectedDate] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [newScheduleDate, setNewScheduleDate] = useState('')

  useEffect(() => {
    fetchCalendarData()
  }, [currentDate])

  const fetchCalendarData = async () => {
    try {
      setLoading(true)
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      
      // 月の前後も含めて取得（ローカル日付でフォーマット）
      const startDate = formatDateLocal(new Date(year, month - 1, 1))
      const endDate = formatDateLocal(new Date(year, month + 2, 0))
      
      const data = await getCalendarData(startDate, endDate)
      setSchedules(data.schedules)
      setTasks(data.tasks)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 前月へ
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  // 次月へ
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // 日付クリック
  const handleDateClick = (date) => {
    setSelectedDate(date)
  }

  // スケジュールクリック（編集）
  const handleScheduleClick = (schedule) => {
    setSelectedDate(null)
    setEditingSchedule(schedule)
  }

  // タスククリック（何もしない、またはタスク画面へ遷移など）
  const handleTaskClick = (task) => {
    // 必要に応じてタスク詳細表示など
  }

  // タスク完了切り替え
  const handleTaskComplete = async (task) => {
    try {
      const newStatus = task.status === 'done' ? 'todo' : 'done'
      await updateTask(task.id, { ...task, status: newStatus })
      fetchCalendarData()
    } catch (err) {
      alert(err.message)
    }
  }

  // スケジュール作成
  const handleCreate = async (formData) => {
    try {
      await createSchedule(formData)
      setIsCreateModalOpen(false)
      setSelectedDate(null)
      fetchCalendarData()
    } catch (err) {
      alert(err.message)
    }
  }

  // スケジュール更新
  const handleUpdate = async (formData) => {
    try {
      await updateSchedule(editingSchedule.id, formData)
      setEditingSchedule(null)
      fetchCalendarData()
    } catch (err) {
      alert(err.message)
    }
  }

  // スケジュール削除
  const handleDelete = async () => {
    if (!window.confirm('このスケジュールを削除しますか？')) return
    try {
      await deleteSchedule(editingSchedule.id)
      setEditingSchedule(null)
      fetchCalendarData()
    } catch (err) {
      alert(err.message)
    }
  }

  // 日付詳細からスケジュール追加
  const handleAddScheduleFromDay = () => {
    const dateStr = formatDateLocal(selectedDate)
    setNewScheduleDate(dateStr)
    setSelectedDate(null)
    setIsCreateModalOpen(true)
  }

  // 日付を指定してスケジュール追加（モバイル週ビューから）
  const handleAddScheduleWithDate = (dateStr) => {
    setNewScheduleDate(dateStr)
    setIsCreateModalOpen(true)
  }

  // 選択した日のデータを取得
  const getSelectedDateData = () => {
    if (!selectedDate) return { schedules: [], tasks: [] }
    const dateStr = formatDateLocal(selectedDate)
    return {
      schedules: schedules.filter(s => s.date === dateStr),
      tasks: tasks.filter(t => t.due_date === dateStr)
    }
  }

  if (loading && schedules.length === 0) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-[200px]">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return <div className="p-4 sm:p-6 text-red-500">{error}</div>
  }

  const selectedDateData = getSelectedDateData()

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl font-semibold">📅 スケジュール</h2>
        <button
          onClick={() => {
            setNewScheduleDate('')
            setIsCreateModalOpen(true)
          }}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2.5 sm:py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-center"
        >
          + 新規作成
        </button>
      </div>

      {/* PC用カレンダー */}
      <div className="hidden lg:block">
        <Calendar
          currentDate={currentDate}
          schedules={schedules}
          tasks={tasks}
          onDateClick={handleDateClick}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onScheduleClick={handleScheduleClick}
          onTaskClick={handleTaskClick}
        />
      </div>

      {/* スマホ・タブレット用カレンダー */}
      <div className="lg:hidden">
        <MobileCalendar
          currentDate={currentDate}
          schedules={schedules}
          tasks={tasks}
          onDateClick={handleDateClick}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onScheduleClick={handleScheduleClick}
          onTaskClick={handleTaskClick}
          onTaskComplete={handleTaskComplete}
          onAddSchedule={handleAddScheduleWithDate}
        />
      </div>

      {/* 日付詳細モーダル（PC用） */}
      {selectedDate && (
        <DayDetailModal
          date={selectedDate}
          schedules={selectedDateData.schedules}
          tasks={selectedDateData.tasks}
          onClose={() => setSelectedDate(null)}
          onScheduleClick={handleScheduleClick}
          onTaskComplete={handleTaskComplete}
          onAddSchedule={handleAddScheduleFromDay}
        />
      )}

      {/* スケジュール作成モーダル */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="スケジュール作成"
      >
        <ScheduleForm
          initialData={newScheduleDate ? { date: newScheduleDate } : null}
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* スケジュール編集モーダル */}
      <Modal
        isOpen={editingSchedule !== null}
        onClose={() => setEditingSchedule(null)}
        title="スケジュール編集"
      >
        {editingSchedule && (
          <ScheduleForm
            initialData={editingSchedule}
            onSubmit={handleUpdate}
            onCancel={() => setEditingSchedule(null)}
            onDelete={handleDelete}
            isEdit={true}
          />
        )}
      </Modal>
    </div>
  )
}

export default Schedule