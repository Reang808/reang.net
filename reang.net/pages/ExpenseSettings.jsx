import { useState, useEffect } from 'react'
import {
  getExpenseCategories,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod
} from '../src/api/expenses'
import Modal from '../components/common/Modal'

const ExpenseSettings = () => {
  const [activeTab, setActiveTab] = useState('categories')
  const [categories, setCategories] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  
  // モーダル
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingMethod, setEditingMethod] = useState(null)
  
  // カテゴリフォーム
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: '📁',
    color: 'gray',
  })
  
  // 支払方法フォーム
  const [methodForm, setMethodForm] = useState({
    name: '',
    icon: '💳',
  })

  const iconOptions = ['📁', '🍽️', '🚗', '🏠', '💡', '📱', '🎮', '👕', '💊', '📚', '✈️', '🎁', '🛒', '💼', '🏥', '🎬', '☕', '🍺', '💇', '🏋️']
  const colorOptions = [
    { value: 'gray', label: 'グレー', class: 'bg-gray-500' },
    { value: 'red', label: '赤', class: 'bg-red-500' },
    { value: 'orange', label: 'オレンジ', class: 'bg-orange-500' },
    { value: 'yellow', label: '黄', class: 'bg-yellow-500' },
    { value: 'green', label: '緑', class: 'bg-green-500' },
    { value: 'teal', label: 'ティール', class: 'bg-teal-500' },
    { value: 'blue', label: '青', class: 'bg-blue-500' },
    { value: 'indigo', label: 'インディゴ', class: 'bg-indigo-500' },
    { value: 'purple', label: '紫', class: 'bg-purple-500' },
    { value: 'pink', label: 'ピンク', class: 'bg-pink-500' },
  ]
  const methodIconOptions = ['💳', '💵', '🏦', '📱', '💴', '🏧', '💰', '🪙']

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [categoriesData, methodsData] = await Promise.all([
        getExpenseCategories(),
        getPaymentMethods()
      ])
      setCategories(categoriesData)
      setPaymentMethods(methodsData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // カテゴリ関連
  const resetCategoryForm = () => {
    setCategoryForm({ name: '', icon: '📁', color: 'gray' })
    setEditingCategory(null)
  }

  const handleOpenCategoryModal = (category = null) => {
    if (category) {
      setCategoryForm({
        name: category.name,
        icon: category.icon,
        color: category.color,
      })
      setEditingCategory(category)
    } else {
      resetCategoryForm()
    }
    setIsCategoryModalOpen(true)
  }

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false)
    resetCategoryForm()
  }

  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        await updateExpenseCategory(editingCategory.id, categoryForm)
      } else {
        await createExpenseCategory(categoryForm)
      }
      handleCloseCategoryModal()
      fetchData()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleCategoryDelete = async () => {
    if (!window.confirm('このカテゴリを削除しますか？')) return
    try {
      await deleteExpenseCategory(editingCategory.id)
      handleCloseCategoryModal()
      fetchData()
    } catch (err) {
      alert(err.message)
    }
  }

  // 支払方法関連
  const resetMethodForm = () => {
    setMethodForm({ name: '', icon: '💳' })
    setEditingMethod(null)
  }

  const handleOpenMethodModal = (method = null) => {
    if (method) {
      setMethodForm({
        name: method.name,
        icon: method.icon,
      })
      setEditingMethod(method)
    } else {
      resetMethodForm()
    }
    setIsMethodModalOpen(true)
  }

  const handleCloseMethodModal = () => {
    setIsMethodModalOpen(false)
    resetMethodForm()
  }

  const handleMethodSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingMethod) {
        await updatePaymentMethod(editingMethod.id, methodForm)
      } else {
        await createPaymentMethod(methodForm)
      }
      handleCloseMethodModal()
      fetchData()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleMethodDelete = async () => {
    if (!window.confirm('この支払方法を削除しますか？')) return
    try {
      await deletePaymentMethod(editingMethod.id)
      handleCloseMethodModal()
      fetchData()
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-[200px]">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold">⚙️ 支出設定</h2>
        
        {/* タブ */}
        <div className="flex gap-2 sm:gap-4 mt-4 border-b">
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-2 px-2 sm:px-3 text-sm sm:text-base ${
              activeTab === 'categories'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500'
            }`}
          >
            カテゴリ
          </button>
          <button
            onClick={() => setActiveTab('methods')}
            className={`pb-2 px-2 sm:px-3 text-sm sm:text-base ${
              activeTab === 'methods'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500'
            }`}
          >
            支払方法
          </button>
        </div>
      </div>

      {/* カテゴリタブ */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6 border-b flex justify-between items-center">
            <h3 className="font-semibold">カテゴリ一覧</h3>
            <button
              onClick={() => handleOpenCategoryModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              + 追加
            </button>
          </div>
          <div className="p-4 sm:p-6">
            {categories.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                カテゴリが登録されていません
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleOpenCategoryModal(category)}
                    className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: getColorValue(category.color) }}
                    >
                      {category.icon}
                    </span>
                    <span className="text-sm font-medium truncate">{category.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 支払方法タブ */}
      {activeTab === 'methods' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6 border-b flex justify-between items-center">
            <h3 className="font-semibold">支払方法一覧</h3>
            <button
              onClick={() => handleOpenMethodModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              + 追加
            </button>
          </div>
          <div className="p-4 sm:p-6">
            {paymentMethods.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                支払方法が登録されていません
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleOpenMethodModal(method)}
                    className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className="text-2xl">{method.icon}</span>
                    <span className="text-sm font-medium truncate">{method.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* カテゴリモーダル */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        title={editingCategory ? 'カテゴリを編集' : 'カテゴリを追加'}
      >
        <form onSubmit={handleCategorySubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリ名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="例：食費"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              アイコン
            </label>
            <div className="flex flex-wrap gap-2">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setCategoryForm(prev => ({ ...prev, icon }))}
                  className={`w-10 h-10 text-xl rounded-lg border-2 transition-all ${
                    categoryForm.icon === icon
                      ? 'border-blue-500 bg-blue-50 scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              色
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setCategoryForm(prev => ({ ...prev, color: color.value }))}
                  className={`w-8 h-8 rounded-full ${color.class} transition-all ${
                    categoryForm.color === color.value
                      ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                      : ''
                  }`}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          <div className={`pt-4 ${editingCategory ? 'flex justify-between' : 'flex justify-end'}`}>
            {editingCategory && (
              <button
                type="button"
                onClick={handleCategoryDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                削除
              </button>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCloseCategoryModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingCategory ? '更新' : '追加'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* 支払方法モーダル */}
      <Modal
        isOpen={isMethodModalOpen}
        onClose={handleCloseMethodModal}
        title={editingMethod ? '支払方法を編集' : '支払方法を追加'}
      >
        <form onSubmit={handleMethodSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={methodForm.name}
              onChange={(e) => setMethodForm(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="例：クレジットカード"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              アイコン
            </label>
            <div className="flex flex-wrap gap-2">
              {methodIconOptions.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setMethodForm(prev => ({ ...prev, icon }))}
                  className={`w-10 h-10 text-xl rounded-lg border-2 transition-all ${
                    methodForm.icon === icon
                      ? 'border-blue-500 bg-blue-50 scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className={`pt-4 ${editingMethod ? 'flex justify-between' : 'flex justify-end'}`}>
            {editingMethod && (
              <button
                type="button"
                onClick={handleMethodDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                削除
              </button>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCloseMethodModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingMethod ? '更新' : '追加'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}

// 色の値を取得
function getColorValue(color) {
  const colors = {
    red: '#EF4444',
    blue: '#3B82F6',
    green: '#10B981',
    yellow: '#F59E0B',
    purple: '#8B5CF6',
    pink: '#EC4899',
    gray: '#6B7280',
    orange: '#F97316',
    teal: '#14B8A6',
    indigo: '#6366F1',
  }
  return colors[color] || '#6B7280'
}

export default ExpenseSettings