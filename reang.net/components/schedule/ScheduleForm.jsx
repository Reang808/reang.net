import { useState, useEffect } from 'react'
import { getCustomers } from '../../src/api/customers'

const ScheduleForm = ({ onSubmit, onCancel, onDelete, initialData = null, isEdit = false }) => {
  const [customers, setCustomers] = useState([])
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    date: initialData?.date || '',
    start_time: initialData?.start_time || '',
    end_time: initialData?.end_time || '',
    is_all_day: initialData?.is_all_day || false,
    color: initialData?.color || 'blue',
    location: initialData?.location || '',
    customer: initialData?.customer || '',
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const data = await getCustomers()
      setCustomers(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const submitData = {
      ...formData,
      start_time: formData.is_all_day ? null : formData.start_time || null,
      end_time: formData.is_all_day ? null : formData.end_time || null,
      customer: formData.customer || null,
    }
    onSubmit(submitData)
  }

  const colorOptions = [
    { value: 'blue', label: '青', class: 'bg-blue-500' },
    { value: 'green', label: '緑', class: 'bg-green-500' },
    { value: 'red', label: '赤', class: 'bg-red-500' },
    { value: 'yellow', label: '黄', class: 'bg-yellow-500' },
    { value: 'purple', label: '紫', class: 'bg-purple-500' },
    { value: 'pink', label: 'ピンク', class: 'bg-pink-500' },
    { value: 'gray', label: 'グレー', class: 'bg-gray-500' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* タイトル */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 日付 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          日付 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="w-full min-w-0 box-border border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          style={{ width: '100%' }}
        />
      </div>

      {/* 終日チェック */}
      <div className="flex items-center">
        <input
          type="checkbox"
          name="is_all_day"
          checked={formData.is_all_day}
          onChange={handleChange}
          className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600 rounded"
        />
        <label className="ml-2 text-sm text-gray-700">終日</label>
      </div>

      {/* 時間（終日でない場合） */}
      {!formData.is_all_day && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              開始時刻
            </label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              className="w-full min-w-0 box-border border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              style={{ width: '100%' }}
            />
          </div>
          <div className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              終了時刻
            </label>
            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              className="w-full min-w-0 box-border border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      )}

      {/* 場所 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          場所
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 色 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          色
        </label>
        <div className="flex gap-2 sm:gap-2 flex-wrap">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, color: color.value }))}
              className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full ${color.class} transition-all ${
                formData.color === color.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
              }`}
              title={color.label}
            />
          ))}
        </div>
      </div>

      {/* 関連顧客 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          関連顧客
        </label>
        <select
          name="customer"
          value={formData.customer}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">選択なし</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.company_name ? `${customer.company_name} - ` : ''}
              {customer.name}
            </option>
          ))}
        </select>
      </div>

      {/* 詳細 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          詳細
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* ボタン */}
      <div className={`pt-4 ${isEdit ? 'space-y-3 sm:space-y-0 sm:flex sm:justify-between' : ''}`}>
        {isEdit && (
          <button
            type="button"
            onClick={onDelete}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors"
          >
            削除
          </button>
        )}
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            {isEdit ? '更新' : '作成'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default ScheduleForm