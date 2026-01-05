const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* 背景オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>
      
      {/* モーダル本体 */}
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-lg rounded-t-2xl shadow-xl max-h-[90vh] sm:max-h-[85vh] flex flex-col">
        {/* ドラッグハンドル（スマホ用） */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>
        
        {/* ヘッダー */}
        <div className="flex justify-between items-center px-4 py-3 sm:p-4 border-b flex-shrink-0">
          <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 active:text-gray-800 text-xl p-1 -mr-1"
          >
            ✕
          </button>
        </div>
        
        {/* コンテンツ */}
        <div className="p-4 overflow-y-auto overflow-x-hidden overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal