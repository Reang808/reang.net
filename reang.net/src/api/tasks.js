import { API_BASE_URL } from './config'

// タスク一覧を取得
export const getTasks = async () => {
  const response = await fetch(`${API_BASE_URL}/tasks/`)
  if (!response.ok) throw new Error('タスクの取得に失敗しました')
  return response.json()
}

// タスクを作成
export const createTask = async (task) => {
  const response = await fetch(`${API_BASE_URL}/tasks/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  })
  if (!response.ok) throw new Error('タスクの作成に失敗しました')
  return response.json()
}

// タスクを更新
export const updateTask = async (id, task) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  })
  if (!response.ok) throw new Error('タスクの更新に失敗しました')
  return response.json()
}

// タスクを削除
export const deleteTask = async (id) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}/`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('タスクの削除に失敗しました')
}