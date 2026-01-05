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
  
  const response = await fetch(url, {
    ...options,
    headers,
  })
  
  return response
}

// ログイン
export const login = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}/accounts/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.non_field_errors?.[0] || error.detail || 'ログインに失敗しました')
  }
  
  const data = await response.json()
  
  // トークンを保存
  localStorage.setItem('token', data.token)
  
  return data
}

// ログアウト
export const logout = async () => {
  try {
    await authFetch(`${API_BASE_URL}/accounts/logout/`, {
      method: 'POST',
    })
  } catch (err) {
    // エラーでも続行
  }
  
  // トークンを削除
  localStorage.removeItem('token')
}

// ユーザー登録
export const register = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/accounts/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(Object.values(error).flat().join(', ') || '登録に失敗しました')
  }
  
  const data = await response.json()
  
  // トークンを保存
  localStorage.setItem('token', data.token)
  
  return data
}

// 現在のユーザー情報を取得
export const getCurrentUser = async () => {
  const response = await authFetch(`${API_BASE_URL}/accounts/me/`)
  
  if (!response.ok) {
    throw new Error('ユーザー情報の取得に失敗しました')
  }
  
  return response.json()
}

// ユーザー情報を更新
export const updateUser = async (userData) => {
  const response = await authFetch(`${API_BASE_URL}/accounts/me/update/`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(Object.values(error).flat().join(', ') || '更新に失敗しました')
  }
  
  return response.json()
}

// パスワード変更
export const changePassword = async (currentPassword, newPassword) => {
  const response = await authFetch(`${API_BASE_URL}/accounts/me/password/`, {
    method: 'POST',
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.current_password?.[0] || error.new_password?.[0] || 'パスワード変更に失敗しました')
  }
  
  const data = await response.json()
  
  // 新しいトークンを保存
  localStorage.setItem('token', data.token)
  
  return data
}

// 認証状態確認
export const checkAuth = async () => {
  const token = getToken()
  
  if (!token) {
    return { is_authenticated: false, user: null }
  }
  
  try {
    const response = await authFetch(`${API_BASE_URL}/accounts/check/`)
    
    if (!response.ok) {
      localStorage.removeItem('token')
      return { is_authenticated: false, user: null }
    }
    
    return response.json()
  } catch (err) {
    localStorage.removeItem('token')
    return { is_authenticated: false, user: null }
  }
}