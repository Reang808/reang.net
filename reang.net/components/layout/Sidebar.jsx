import { useState, useEffect } from "react"
import { NavLink, useLocation } from "react-router-dom"

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const location = useLocation()

    const menuItems = [
        { id: 1, name: '/', label: 'ダッシュボード', icon: '🏠' }, 
        { id: 2, name: '/tasks', label: 'タスク', icon: '✅' },
        { id: 3, name: '/customers', label: '顧客管理', icon: '👥' },
        { id: 4, name: '/schedule', label: 'スケジュール', icon: '📅' }
    ]

    // ページ遷移時にメニューを閉じる
    useEffect(() => {
        setIsOpen(false)
    }, [location.pathname])

    // メニューが開いている時はスクロールを無効化
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    return (
        <>
            {/* ハンバーガーボタン（スマホ・タブレット） */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-800 text-white shadow-lg hover:bg-gray-700 transition-colors"
                aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
                aria-expanded={isOpen}
            >
                <div className="w-6 h-5 relative flex flex-col justify-between">
                    <span 
                        className={`block h-0.5 w-6 bg-white rounded transition-all duration-300 ${
                            isOpen ? 'rotate-45 translate-y-2' : ''
                        }`}
                    />
                    <span 
                        className={`block h-0.5 w-6 bg-white rounded transition-all duration-300 ${
                            isOpen ? 'opacity-0' : ''
                        }`}
                    />
                    <span 
                        className={`block h-0.5 w-6 bg-white rounded transition-all duration-300 ${
                            isOpen ? '-rotate-45 -translate-y-2' : ''
                        }`}
                    />
                </div>
            </button>

            {/* オーバーレイ（スマホ・タブレット） */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* サイドバー */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-40
                    w-64 bg-gray-800 text-white min-h-screen p-4
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0
                `}
            >
                <div className="text-xl font-bold mb-8 px-2 pt-12 lg:pt-0">
                    業務管理アプリ
                </div>
                <nav className="space-y-1">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.id}
                            to={item.name}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-3 lg:py-2 rounded-lg transition-colors ${
                                    isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'hover:bg-gray-700 active:bg-gray-600'
                                }`
                            }
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    )
}

export default Sidebar