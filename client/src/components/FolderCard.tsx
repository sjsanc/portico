interface Bookmark {
  id: number
  url: string
  name: string
  favicon_url: string
  bookmarked_at: string
  folder_id: number | null
}

interface FolderCardProps {
  name: string
  bookmarks: Bookmark[]
  isSelected: boolean
  onClick: () => void
}

export default function FolderCard({ name, bookmarks, isSelected, onClick }: FolderCardProps) {
  return (
    <button
      onClick={onClick}
      className="relative group text-left w-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-teal-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className={`cursor-pointer relative flex items-center gap-3 p-4 bg-white/10 backdrop-blur-md rounded-xl border transition-all duration-300 ${
        isSelected ? 'border-cyan-400/60 bg-white/20' : 'border-white/20 hover:border-white/40'
      }`}>
        <div className="w-14 h-14 rounded-lg bg-white/5 flex-shrink-0">
          <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-1">
            {bookmarks.slice(0, 4).map((bookmark, idx) => (
              <div key={idx} className="w-full h-full">
                {bookmark?.favicon_url && (
                  <img
                    src={bookmark.favicon_url}
                    alt="favicon"
                    className="w-full h-full rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base truncate">{name}</h3>
          <p className="text-slate-300 text-xs">{bookmarks.length} bookmarks</p>
        </div>
      </div>
    </button>
  )
}
