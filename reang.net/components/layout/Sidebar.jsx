import { NavLink } from "react-router-dom"

const Sidebar = () => {
    const menuItems = [
        { id: 1, name: '/', label: 'ダッシュボード', icon: '🏠' }, 
        { id: 2, name: '/tasks', label: 'タスク', icon: '✅' },
        { id: 3, name: '/customers', label: '顧客管理', icon: '👥' },
        { id: 4, name: '/schedule', label: 'スケジュール', icon: '📅' }
    ]
    return (
        <div>
            <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
                <div className="text-xl font-bold mb-8 px-2">業務管理アプリ</div>
                <nav className="space-y-1">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.id}
                            to={item.name}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                    isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'hover:bg-gray-700'
                                }`
                            }
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </div>
    )
}


export default Sidebar