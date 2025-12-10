import BookmarkCard from './BookmarkCard'

interface Bookmark {
  id: number
  url: string
  name: string
  favicon_url: string
  bookmarked_at: string
  folder_id: number | null
}

interface Folder {
  id: number
  name: string
  created_at: string
  bookmarks?: Bookmark[]
}

interface BookmarksGridProps {
  bookmarks: Bookmark[]
  folders: Folder[]
  selectedFolderId: number | null | 'all'
  loading: boolean
  sortField: 'bookmarked_at' | 'name'
  sortDirection: 'asc' | 'desc'
  onSortFieldChange: (field: 'bookmarked_at' | 'name') => void
  onSortDirectionChange: (direction: 'asc' | 'desc') => void
  onDeleteBookmark: (id: number) => void
}

export default function BookmarksGrid({
  bookmarks,
  folders,
  selectedFolderId,
  loading,
  sortField,
  sortDirection,
  onSortFieldChange,
  onSortDirectionChange,
  onDeleteBookmark,
}: BookmarksGridProps) {
  const getFolderName = () => {
    if (selectedFolderId === 'all') return 'All Bookmarks'
    if (selectedFolderId === null) return 'Unsorted'
    return folders.find(f => f.id === selectedFolderId)?.name ?? 'Folder'
  }

  const getEmptyMessage = () => {
    if (selectedFolderId === 'all') return 'No bookmarks yet'
    if (selectedFolderId) return 'No bookmarks in this folder'
    return 'No unsorted bookmarks yet'
  }

  return (
    <main className="flex-1">
      <div className="max-w-7xl">
        <div className="flex items-center justify-between h-20">
          <h2 className="text-2xl font-bold text-white">
            {getFolderName()}
          </h2>
          <div className="flex items-center gap-3">
            <select
              value={sortField}
              onChange={(e) => onSortFieldChange(e.target.value as 'bookmarked_at' | 'name')}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all cursor-pointer"
            >
              <option value="bookmarked_at" className="bg-slate-800">Date Added</option>
              <option value="name" className="bg-slate-800">Title</option>
            </select>
            <select
              value={sortDirection}
              onChange={(e) => onSortDirectionChange(e.target.value as 'asc' | 'desc')}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all cursor-pointer"
            >
              <option value="desc" className="bg-slate-800">Descending</option>
              <option value="asc" className="bg-slate-800">Ascending</option>
            </select>
          </div>
        </div>

        {loading && bookmarks.length === 0 && (
          <div className="text-slate-400">Loading bookmarks...</div>
        )}

        {!loading && bookmarks.length === 0 && (
          <div className="text-slate-400">{getEmptyMessage()}</div>
        )}

        {!loading && bookmarks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {bookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onDelete={onDeleteBookmark}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
