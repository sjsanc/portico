import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { useAppStore } from './store/appStore'
import { fetchFolders, fetchBookmarks, deleteBookmark, createFolder, moveBookmark } from './api'
import type { Bookmark } from './types'
import FoldersColumn from './components/FoldersColumn'
import BookmarksGrid from './components/BookmarksGrid'

export default function App() {
  const queryClient = useQueryClient()
  const [activeBookmarks, setActiveBookmarks] = useState<Bookmark[]>([])
  const {
    selectedFolderId,
    sortField,
    sortDirection,
    isModalOpen,
    newFolderName,
    selectedBookmarkIds,
    setSelectedFolderId,
    setSortField,
    setSortDirection,
    setIsModalOpen,
    setNewFolderName,
    toggleBookmarkSelection,
    clearBookmarkSelection,
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
      await deleteBookmark(id)
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Failed to delete bookmark')
    }
  }

  const handleCreateFolder = async () => {
    const name = newFolderName.trim()
    if (!name) return

    try {
      await createFolder(name)
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      setNewFolderName('')
      setIsModalOpen(false)
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Failed to create folder')
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string
    if (id.startsWith('bookmark-')) {
      const bookmarkId = parseInt(id.replace('bookmark-', ''), 10)
      const allBks = [...bookmarks, ...allBookmarks]

      // If the dragged bookmark is part of selection, drag all selected
      if (selectedBookmarkIds.has(bookmarkId)) {
        const selectedBookmarks = allBks.filter((b) => selectedBookmarkIds.has(b.id))
        setActiveBookmarks(selectedBookmarks)
      } else {
        // Otherwise just drag the single bookmark
        const bookmark = allBks.find((b) => b.id === bookmarkId)
        setActiveBookmarks(bookmark ? [bookmark] : [])
      }
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id.toString().startsWith('bookmark-') && over.id.toString().startsWith('folder-')) {
      const draggedBookmarkId = parseInt(active.id.toString().replace('bookmark-', ''), 10)
      const folderIdStr = over.id.toString().replace('folder-', '')
      const folderId = folderIdStr === 'unsorted' ? null : parseInt(folderIdStr, 10)

      // Get all bookmark IDs to move
      const bookmarkIdsToMove = selectedBookmarkIds.has(draggedBookmarkId)
        ? Array.from(selectedBookmarkIds)
        : [draggedBookmarkId]

      try {
        await Promise.all(bookmarkIdsToMove.map((id) => moveBookmark(id, folderId)))
        queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
        queryClient.invalidateQueries({ queryKey: ['folders'] })
        clearBookmarkSelection()
      } catch (err) {
        console.error(err instanceof Error ? err.message : 'Failed to move bookmark(s)')
      }
    }

    setActiveBookmarks([])
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <header className="sticky px-6 top-0 z-10 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-md border-b border-white/10 h-16">
          <div className="container mx-auto flex items-center h-full">
            <h1 className="text-4xl font-bold text-white">Portico</h1>
          </div>
        </header>

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
            selectedBookmarkIds={selectedBookmarkIds}
            isDragging={activeBookmarks.length > 0}
            loading={loading}
            sortField={sortField}
            sortDirection={sortDirection}
            onSortFieldChange={setSortField}
            onSortDirectionChange={setSortDirection}
            onDeleteBookmark={handleDeleteBookmark}
            onSelectBookmark={toggleBookmarkSelection}
          />
        </div>

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
      </div>
      <DragOverlay>
        {activeBookmarks.length > 0 && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-xl blur-xl opacity-100" />
            <div className="relative flex flex-col p-4 bg-white/10 backdrop-blur-md rounded-xl border border-cyan-400 shadow-lg shadow-cyan-400/20">
              {activeBookmarks.length > 1 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg z-10">
                  {activeBookmarks.length}
                </div>
              )}
              <div className="flex items-start gap-3 h-14">
                <img
                  src={activeBookmarks[0].favicon_url}
                  alt={activeBookmarks[0].name}
                  className="h-full aspect-square rounded-lg object-cover flex-shrink-0 shadow-lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm line-clamp-1">
                    {activeBookmarks.length > 1
                      ? `${activeBookmarks.length} bookmarks`
                      : activeBookmarks[0].name}
                  </h3>
                  <p className="text-slate-300 text-xs line-clamp-1 break-all">
                    {activeBookmarks.length > 1
                      ? 'Moving multiple items'
                      : activeBookmarks[0].url}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
