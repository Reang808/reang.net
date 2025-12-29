import { API_BASE_URL } from './config'

// カレンダーデータ取得（スケジュール + タスク）
export const getCalendarData = async (startDate, endDate) => {
  const response = await fetch(
    `${API_BASE_URL}/schedules/calendar/?start_date=${startDate}&end_date=${endDate}`
  )
  if (!response.ok) throw new Error('カレンダーデータの取得に失敗しました')
  return response.json()
}

// スケジュール作成
export const createSchedule = async (schedule) => {
  const response = await fetch(`${API_BASE_URL}/schedules/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(schedule),
  })
  if (!response.ok) throw new Error('スケジュールの作成に失敗しました')
  return response.json()
}

// スケジュール更新
export const updateSchedule = async (id, schedule) => {
  const response = await fetch(`${API_BASE_URL}/schedules/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(schedule),
  })
  if (!response.ok) throw new Error('スケジュールの更新に失敗しました')
  return response.json()
}

// スケジュール削除
export const deleteSchedule = async (id) => {
  const response = await fetch(`${API_BASE_URL}/schedules/${id}/`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('スケジュールの削除に失敗しました')
}