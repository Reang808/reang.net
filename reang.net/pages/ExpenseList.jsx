import { useState, useEffect } from 'react'
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseCategories,
  getPaymentMethods
} from '../src/api/expenses'
import Modal from '../components/common/Modal'
import ExpenseForm from '../components/expenses/ExpenseForm'

const ExpenseList = () => {
  const today = new Date()
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  
  // フィルター
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1)
  const [filterType, setFilterType] = useState('') // personal, business, ''
  const [filterCategory, setFilterCategory] = useState('')
  
  // モーダル
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [receiptImageUrl, setReceiptImageUrl] = useState('')

  useEffect(() => {
    fetchOptions()
  }, [])

  useEffect(() => {
    fetchExpenses()
  }, [selectedYear, selectedMonth, filterType, filterCategory])

  const fetchOptions = async () => {
    try {
      const [categoriesData, methodsData] = await Promise.all([
        getExpenseCategories(),
        getPaymentMethods()
      ])
      setCategories(categoriesData)
      setPaymentMethods(methodsData)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      const params = {
        year: selectedYear,
        month: selectedMonth,
      }
      if (filterType) params.expense_type = filterType
      if (filterCategory) params.category = filterCategory
      
      const data = await getExpenses(params)
      setExpenses(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 支出作成
  const handleCreate = async (formData) => {
    try {
      await createExpense(formData)
      setIsCreateModalOpen(false)
      fetchExpenses()
    } catch (err) {
      alert(err.message)
    }
  }

  // 支出更新
  const handleUpdate = async (formData) => {
    try {
      await updateExpense(selectedExpense.id, formData)
      setIsEditModalOpen(false)
      setSelectedExpense(null)
      fetchExpenses()
    } catch (err) {
      alert(err.message)
    }
  }

  // 支出削除
  const handleDelete = async () => {
    if (!window.confirm('この支出を削除しますか？')) return
    try {
      await deleteExpense(selectedExpense.id)
      setIsEditModalOpen(false)
      setSelectedExpense(null)
      fetchExpenses()
    } catch (err) {
      alert(err.message)
    }
  }

  // 支出クリック
  const handleExpenseClick = (expense) => {
    setSelectedExpense(expense)
    setIsEditModalOpen(true)
  }

  // レシート表示
  const handleReceiptClick = (e, url) => {
    e.stopPropagation()
    setReceiptImageUrl(url)
    setIsReceiptModalOpen(true)
  }

  // 月変更
  const changeMonth = (direction) => {
    let newMonth = selectedMonth + direction
    let newYear = selectedYear
    
    if (newMonth > 12) {
      newMonth = 1
      newYear++
    } else if (newMonth < 1) {
      newMonth = 12
      newYear--
    }
    
    setSelectedYear(newYear)
    setSelectedMonth(newMonth)
  }

  // 合計計算
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const personalTotal = expenses.filter(e => e.expense_type === 'personal').reduce((sum, exp) => sum + exp.amount, 0)
  const businessTotal = expenses.filter(e => e.expense_type === 'business').reduce((sum, exp) => sum + exp.amount, 0)

  // 金額フォーマット
  const formatAmount = (amount) => {
    return amount.toLocaleString()
  }

  if (loading && expenses.length === 0) {
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">💰 支出一覧</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2.5 sm:py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-center"
          >
            + 支出を登録
          </button>
        </div>

        {/* 月選択 */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ←
          </button>
          <span className="text-lg font-medium min-w-[120px] text-center">
            {selectedYear}年{selectedMonth}月
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            →
          </button>
        </div>

        {/* サマリー */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs sm:text-sm text-gray-500">合計</div>
            <div className="text-base sm:text-xl font-bold">{formatAmount(totalAmount)}円</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-xs sm:text-sm text-blue-600">👤 個人</div>
            <div className="text-base sm:text-xl font-bold text-blue-700">{formatAmount(personalTotal)}円</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-xs sm:text-sm text-green-600">🏢 会社</div>
            <div className="text-base sm:text-xl font-bold text-green-700">{formatAmount(businessTotal)}円</div>
          </div>
        </div>

        {/* フィルター */}
        <div className="flex flex-wrap gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">すべての区分</option>
            <option value="personal">👤 個人</option>
            <option value="business">🏢 会社</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">すべてのカテゴリ</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 支出一覧 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6">
          {expenses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              この月の支出はありません
            </p>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  onClick={() => handleExpenseClick(expense)}
                  className="flex items-center gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  {/* 日付 */}
                  <div className="flex-shrink-0 text-center w-12">
                    <div className="text-xs text-gray-500">
                      {new Date(expense.date).getMonth() + 1}/{new Date(expense.date).getDate()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {['日', '月', '火', '水', '木', '金', '土'][new Date(expense.date).getDay()]}
                    </div>
                  </div>

                  {/* カテゴリアイコン */}
                  <div className="flex-shrink-0 text-xl">
                    {expense.category_icon || '📁'}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base truncate">
                      {expense.description}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className={`px-1.5 py-0.5 rounded ${
                        expense.expense_type === 'personal' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {expense.expense_type_display}
                      </span>
                      {expense.category_name && (
                        <span>{expense.category_name}</span>
                      )}
                      {expense.payment_method_name && (
                        <span className="hidden sm:inline">• {expense.payment_method_name}</span>
                      )}
                    </div>
                  </div>

                  {/* レシートアイコン */}
                  {expense.receipt_image_url && (
                    <button
                      onClick={(e) => handleReceiptClick(e, expense.receipt_image_url)}
                      className="flex-shrink-0 text-gray-400 hover:text-blue-500"
                    >
                      🧾
                    </button>
                  )}

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

      {/* 支出登録モーダル */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="支出を登録"
      >
        <ExpenseForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* 支出編集モーダル */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedExpense(null)
        }}
        title="支出を編集"
      >
        {selectedExpense && (
          <ExpenseForm
            initialData={selectedExpense}
            isEdit={true}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditModalOpen(false)
              setSelectedExpense(null)
            }}
            onDelete={handleDelete}
          />
        )}
      </Modal>

      {/* レシート表示モーダル */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false)
          setReceiptImageUrl('')
        }}
        title="レシート"
      >
        <img
          src={receiptImageUrl}
          alt="レシート"
          className="w-full max-h-[70vh] object-contain"
        />
      </Modal>
    </div>
  )
}

export default ExpenseList
