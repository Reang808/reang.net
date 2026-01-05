import { useState, useEffect } from 'react'
import { getTasks, createTask, updateTask, deleteTask } from '../src/api/tasks'
import Modal from '../components/common/Modal'
import TaskForm from '../components/tasks/TaskForm'

const Tasks = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const data = await getTasks()
      setTasks(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 新規作成処理
  const handleCreate = async (formData) => {
    try {
      await createTask(formData)
      setIsCreateModalOpen(false)
      fetchTasks()
    } catch (err) {
      alert(err.message)
    }
  }

  // 更新処理
  const handleUpdate = async (formData) => {
    try {
      await updateTask(editingTask.id, formData)
      setEditingTask(null)
      fetchTasks()
    } catch (err) {
      alert(err.message)
    }
  }

  // 削除処理
  const handleDelete = async () => {
    if (!window.confirm('このタスクを削除しますか？')) return
    try {
      await deleteTask(editingTask.id)
      setEditingTask(null)
      fetchTasks()
    } catch (err) {
      alert(err.message)
    }
  }

  // 完了チェック切り替え処理
  const handleToggleComplete = async (task) => {
    try {
      const newStatus = task.status === 'done' ? 'todo' : 'done'
      await updateTask(task.id, { ...task, status: newStatus })
      fetchTasks()
    } catch (err) {
      alert(err.message)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'done': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'todo': return '未着手'
      case 'in_progress': return '進行中'
      case 'done': return '完了'
      default: return status
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return '高'
      case 'medium': return '中'
      case 'low': return '低'
      default: return priority
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-[200px]">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 text-red-500">{error}</div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* ヘッダー */}
      <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl font-semibold">✅ タスク管理</h2>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2.5 sm:py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-center"
        >
          + 新規作成
        </button>
      </div>

      {/* タスク一覧 */}
      <div className="p-4 sm:p-6">
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">タスクがありません</p>
        ) : (
          <>
            {/* PC用テーブル表示 */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-500 text-sm border-b">
                    <th className="pb-3 font-medium w-12">完了</th>
                    <th className="pb-3 font-medium">タイトル</th>
                    <th className="pb-3 font-medium">ステータス</th>
                    <th className="pb-3 font-medium">優先度</th>
                    <th className="pb-3 font-medium">期限</th>
                    <th className="pb-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr 
                      key={task.id} 
                      className={`border-b last:border-b-0 hover:bg-gray-50 ${
                        task.status === 'done' ? 'bg-gray-50' : ''
                      }`}
                    >
                      <td className="py-4">
                        <input
                          type="checkbox"
                          checked={task.status === 'done'}
                          onChange={() => handleToggleComplete(task)}
                          className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-4">
                        <div className={`font-medium ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div className={`text-sm mt-1 ${task.status === 'done' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {task.description}
                          </div>
                        )}
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {getPriorityLabel(task.priority)}
                        </span>
                      </td>
                      <td className="py-4 text-gray-600">
                        {task.due_date || '-'}
                      </td>
                      <td className="py-4">
                        <button 
                          onClick={() => setEditingTask(task)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          編集
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* スマホ・タブレット用カード表示 */}
            <div className="lg:hidden space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`border rounded-lg p-3 sm:p-4 ${
                    task.status === 'done' ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                  }`}
                >
                  {/* カード上部: チェックボックス + タイトル + 編集ボタン */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={task.status === 'done'}
                      onChange={() => handleToggleComplete(task)}
                      className="w-5 h-5 mt-0.5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>
                        {task.title}
                      </div>
                      {task.description && (
                        <div className={`text-sm mt-1 ${task.status === 'done' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {task.description}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => setEditingTask(task)}
                      className="text-blue-600 hover:text-blue-800 active:text-blue-900 px-2 py-1 -mr-2 flex-shrink-0"
                    >
                      編集
                    </button>
                  </div>

                  {/* カード下部: ステータス + 優先度 + 期限 */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 pl-8">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {getStatusLabel(task.status)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      優先度: {getPriorityLabel(task.priority)}
                    </span>
                    {task.due_date && (
                      <span className="text-xs text-gray-500">
                        📅 {task.due_date}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 新規作成モーダル */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        title="タスク新規作成"
      >
        <TaskForm 
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* 編集モーダル */}
      <Modal 
        isOpen={editingTask !== null} 
        onClose={() => setEditingTask(null)}
        title="タスク編集"
      >
        {editingTask && (
          <TaskForm 
            initialData={editingTask}
            onSubmit={handleUpdate}
            onCancel={() => setEditingTask(null)}
            onDelete={handleDelete}
            isEdit={true}
          />
        )}
      </Modal>
    </div>
  )
}

export default Tasks