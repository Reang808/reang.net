import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCustomers, deleteCustomer } from '../src/api/customers'
import Modal from '../components/common/Modal'
import CustomerForm from '../components/customers/CustomerForm'
import { createCustomer } from '../src/api/customers'

const Customers = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async (search = '') => {
    try {
      setLoading(true)
      const data = await getCustomers(search)
      setCustomers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 検索実行
  const handleSearch = (e) => {
    e.preventDefault()
    fetchCustomers(searchQuery)
  }

  // 検索クリア
  const handleClearSearch = () => {
    setSearchQuery('')
    fetchCustomers()
  }

  // 新規作成
  const handleCreate = async (formData) => {
    try {
      await createCustomer(formData)
      setIsCreateModalOpen(false)
      fetchCustomers(searchQuery)
    } catch (err) {
      alert(err.message)
    }
  }

  // 詳細画面へ
  const handleRowClick = (customerId) => {
    navigate(`/customers/${customerId}`)
  }

  if (loading && customers.length === 0) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-[200px]">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 text-red-500">{error}</div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* ヘッダー */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">👥 顧客管理</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2.5 sm:py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-center"
          >
            + 新規登録
          </button>
        </div>

        {/* 検索フォーム */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="名前、会社名、メール、電話番号で検索..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 sm:flex-none bg-gray-800 text-white px-6 py-2.5 sm:py-2 rounded-lg hover:bg-gray-700 active:bg-gray-600 transition-colors"
            >
              検索
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="flex-1 sm:flex-none border border-gray-300 px-4 py-2.5 sm:py-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                クリア
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 顧客一覧 */}
      <div className="p-4 sm:p-6">
        {customers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {searchQuery ? '検索結果がありません' : '顧客がいません'}
          </p>
        ) : (
          <>
            {/* PC用テーブル表示 */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-500 text-sm border-b">
                    <th className="pb-3 font-medium">会社名</th>
                    <th className="pb-3 font-medium">氏名</th>
                    <th className="pb-3 font-medium">部署・役職</th>
                    <th className="pb-3 font-medium">連絡先</th>
                    <th className="pb-3 font-medium">書類数</th>
                    <th className="pb-3 font-medium">登録日</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      onClick={() => handleRowClick(customer.id)}
                      className="border-b last:border-b-0 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <td className="py-4 font-medium">
                        {customer.company_name || '-'}
                      </td>
                      <td className="py-4">{customer.name}</td>
                      <td className="py-4 text-gray-600">
                        {[customer.department, customer.position]
                          .filter(Boolean)
                          .join(' / ') || '-'}
                      </td>
                      <td className="py-4">
                        <div className="text-sm">
                          {customer.email && <div>{customer.email}</div>}
                          {customer.phone && (
                            <div className="text-gray-500">{customer.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">
                          {customer.document_count}件
                        </span>
                      </td>
                      <td className="py-4 text-gray-600">
                        {new Date(customer.created_at).toLocaleDateString('ja-JP')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* スマホ・タブレット用カード表示 */}
            <div className="lg:hidden space-y-3">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => handleRowClick(customer.id)}
                  className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-blue-50 active:bg-blue-100 cursor-pointer transition-colors"
                >
                  {/* 上部: 会社名 + 氏名 */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      {customer.company_name && (
                        <div className="text-xs text-gray-500 mb-0.5 truncate">
                          {customer.company_name}
                        </div>
                      )}
                      <div className="font-medium text-base truncate">
                        {customer.name}
                      </div>
                      {(customer.department || customer.position) && (
                        <div className="text-xs text-gray-500 truncate">
                          {[customer.department, customer.position]
                            .filter(Boolean)
                            .join(' / ')}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* 中部: 連絡先 */}
                  <div className="text-sm space-y-1 mb-3">
                    {customer.email && (
                      <div className="flex items-center gap-2 text-gray-600 truncate">
                        <span className="flex-shrink-0">✉️</span>
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="flex-shrink-0">📞</span>
                        <span>{customer.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* 下部: 書類数 + 登録日 */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                      書類 {customer.document_count}件
                    </span>
                    <span className="text-gray-500">
                      登録: {new Date(customer.created_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 新規作成モーダル */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="顧客新規登録"
      >
        <CustomerForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

export default Customers