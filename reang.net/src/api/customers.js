import { API_BASE_URL } from './config'

// 顧客一覧を取得（検索対応）
export const getCustomers = async (search = '') => {
  const params = search ? `?search=${encodeURIComponent(search)}` : ''
  const response = await fetch(`${API_BASE_URL}/customers/${params}`)
  if (!response.ok) throw new Error('顧客の取得に失敗しました')
  return response.json()
}

// 顧客詳細を取得
export const getCustomer = async (id) => {
  const response = await fetch(`${API_BASE_URL}/customers/${id}/`)
  if (!response.ok) throw new Error('顧客の取得に失敗しました')
  return response.json()
}

// 顧客を作成
export const createCustomer = async (customer) => {
  const response = await fetch(`${API_BASE_URL}/customers/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
  })
  if (!response.ok) throw new Error('顧客の作成に失敗しました')
  return response.json()
}

// 顧客を更新
export const updateCustomer = async (id, customer) => {
  const response = await fetch(`${API_BASE_URL}/customers/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
  })
  if (!response.ok) throw new Error('顧客の更新に失敗しました')
  return response.json()
}

// 顧客を削除
export const deleteCustomer = async (id) => {
  const response = await fetch(`${API_BASE_URL}/customers/${id}/`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('顧客の削除に失敗しました')
}

// 名刺アップロード
export const uploadBusinessCard = async (id, frontFile, backFile) => {
  const formData = new FormData()
  if (frontFile) formData.append('front', frontFile)
  if (backFile) formData.append('back', backFile)

  const response = await fetch(`${API_BASE_URL}/customers/${id}/upload-business-card/`, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) throw new Error('名刺のアップロードに失敗しました')
  return response.json()
}

// 書類一覧を取得
export const getDocuments = async (customerId) => {
  const response = await fetch(`${API_BASE_URL}/documents/?customer=${customerId}`)
  if (!response.ok) throw new Error('書類の取得に失敗しました')
  return response.json()
}

// 書類をアップロード
export const uploadDocument = async (customerId, category, title, file, description = '') => {
  const formData = new FormData()
  formData.append('customer', customerId)
  formData.append('category', category)
  formData.append('title', title)
  formData.append('file', file)
  formData.append('description', description)

  const response = await fetch(`${API_BASE_URL}/documents/`, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) throw new Error('書類のアップロードに失敗しました')
  return response.json()
}

// 書類を削除
export const deleteDocument = async (id) => {
  const response = await fetch(`${API_BASE_URL}/documents/${id}/`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('書類の削除に失敗しました')
}