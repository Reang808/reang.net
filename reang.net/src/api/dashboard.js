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

// 月別タスク統計
export const getMonthlyStats = async (year, month) => {
  const response = await authFetch(
    `${API_BASE_URL}/tasks/stats/monthly/?year=${year}&month=${month}`
  )
  if (!response.ok) throw new Error('統計の取得に失敗しました')
  return response.json()
}

// 年別タスク統計
export const getYearlyStats = async (year) => {
  const response = await authFetch(
    `${API_BASE_URL}/tasks/stats/yearly/?year=${year}`
  )
  if (!response.ok) throw new Error('統計の取得に失敗しました')
  return response.json()
}

// 期限切れタスク
export const getOverdueTasks = async () => {
  const response = await authFetch(`${API_BASE_URL}/tasks/overdue/`)
  if (!response.ok) throw new Error('期限切れタスクの取得に失敗しました')
  return response.json()
}

// 日別スケジュール・タスク
export const getDailyData = async (date) => {
  const response = await authFetch(`${API_BASE_URL}/schedules/daily/?date=${date}`)
  if (!response.ok) throw new Error('データの取得に失敗しました')
  return response.json()
}