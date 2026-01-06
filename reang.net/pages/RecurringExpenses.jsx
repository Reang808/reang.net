import { useState, useEffect } from 'react'
import {
  getRecurringExpenses,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  getExpenseCategories,
  getPaymentMethods
} from '../src/api/expenses'
import Modal from '../components/common/Modal'

const RecurringExpenses = () => {
  const [recurringExpenses, setRecurringExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    expense_type: 'personal',
    category: '',
    payment_method: '',
    frequency: 'monthly',
    day_of_month: 1,
    is_active: true,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [expensesData, categoriesData, methodsData] = await Promise.all([
        getRecurringExpenses(),
        getExpenseCategories(),
        getPaymentMethods()
      ])
      setRecurringExpenses(expensesData)
      setCategories(categoriesData)
      setPaymentMethods(methodsData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      expense_type: 'personal',
      category: '',
      payment_method: '',
      frequency: 'monthly',
      day_of_month: 1,
      is_active: true,
    })
    setEditingExpense(null)
  }

  const handleOpenModal = (expense = null) => {
    if (expense) {
      setFormData({
        name: expense.name,
        amount: expense.amount,
        expense_type: expense.expense_type,
        category: expense.category || '',
        payment_method: expense.payment_method || '',
        frequency: expense.frequency,
        day_of_month: expense.day_of_month,
        is_active: expense.is_active,
      })
      setEditingExpense(expense)
    } else {
      resetForm()
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const submitData = {
      ...formData,
      amount: parseInt(formData.amount, 10),
      day_of_month: parseInt(formData.day_of_month, 10),
      category: formData.category || null,
      payment_method: formData.payment_method || null,
    }
    
    try {
      if (editingExpense) {
        await updateRecurringExpense(editingExpense.id, submitData)
      } else {
        await createRecurringExpense(submitData)
      }
      handleCloseModal()
      fetchData()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('この固定費を削除しますか？')) return
    try {
      await deleteRecurringExpense(editingExpense.id)
      handleCloseModal()
      fetchData()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleToggleActive = async (expense) => {
    try {
      await updateRecurringExpense(expense.id, {
        ...expense,
        is_active: !expense.is_active,
      })
      fetchData()
    } catch (err) {
      alert(err.message)
    }
  }

  const formatAmount = (amount) => amount.toLocaleString()

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">🔄 固定費設定</h2>
            <p className="text-sm text-gray-500 mt-1">
              毎月自動で支出に追加される固定費を管理します
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2.5 sm:py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-center"
          >
            + 固定費を追加
          </button>
        </div>
      </div>

      {/* 固定費一覧 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6">
          {recurringExpenses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              固定費が登録されていません
            </p>
          ) : (
            <div className="space-y-3">
              {recurringExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className={`flex items-center gap-3 p-3 sm:p-4 border rounded-lg transition-colors ${
                    expense.is_active 
                      ? 'border-gray-200 bg-white' 
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  {/* 有効/無効トグル */}
                  <button
                    onClick={() => handleToggleActive(expense)}
                    className={`flex-shrink-0 w-12 h-6 rounded-full transition-colors ${
                      expense.is_active ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        expense.is_active ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>

                  {/* 内容 */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => handleOpenModal(expense)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm sm:text-base truncate">
                        {expense.name}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        expense.expense_type === 'personal'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {expense.expense_type_display}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span>{expense.frequency_display}</span>
                      <span>•</span>
                      <span>{expense.day_of_month}日</span>
                      {expense.category_name && (
                        <>
                          <span>•</span>
                          <span>{expense.category_icon} {expense.category_name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 金額 */}
                  <div className="flex-shrink-0 text-right">
                    <div className="font-bold text-sm sm:text-base">
                      {formatAmount(expense.amount)}円
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* モーダル */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingExpense ? '固定費を編集' : '固定費を追加'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 名前 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="例：家賃、Netflix"
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
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
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
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                  formData.expense_type === 'business'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                🏢 会社
              </button>
            </div>
          </div>

          {/* 頻度と支払日 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                頻度
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="monthly">毎月</option>
                <option value="yearly">毎年</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                支払日
              </label>
              <select
                name="day_of_month"
                value={formData.day_of_month}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[...Array(28)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}日</option>
                ))}
              </select>
            </div>
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
              {categories.filter(c => c.is_active).map(cat => (
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
              {paymentMethods.filter(m => m.is_active).map(method => (
                <option key={method.id} value={method.id}>
                  {method.icon} {method.name}
                </option>
              ))}
            </select>
          </div>

          {/* ボタン */}
          <div className={`pt-4 ${editingExpense ? 'space-y-3 sm:space-y-0 sm:flex sm:justify-between' : ''}`}>
            {editingExpense && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors"
              >
                削除
              </button>
            )}
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
              >
                {editingExpense ? '更新' : '追加'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default RecurringExpenses