import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../src/contexts/AuthContext'
import { updateUser, changePassword } from '../src/api/auth'

const Settings = () => {
  const { user, updateUserState } = useAuth()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState('profile')
  
  // プロフィールフォーム
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department: '',
    position: '',
    phone: '',
  })
  
  // パスワードフォーム
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirm: '',
  })
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        department: user.department || '',
        position: user.position || '',
        phone: user.phone || '',
      })
    }
  }, [user])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
    setMessage({ type: '', text: '' })
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
    setMessage({ type: '', text: '' })
  }

  // プロフィール更新
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })
    
    try {
      const data = await updateUser(profileData)
      updateUserState(data.user)
      setMessage({ type: 'success', text: 'プロフィールを更新しました' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  // パスワード変更
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    
    if (passwordData.new_password !== passwordData.new_password_confirm) {
      setMessage({ type: 'error', text: '新しいパスワードが一致しません' })
      return
    }
    
    if (passwordData.new_password.length < 8) {
      setMessage({ type: 'error', text: 'パスワードは8文字以上で入力してください' })
      return
    }
    
    setLoading(true)
    
    try {
      await changePassword(passwordData.current_password, passwordData.new_password)
      setMessage({ type: 'success', text: 'パスワードを変更しました' })
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirm: '',
      })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-xl font-semibold">⚙️ 設定</h2>

      <div className="bg-white rounded-lg shadow">
        {/* タブ */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-colors ${
              activeTab === 'profile'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            プロフィール
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-colors ${
              activeTab === 'password'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            パスワード変更
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {/* メッセージ */}
          {message.text && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-600'
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}>
              {message.text}
            </div>
          )}

          {/* プロフィールタブ */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    姓
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={profileData.last_name}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    名
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={profileData.first_name}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    部署
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={profileData.department}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例: 営業部"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    役職
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={profileData.position}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例: 主任"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  電話番号
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 090-1234-5678"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {loading ? '保存中...' : '保存する'}
                </button>
              </div>
            </form>
          )}

          {/* パスワード変更タブ */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  現在のパスワード
                </label>
                <input
                  type="password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  新しいパスワード
                </label>
                <input
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="8文字以上"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  新しいパスワード（確認）
                </label>
                <input
                  type="password"
                  name="new_password_confirm"
                  value={passwordData.new_password_confirm}
                  onChange={handlePasswordChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="もう一度入力"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {loading ? '変更中...' : 'パスワードを変更'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* アカウント情報 */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 className="font-semibold mb-4">アカウント情報</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex flex-col sm:flex-row">
            <dt className="text-gray-500 sm:w-32">ユーザー名</dt>
            <dd>{user?.username}</dd>
          </div>
          <div className="flex flex-col sm:flex-row">
            <dt className="text-gray-500 sm:w-32">登録日</dt>
            <dd>{user?.date_joined ? new Date(user.date_joined).toLocaleDateString('ja-JP') : '-'}</dd>
          </div>
          <div className="flex flex-col sm:flex-row">
            <dt className="text-gray-500 sm:w-32">最終ログイン</dt>
            <dd>{user?.last_login ? new Date(user.last_login).toLocaleString('ja-JP') : '-'}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

export default Settings