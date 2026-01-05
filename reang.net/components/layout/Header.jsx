import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../src/contexts/AuthContext'

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    setIsMenuOpen(false)
    navigate('/login')
  }

  const handleSettings = () => {
    setIsMenuOpen(false)
    navigate('/settings')
  }

  // ユーザー名表示
  const displayName = user?.full_name || user?.username || 'ユーザー'

  if (!isAuthenticated) {
    return (
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="w-10 lg:hidden"></div>
          <div className="text-gray-500 text-sm">ゲスト</div>
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ログイン
          </Link>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
      <div className="flex justify-between items-center">
        {/* 左側: スマホ時のハンバーガー用スペース */}
        <div className="w-10 lg:hidden"></div>

        {/* 中央: ユーザー名 */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
            {displayName.charAt(0)}
          </div>
          <span className="text-gray-700 font-medium text-sm sm:text-base">
            {displayName}
          </span>
        </div>

        {/* 右側: メニュー */}
        <div className="relative" ref={menuRef}>
          {/* PC用: ボタン並び */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={handleSettings}
              className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm"
            >
              <span>⚙️</span>
              <span>設定</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
            >
              <span>🚪</span>
              <span>ログアウト</span>
            </button>
          </div>

          {/* スマホ用: ドロップダウンメニュー */}
          <div className="sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            {/* ドロップダウン */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={handleSettings}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors text-sm text-left"
                >
                  <span>⚙️</span>
                  <span>設定</span>
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-sm text-left"
                >
                  <span>🚪</span>
                  <span>ログアウト</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header