import { API_BASE_URL } from './config'

// トークンをローカルストレージから取得
const getToken = () => localStorage.getItem('token')

// 認証ヘッダー付きfetch（JSON用）
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

// 認証ヘッダー付きfetch（FormData用）
const authFetchFormData = async (url, options = {}) => {
  const token = getToken()
  const headers = {
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

// ==================== カテゴリ ====================

// カテゴリ一覧を取得
export const getExpenseCategories = async () => {
  const response = await authFetch(`${API_BASE_URL}/expenses/categories/`)
  if (!response.ok) throw new Error('カテゴリの取得に失敗しました')
  return response.json()
}

// カテゴリを作成
export const createExpenseCategory = async (category) => {
  const response = await authFetch(`${API_BASE_URL}/expenses/categories/`, {
    method: 'POST',
    body: JSON.stringify(category),
  })
  if (!response.ok) throw new Error('カテゴリの作成に失敗しました')
  return response.json()
}

// カテゴリを更新
export const updateExpenseCategory = async (id, category) => {
  const response = await authFetch(`${API_BASE_URL}/expenses/categories/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(category),
  })
  if (!response.ok) throw new Error('カテゴリの更新に失敗しました')
  return response.json()
}

// カテゴリを削除
export const deleteExpenseCategory = async (id) => {
  const response = await authFetch(`${API_BASE_URL}/expenses/categories/${id}/`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('カテゴリの削除に失敗しました')
}

// ==================== 支払方法 ====================

// 支払方法一覧を取得
export const getPaymentMethods = async () => {
  const response = await authFetch(`${API_BASE_URL}/expenses/payment-methods/`)
  if (!response.ok) throw new Error('支払方法の取得に失敗しました')
  return response.json()
}

// 支払方法を作成
export const createPaymentMethod = async (method) => {
  const response = await authFetch(`${API_BASE_URL}/expenses/payment-methods/`, {
    method: 'POST',
    body: JSON.stringify(method),
  })
  if (!response.ok) throw new Error('支払方法の作成に失敗しました')
  return response.json()
}

// 支払方法を更新
export const updatePaymentMethod = async (id, method) => {
  const response = await authFetch(`${API_BASE_URL}/expenses/payment-methods/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(method),
  })
  if (!response.ok) throw new Error('支払方法の更新に失敗しました')
  return response.json()
}

// 支払方法を削除
export const deletePaymentMethod = async (id) => {
  const response = await authFetch(`${API_BASE_URL}/expenses/payment-methods/${id}/`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('支払方法の削除に失敗しました')
}

// ==================== 支出 ====================

// 支出一覧を取得
export const getExpenses = async (params = {}) => {
  const queryParams = new URLSearchParams()
  
  if (params.year) queryParams.append('year', params.year)
  if (params.month) queryParams.append('month', params.month)
  if (params.expense_type) queryParams.append('expense_type', params.expense_type)
  if (params.category) queryParams.append('category', params.category)
  if (params.payment_method) queryParams.append('payment_method', params.payment_method)
  if (params.start_date) queryParams.append('start_date', params.start_date)
  if (params.end_date) queryParams.append('end_date', params.end_date)
  
  const queryString = queryParams.toString()
  const url = `${API_BASE_URL}/expenses/expenses/${queryString ? `?${queryString}` : ''}`
  
  const response = await authFetch(url)
  if (!response.ok) throw new Error('支出の取得に失敗しました')
  return response.json()
}

// 支出を作成
export const createExpense = async (expense) => {
  const formData = new FormData()
  
  formData.append('date', expense.date)
  formData.append('amount', expense.amount)
  formData.append('expense_type', expense.expense_type)
  formData.append('description', expense.description)
  
  if (expense.category) formData.append('category', expense.category)
  if (expense.payment_method) formData.append('payment_method', expense.payment_method)
  if (expense.memo) formData.append('memo', expense.memo)
  if (expense.receipt_image) formData.append('receipt_image', expense.receipt_image)
  
  const response = await authFetchFormData(`${API_BASE_URL}/expenses/expenses/`, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) throw new Error('支出の作成に失敗しました')
  return response.json()
}

// 支出を更新
export const updateExpense = async (id, expense) => {
  const formData = new FormData()
  
  formData.append('date', expense.date)
  formData.append('amount', expense.amount)
  formData.append('expense_type', expense.expense_type)
  formData.append('description', expense.description)
  
  if (expense.category) formData.append('category', expense.category)
  if (expense.payment_method) formData.append('payment_method', expense.payment_method)
  if (expense.memo) formData.append('memo', expense.memo)
  if (expense.receipt_image && typeof expense.receipt_image !== 'string') {
    formData.append('receipt_image', expense.receipt_image)
  }
  
  const response = await authFetchFormData(`${API_BASE_URL}/expenses/expenses/${id}/`, {
    method: 'PUT',
    body: formData,
  })
  if (!response.ok) throw new Error('支出の更新に失敗しました')
  return response.json()
}

// 支出を削除
export const deleteExpense = async (id) => {
  const response = await authFetch(`${API_BASE_URL}/expenses/expenses/${id}/`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('支出の削除に失敗しました')
}

// 月別サマリーを取得
export const getExpenseSummary = async (year, month) => {
  const response = await authFetch(
    `${API_BASE_URL}/expenses/expenses/summary/?year=${year}&month=${month}`
  )
  if (!response.ok) throw new Error('サマリーの取得に失敗しました')
  return response.json()
}

// 年間サマリーを取得
export const getExpenseYearlySummary = async (year) => {
  const response = await authFetch(
    `${API_BASE_URL}/expenses/expenses/yearly_summary/?year=${year}`
  )
  if (!response.ok) throw new Error('年間サマリーの取得に失敗しました')
  return response.json()
}

// ==================== 固定費 ====================

// 固定費一覧を取得
export const getRecurringExpenses = async () => {
  const response = await authFetch(`${API_BASE_URL}/expenses/recurring/`)
  if (!response.ok) throw new Error('固定費の取得に失敗しました')
  return response.json()
}

// 固定費を作成
export const createRecurringExpense = async (recurring) => {
  const response = await authFetch(`${API_BASE_URL}/expenses/recurring/`, {
    method: 'POST',
    body: JSON.stringify(recurring),
  })
  if (!response.ok) throw new Error('固定費の作成に失敗しました')
  return response.json()
}

// 固定費を更新
export const updateRecurringExpense = async (id, recurring) => {
  const response = await authFetch(`${API_BASE_URL}/expenses/recurring/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(recurring),
  })
  if (!response.ok) throw new Error('固定費の更新に失敗しました')
  return response.json()
}

// 固定費を削除
export const deleteRecurringExpense = async (id) => {
  const response = await authFetch(`${API_BASE_URL}/expenses/recurring/${id}/`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('固定費の削除に失敗しました')
}

// 固定費から支出を生成
export const generateRecurringExpenses = async (year, month) => {
  const response = await authFetch(`${API_BASE_URL}/expenses/recurring/generate/`, {
    method: 'POST',
    body: JSON.stringify({ year, month }),
  })
  if (!response.ok) throw new Error('固定費の生成に失敗しました')
  return response.json()
}