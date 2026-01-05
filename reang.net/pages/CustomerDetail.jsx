import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getCustomer,
  updateCustomer,
  deleteCustomer,
  uploadBusinessCard,
  uploadDocument,
  deleteDocument,
} from '../src/api/customers'
import Modal from '../components/common/Modal'
import CustomerForm from '../components/customers/CustomerForm'

const CustomerDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('info')

  useEffect(() => {
    fetchCustomer()
  }, [id])

  const fetchCustomer = async () => {
    try {
      setLoading(true)
      const data = await getCustomer(id)
      setCustomer(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 顧客更新
  const handleUpdate = async (formData) => {
    try {
      await updateCustomer(id, formData)
      setIsEditModalOpen(false)
      fetchCustomer()
    } catch (err) {
      alert(err.message)
    }
  }

  // 顧客削除
  const handleDelete = async () => {
    if (!window.confirm('この顧客を削除しますか？関連する書類もすべて削除されます。')) return
    try {
      await deleteCustomer(id)
      navigate('/customers')
    } catch (err) {
      alert(err.message)
    }
  }

  // 名刺アップロード
  const handleBusinessCardUpload = async (e, side) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      if (side === 'front') {
        await uploadBusinessCard(id, file, null)
      } else {
        await uploadBusinessCard(id, null, file)
      }
      fetchCustomer()
    } catch (err) {
      alert(err.message)
    }
  }

  // 書類アップロード
  const handleDocumentUpload = async (formData) => {
    try {
      await uploadDocument(
        id,
        formData.category,
        formData.title,
        formData.file,
        formData.description
      )
      setIsDocumentModalOpen(false)
      fetchCustomer()
    } catch (err) {
      alert(err.message)
    }
  }

  // 書類削除
  const handleDocumentDelete = async (docId) => {
    if (!window.confirm('この書類を削除しますか？')) return
    try {
      await deleteDocument(docId)
      fetchCustomer()
    } catch (err) {
      alert(err.message)
    }
  }

  // カテゴリの日本語表示
  const getCategoryLabel = (category) => {
    const labels = {
      estimate: '見積書',
      proposal: '提案書',
      invoice: '請求書',
      contract: '契約書',
      web_data: 'Webサイトデータ',
      photo: '写真',
      other: 'その他',
    }
    return labels[category] || category
  }

  // ファイルサイズの表示
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-[200px]">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return <div className="p-4 sm:p-6 text-red-500">{error}</div>
  }

  if (!customer) {
    return <div className="p-4 sm:p-6">顧客が見つかりません</div>
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="w-full sm:w-auto">
            <button
              onClick={() => navigate('/customers')}
              className="text-gray-500 hover:text-gray-700 active:text-gray-800 mb-2 flex items-center gap-1"
            >
              <span>←</span>
              <span>顧客一覧に戻る</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold">{customer.name}</h1>
            {customer.company_name && (
              <p className="text-gray-600 text-sm sm:text-base">{customer.company_name}</p>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2.5 sm:py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              編集
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 sm:flex-none bg-red-600 text-white px-4 py-2.5 sm:py-2 rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors"
            >
              削除
            </button>
          </div>
        </div>

        {/* タブ */}
        <div className="flex gap-2 sm:gap-4 mt-6 border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-2 px-2 sm:px-3 whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'info'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500'
            }`}
          >
            基本情報
          </button>
          <button
            onClick={() => setActiveTab('card')}
            className={`pb-2 px-2 sm:px-3 whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'card'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500'
            }`}
          >
            名刺
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-2 px-2 sm:px-3 whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'documents'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500'
            }`}
          >
            書類 ({customer.documents?.length || 0})
          </button>
        </div>
      </div>

      {/* 基本情報タブ */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">連絡先</h3>
              <dl className="space-y-2 text-sm sm:text-base">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <dt className="text-gray-500 sm:w-24 mb-0.5 sm:mb-0">メール</dt>
                  <dd className="break-all">{customer.email || '-'}</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <dt className="text-gray-500 sm:w-24 mb-0.5 sm:mb-0">電話</dt>
                  <dd>{customer.phone || '-'}</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <dt className="text-gray-500 sm:w-24 mb-0.5 sm:mb-0">携帯</dt>
                  <dd>{customer.mobile || '-'}</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <dt className="text-gray-500 sm:w-24 mb-0.5 sm:mb-0">FAX</dt>
                  <dd>{customer.fax || '-'}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">所属</h3>
              <dl className="space-y-2 text-sm sm:text-base">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <dt className="text-gray-500 sm:w-24 mb-0.5 sm:mb-0">部署</dt>
                  <dd>{customer.department || '-'}</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <dt className="text-gray-500 sm:w-24 mb-0.5 sm:mb-0">役職</dt>
                  <dd>{customer.position || '-'}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">住所</h3>
              <dl className="space-y-2 text-sm sm:text-base">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <dt className="text-gray-500 sm:w-24 mb-0.5 sm:mb-0">郵便番号</dt>
                  <dd>{customer.postal_code || '-'}</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start">
                  <dt className="text-gray-500 sm:w-24 mb-0.5 sm:mb-0">住所</dt>
                  <dd>{customer.address || '-'}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">その他</h3>
              <dl className="space-y-2 text-sm sm:text-base">
                <div className="flex flex-col sm:flex-row sm:items-start">
                  <dt className="text-gray-500 sm:w-24 mb-0.5 sm:mb-0">Web</dt>
                  <dd className="break-all">
                    {customer.website ? (
                      <a
                        href={customer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {customer.website}
                      </a>
                    ) : (
                      '-'
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          {customer.notes && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-2 text-sm sm:text-base">メモ</h3>
              <p className="text-gray-600 whitespace-pre-wrap text-sm sm:text-base">{customer.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* 名刺タブ */}
      {activeTab === 'card' && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="font-semibold mb-4 text-sm sm:text-base">名刺画像</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">表面</p>
              {customer.business_card_front_url ? (
                <img
                  src={customer.business_card_front_url}
                  alt="名刺（表）"
                  className="w-full rounded-lg border"
                />
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center">
                  <p className="text-gray-400 mb-2 text-sm">画像がありません</p>
                </div>
              )}
              <label className="mt-3 block">
                <span className="bg-gray-100 text-gray-700 px-4 py-2.5 sm:py-2 rounded-lg cursor-pointer hover:bg-gray-200 active:bg-gray-300 inline-block text-sm sm:text-base transition-colors">
                  アップロード
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleBusinessCardUpload(e, 'front')}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">裏面</p>
              {customer.business_card_back_url ? (
                <img
                  src={customer.business_card_back_url}
                  alt="名刺（裏）"
                  className="w-full rounded-lg border"
                />
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center">
                  <p className="text-gray-400 mb-2 text-sm">画像がありません</p>
                </div>
              )}
              <label className="mt-3 block">
                <span className="bg-gray-100 text-gray-700 px-4 py-2.5 sm:py-2 rounded-lg cursor-pointer hover:bg-gray-200 active:bg-gray-300 inline-block text-sm sm:text-base transition-colors">
                  アップロード
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleBusinessCardUpload(e, 'back')}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 書類タブ */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="font-semibold text-sm sm:text-base">書類一覧</h3>
            <button
              onClick={() => setIsDocumentModalOpen(true)}
              className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2.5 sm:py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-center"
            >
              + 書類を追加
            </button>
          </div>
          <div className="p-4 sm:p-6">
            {customer.documents?.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm sm:text-base">書類がありません</p>
            ) : (
              <>
                {/* PC用テーブル表示 */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-500 text-sm border-b">
                        <th className="pb-3 font-medium">カテゴリ</th>
                        <th className="pb-3 font-medium">タイトル</th>
                        <th className="pb-3 font-medium">ファイル名</th>
                        <th className="pb-3 font-medium">サイズ</th>
                        <th className="pb-3 font-medium">登録日</th>
                        <th className="pb-3 font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customer.documents?.map((doc) => (
                        <tr key={doc.id} className="border-b last:border-b-0 hover:bg-gray-50">
                          <td className="py-3">
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                              {getCategoryLabel(doc.category)}
                            </span>
                          </td>
                          <td className="py-3 font-medium">{doc.title}</td>
                          <td className="py-3 text-gray-600">{doc.filename}</td>
                          <td className="py-3 text-gray-600">{formatFileSize(doc.file_size)}</td>
                          <td className="py-3 text-gray-600">
                            {new Date(doc.created_at).toLocaleDateString('ja-JP')}
                          </td>
                          <td className="py-3">
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 mr-3"
                            >
                              開く
                            </a>
                            <button
                              onClick={() => handleDocumentDelete(doc.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              削除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* スマホ・タブレット用カード表示 */}
                <div className="lg:hidden space-y-3">
                  {customer.documents?.map((doc) => (
                    <div
                      key={doc.id}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4"
                    >
                      {/* 上部: カテゴリ + タイトル */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs inline-block mb-1">
                            {getCategoryLabel(doc.category)}
                          </span>
                          <div className="font-medium text-sm sm:text-base truncate">
                            {doc.title}
                          </div>
                        </div>
                      </div>

                      {/* 中部: ファイル情報 */}
                      <div className="text-xs sm:text-sm text-gray-500 space-y-1 mb-3">
                        <div className="truncate">📄 {doc.filename}</div>
                        <div className="flex gap-3">
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>{new Date(doc.created_at).toLocaleDateString('ja-JP')}</span>
                        </div>
                      </div>

                      {/* 下部: 操作ボタン */}
                      <div className="flex gap-2 pt-2 border-t border-gray-100">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm hover:bg-blue-100 active:bg-blue-200 transition-colors"
                        >
                          開く
                        </a>
                        <button
                          onClick={() => handleDocumentDelete(doc.id)}
                          className="flex-1 text-center bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm hover:bg-red-100 active:bg-red-200 transition-colors"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 編集モーダル */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="顧客情報編集"
      >
        <CustomerForm
          initialData={customer}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* 書類追加モーダル */}
      <Modal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        title="書類を追加"
      >
        <DocumentUploadForm
          onSubmit={handleDocumentUpload}
          onCancel={() => setIsDocumentModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

// 書類アップロードフォーム
const DocumentUploadForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    category: 'other',
    title: '',
    description: '',
    file: null,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, file: e.target.files[0] }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.file) {
      alert('ファイルを選択してください')
      return
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          <option value="estimate">見積書</option>
          <option value="proposal">提案書</option>
          <option value="invoice">請求書</option>
          <option value="contract">契約書</option>
          <option value="web_data">Webサイトデータ</option>
          <option value="photo">写真</option>
          <option value="other">その他</option>
        </select>
      </div>

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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ファイル <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          説明
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
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
          アップロード
        </button>
      </div>
    </form>
  )
}

export default CustomerDetail