import { useState } from 'react'

const CustomerForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    company_name: initialData?.company_name || '',
    department: initialData?.department || '',
    position: initialData?.position || '',
    name: initialData?.name || '',
    name_kana: initialData?.name_kana || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    mobile: initialData?.mobile || '',
    fax: initialData?.fax || '',
    postal_code: initialData?.postal_code || '',
    address: initialData?.address || '',
    website: initialData?.website || '',
    notes: initialData?.notes || '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // websiteのURL形式を整える
    let processedData = { ...formData }
    if (processedData.website) {
      let url = processedData.website.trim()
      
      // https:/ や http:/ （スラッシュ1つ）を修正
      url = url.replace(/^https?:\/(?!\/)/, (match) => match + '/')
      
      // スキームがない場合、https://を追加
      if (!url.match(/^https?:\/\//)) {
        url = 'https://' + url
      }
      
      processedData.website = url
    }
    
    onSubmit(processedData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto pr-2">
      {/* 会社情報 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          会社名
        </label>
        <input
          type="text"
          name="company_name"
          value={formData.company_name}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            部署
          </label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            役職
          </label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 氏名 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            氏名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            氏名（カナ）
          </label>
          <input
            type="text"
            name="name_kana"
            value={formData.name_kana}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 連絡先 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          メールアドレス
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Webサイト */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Webサイト
        </label>
        <input
          type="url"
          name="website"
          value={formData.website}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            電話番号
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            携帯番号
          </label>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* FAX */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          FAX
        </label>
        <input
          type="tel"
          name="fax"
          value={formData.fax}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 住所 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          郵便番号
        </label>
        <input
          type="text"
          name="postal_code"
          value={formData.postal_code}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="000-0000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          住所
        </label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* メモ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          メモ
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* ボタン */}
      <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {initialData ? '更新' : '登録'}
        </button>
      </div>
    </form>
  )
}

export default CustomerForm