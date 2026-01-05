import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, logout as apiLogout, checkAuth, getCurrentUser } from '../api/auth'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // 初期化時に認証状態を確認
  useEffect(() => {
    const initAuth = async () => {
      try {
        const result = await checkAuth()
        if (result.is_authenticated) {
          setUser(result.user)
          setIsAuthenticated(true)
        }
      } catch (err) {
        console.error('認証確認エラー:', err)
      } finally {
        setLoading(false)
      }
    }
    
    initAuth()
  }, [])

  // ログイン
  const login = async (username, password) => {
    const data = await apiLogin(username, password)
    setUser(data.user)
    setIsAuthenticated(true)
    return data
  }

  // ログアウト
  const logout = async () => {
    await apiLogout()
    setUser(null)
    setIsAuthenticated(false)
  }

  // ユーザー情報を更新（画面から呼び出し用）
  const refreshUser = async () => {
    try {
      const userData = await getCurrentUser()
      setUser(userData)
    } catch (err) {
      console.error('ユーザー情報更新エラー:', err)
    }
  }

  // ユーザー情報をセット（更新後に使用）
  const updateUserState = (userData) => {
    setUser(userData)
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
    updateUserState,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// カスタムフック
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
