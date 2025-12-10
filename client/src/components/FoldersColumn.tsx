import FolderCard from './FolderCard'

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

interface FoldersColumnProps {
  folders: Folder[]
  allBookmarks: Bookmark[]
  selectedFolderId: number | null | 'all'
  loading: boolean
  onFolderSelect: (folderId: number | null | 'all') => void
  onCreateFolder: () => void
}

export default function FoldersColumn({
  folders,
  allBookmarks,
  selectedFolderId,
  loading,
  onFolderSelect,
  onCreateFolder,
}: FoldersColumnProps) {
  const unsortedBookmarks = allBookmarks.filter(b => b.folder_id === null)

  return (
    <div className="flex flex-col w-90 flex-shrink-0 sticky">
      <h2 className="text-2xl font-bold text-white flex items-center h-20">Folders</h2>

      {loading && folders.length === 0 ? (
        <div className="text-slate-400">Loading folders...</div>
      ) : folders.length === 0 ? (
        <button
          onClick={onCreateFolder}
          className="relative group w-full"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-teal-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex flex-col items-center justify-center p-8 bg-white/10 backdrop-blur-md rounded-xl border-2 border-dashed border-white/30 hover:border-white/50 transition-all duration-300 min-h-32 cursor-pointer group-hover:bg-white/15">
            <div className="text-3xl text-white/60 group-hover:text-white transition-colors mb-2">+</div>
            <p className="text-white/60 group-hover:text-white transition-colors font-semibold">Create folder</p>
          </div>
        </button>
      ) : (
        <div className="flex flex-col gap-4">
          {/* All Bookmarks folder */}
          <FolderCard
            name="All Bookmarks"
            bookmarks={allBookmarks}
            isSelected={selectedFolderId === 'all'}
            onClick={() => onFolderSelect('all')}
          />

          {/* Unsorted folder */}
          <FolderCard
            name="Unsorted"
            bookmarks={unsortedBookmarks}
            isSelected={selectedFolderId === null}
            onClick={() => onFolderSelect(null)}
          />

          {/* Regular folders */}
          {folders.map((folder) => (
            <FolderCard
              key={folder.id}
              name={folder.name}
              bookmarks={folder.bookmarks || []}
              isSelected={selectedFolderId === folder.id}
              onClick={() => onFolderSelect(folder.id)}
            />
          ))}

          {/* New Folder button */}
          <button
            onClick={onCreateFolder}
            className="relative group w-full mt-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-teal-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center justify-center gap-2 p-3 bg-slate-900 cursor-pointer backdrop-blur-md rounded-xl border-2 border-dashed border-white/20 hover:border-white/40 transition-all duration-300">
              <div className="text-white font-semibold text-lg">+</div>
              <p className="text-slate-400">New folder</p>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
