import { useState, useEffect } from 'react'
import { getExpenseCategories, getPaymentMethods } from '../../src/api/expenses'

const ExpenseForm = ({ onSubmit, onCancel, onDelete, initialData = null, isEdit = false }) => {
  const [categories, setCategories] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [previewImage, setPreviewImage] = useState(null)
  
  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    amount: initialData?.amount || '',
    expense_type: initialData?.expense_type || 'personal',
    category: initialData?.category || '',
    payment_method: initialData?.payment_method || '',
    description: initialData?.description || '',
    memo: initialData?.memo || '',
    receipt_image: null,
  })

  useEffect(() => {
    fetchOptions()
    if (initialData?.receipt_image_url) {
      setPreviewImage(initialData.receipt_image_url)
    }
  }, [])

  const fetchOptions = async () => {
    try {
      const [categoriesData, methodsData] = await Promise.all([
        getExpenseCategories(),
        getPaymentMethods()
      ])
      setCategories(categoriesData.filter(c => c.is_active))
      setPaymentMethods(methodsData.filter(m => m.is_active))
    } catch (err) {
      console.error(err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, receipt_image: file }))
      // プレビュー用URL作成
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, receipt_image: null }))
    setPreviewImage(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const submitData = {
      ...formData,
      amount: parseInt(formData.amount, 10),
      category: formData.category || null,
      payment_method: formData.payment_method || null,
    }
    
    onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 金額 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          金額 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="0"
            placeholder="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">円</span>
        </div>
      </div>

      {/* 区分 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          区分 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, expense_type: 'personal' }))}
            className={`flex-1 py-2.5 sm:py-2 px-4 rounded-lg border-2 transition-colors ${
              formData.expense_type === 'personal'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            👤 個人
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, expense_type: 'business' }))}
            className={`flex-1 py-2.5 sm:py-2 px-4 rounded-lg border-2 transition-colors ${
              formData.expense_type === 'business'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            🏢 会社
          </button>
        </div>
      </div>

      {/* 内容 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          内容 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          placeholder="例：コンビニで昼食"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* カテゴリ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          カテゴリ
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">選択なし</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* 支払方法 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          支払方法
        </label>
        <select
          name="payment_method"
          value={formData.payment_method}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">選択なし</option>
          {paymentMethods.map(method => (
            <option key={method.id} value={method.id}>
              {method.icon} {method.name}
            </option>
          ))}
        </select>
      </div>

      {/* メモ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          メモ
        </label>
        <textarea
          name="memo"
          value={formData.memo}
          onChange={handleChange}
          rows={2}
          placeholder="補足があれば入力"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* レシート画像 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          レシート画像
        </label>
        {previewImage ? (
          <div className="relative">
            <img
              src={previewImage}
              alt="レシート"
              className="w-full max-h-48 object-contain rounded-lg border"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        ) : (
          <label className="block">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors">
              <div className="text-gray-400 text-3xl mb-2">📷</div>
              <div className="text-gray-500 text-sm">タップして画像を選択</div>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        )}
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
            {isEdit ? '更新' : '登録'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default ExpenseForm