const Header = () => {
    const tabs = ['概要', '一覧', '新規作成'];
    return (
        <header className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex gap-4">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        className="px-4 py-2 text-gray-600 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 transition-colors">
                        {tab}
                        </button>
                ))}
            </div>
        </header>
    )
}

export default Header