import { API_BASE_URL } from './config'

// トークンをローカルストレージから取得
const getToken = () => localStorage.getItem('token')

// 認証ヘッダー付きfetch
const authFetch = async (url, options = {}) => {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (token) {
    headers['Authorization'] = `Token ${token}`
  }
  
  return fetch(url, {
    ...options,
    headers,
  })
}

// タスク一覧を取得
export const getTasks = async () => {
  const response = await authFetch(`${API_BASE_URL}/tasks/`)
  if (!response.ok) throw new Error('タスクの取得に失敗しました')
  return response.json()
}

// タスクを作成
export const createTask = async (task) => {
  const response = await authFetch(`${API_BASE_URL}/tasks/`, {
    method: 'POST',
    body: JSON.stringify(task),
  })
  if (!response.ok) throw new Error('タスクの作成に失敗しました')
  return response.json()
}

// タスクを更新
export const updateTask = async (id, task) => {
  const response = await authFetch(`${API_BASE_URL}/tasks/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(task),
  })
  if (!response.ok) throw new Error('タスクの更新に失敗しました')
  return response.json()
}

// タスクを削除
export const deleteTask = async (id) => {
  const response = await authFetch(`${API_BASE_URL}/tasks/${id}/`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('タスクの削除に失敗しました')
}