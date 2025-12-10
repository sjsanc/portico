import { useQuery, useQueryClient } from '@tanstack/react-query'
import FoldersColumn from './components/FoldersColumn'
import BookmarksGrid from './components/BookmarksGrid'
import { useAppStore } from './store/appStore'

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

const fetchFolders = async (): Promise<Folder[]> => {
  const response = await fetch('http://localhost:8080/folders')
  if (!response.ok) {
    throw new Error(`Failed to fetch folders: ${response.statusText}`)
  }
  const data = await response.json()
  return data || []
}

const fetchBookmarks = async (
  folderId: number | null | 'all',
  sortField: 'bookmarked_at' | 'name',
  sortDirection: 'asc' | 'desc'
): Promise<Bookmark[]> => {
  const url = new URL('http://localhost:8080/bookmarks')

  if (folderId !== 'all') {
    if (folderId === null) {
      url.searchParams.append('unsorted', 'true')
    } else {
      url.searchParams.append('folder_id', folderId.toString())
    }
  }

  url.searchParams.append('sortBy', sortField)
  url.searchParams.append('sortOrder', sortDirection)

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(`Failed to fetch bookmarks: ${response.statusText}`)
  }
  const data = await response.json()
  return data || []
}

export default function App() {
  const queryClient = useQueryClient()
  const {
    selectedFolderId,
    sortField,
    sortDirection,
    isModalOpen,
    newFolderName,
    setSelectedFolderId,
    setSortField,
    setSortDirection,
    setIsModalOpen,
    setNewFolderName,
  } = useAppStore()

  const { data: folders = [], isLoading: foldersLoading } = useQuery({
    queryKey: ['folders'],
    queryFn: fetchFolders,
  })

  const { data: bookmarks = [], isLoading: bookmarksLoading } = useQuery({
    queryKey: ['bookmarks', selectedFolderId, sortField, sortDirection],
    queryFn: () => fetchBookmarks(selectedFolderId, sortField, sortDirection),
  })

  const { data: allBookmarks = [] } = useQuery({
    queryKey: ['bookmarks', 'all', sortField, sortDirection],
    queryFn: () => fetchBookmarks('all', sortField, sortDirection),
  })

  const loading = foldersLoading || bookmarksLoading

  const handleDeleteBookmark = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8080/bookmarks/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error(`Failed to delete bookmark: ${response.statusText}`)
      }
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Failed to delete bookmark')
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    try {
      const response = await fetch('http://localhost:8080/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newFolderName }),
      })
      if (!response.ok) {
        throw new Error(`Failed to create folder: ${response.statusText}`)
      }
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      setNewFolderName('')
      setIsModalOpen(false)
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Failed to create folder')
    }
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="sticky px-6 top-0 z-10 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-md border-b border-white/10 h-16">
        <div className='container mx-auto flex items-center h-full'>
          <h1 className="text-4xl font-bold text-white">Portico</h1>
        </div>
      </div>

      {/* Main Layout: Folders Left | Bookmarks Right */}
      <div className="flex gap-6 container mx-auto">
        <FoldersColumn
          folders={folders}
          allBookmarks={allBookmarks}
          selectedFolderId={selectedFolderId}
          loading={loading}
          onFolderSelect={setSelectedFolderId}
          onCreateFolder={() => setIsModalOpen(true)}
        />

        <BookmarksGrid
          bookmarks={bookmarks}
          folders={folders}
          selectedFolderId={selectedFolderId}
          loading={loading}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortFieldChange={setSortField}
          onSortDirectionChange={setSortDirection}
          onDeleteBookmark={handleDeleteBookmark}
        />
      </div>
    </div>

    {/* Create Folder Modal */}
    {isModalOpen && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-xl border border-white/20 p-6 w-full max-w-md">
          <h2 className="text-xl font-bold text-white mb-4">Create New Folder</h2>
          <input
            type="text"
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            className="w-full px-4 py-2 mb-6 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
          />
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setIsModalOpen(false)
                setNewFolderName('')
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 font-semibold border border-white/20 hover:border-white/40"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-semibold"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
