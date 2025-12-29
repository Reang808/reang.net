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
    return <div className="p-6">読み込み中...</div>
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* ヘッダー */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">👥 顧客管理</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + 新規登録
          </button>
        </div>

        {/* 検索フォーム */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="名前、会社名、メール、電話番号で検索..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            検索
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              クリア
            </button>
          )}
        </form>
      </div>

      {/* 顧客一覧 */}
      <div className="p-6">
        {customers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {searchQuery ? '検索結果がありません' : '顧客がいません'}
          </p>
        ) : (
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