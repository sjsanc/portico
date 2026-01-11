import { useState, useRef, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { useAppStore } from './store/appStore'
import { fetchFolders, fetchBookmarks, deleteBookmark, createFolder, moveBookmark } from './api'
import type { Bookmark } from './types'
import FoldersColumn from './components/FoldersColumn'
import BookmarksGrid from './components/BookmarksGrid'
import OmniSearch, { type OmniSearchHandle } from './components/OmniSearch'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

export default function App() {
  const queryClient = useQueryClient()
  const [activeBookmarks, setActiveBookmarks] = useState<Bookmark[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchMatches, setSearchMatches] = useState<Bookmark[]>([])
  const [highlightedBookmarkId, setHighlightedBookmarkId] = useState<[number, number] | null>(null)
  const omniSearchRef = useRef<OmniSearchHandle>(null)
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

  useEffect(() => {
    omniSearchRef.current?.focus()
  }, [])

  // Reset to page 1 when bookmarks or folder changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedFolderId, bookmarks.length])

  // Grid navigation with arrow keys
  const COLUMNS = 4
  const ROWS = 7
  const ITEMS_PER_PAGE = COLUMNS * ROWS

  // Helper to get bookmark at [row, col] position
  const getBookmarkAtPosition = (row: number, col: number): Bookmark | null => {
    const displayedBookmarks = searchMatches.length > 0 ? searchMatches : bookmarks
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedBookmarks = displayedBookmarks.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    const index = row * COLUMNS + col
    return paginatedBookmarks[index] ?? null
  }

  // Calculate max row for current page
  const getMaxRow = (): number => {
    const displayedBookmarks = searchMatches.length > 0 ? searchMatches : bookmarks
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedBookmarks = displayedBookmarks.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    return Math.ceil(paginatedBookmarks.length / COLUMNS) - 1
  }

  // Get max column for a given row
  const getMaxColForRow = (row: number): number => {
    const displayedBookmarks = searchMatches.length > 0 ? searchMatches : bookmarks
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedBookmarks = displayedBookmarks.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    const itemsInRow = Math.min(COLUMNS, paginatedBookmarks.length - row * COLUMNS)
    return Math.max(0, itemsInRow - 1)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle arrow keys when no search is active
      if (searchMatches.length > 0) return

      // Don't interfere if user is typing in an input
      if (document.activeElement?.tagName === 'INPUT') return

      const displayedBookmarks = bookmarks
      if (displayedBookmarks.length === 0) return

      const maxRow = getMaxRow()
      if (maxRow < 0) return

      let [row, col] = highlightedBookmarkId ?? [-1, -1]

      // If nothing is highlighted, initialize based on direction
      if (highlightedBookmarkId === null) {
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return
        e.preventDefault()
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          setHighlightedBookmarkId([0, 0])
        } else {
          setHighlightedBookmarkId([maxRow, getMaxColForRow(maxRow)])
        }
        return
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          if (col > 0) {
            setHighlightedBookmarkId([row, col - 1])
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          if (col < getMaxColForRow(row)) {
            setHighlightedBookmarkId([row, col + 1])
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          if (row > 0) {
            const newCol = Math.min(col, getMaxColForRow(row - 1))
            setHighlightedBookmarkId([row - 1, newCol])
          }
          break
        case 'ArrowDown':
          e.preventDefault()
          if (row < maxRow) {
            const newCol = Math.min(col, getMaxColForRow(row + 1))
            setHighlightedBookmarkId([row + 1, newCol])
          }
          break
        case 'Enter':
          e.preventDefault()
          const bookmark = getBookmarkAtPosition(row, col)
          if (bookmark) {
            window.location.href = bookmark.url
          }
          return
        case 'Escape':
          e.preventDefault()
          setHighlightedBookmarkId(null)
          return
        default:
          return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [bookmarks, searchMatches, highlightedBookmarkId, currentPage])

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
      {/* Full-screen blurred background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/assets/wallhaven-dgy9po.png)',
          filter: 'blur(14px) brightness(0.5)',
          transform: 'scale(1.1)',
          zIndex: -1
        }}
      />
      {/* Dark overlay to make background unintrusive */}
      <div
        className="fixed inset-0"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: -1
        }}
      />
      <div className="min-h-screen flex flex-col items-center justify-center relative">
        <div className="w-[1750px] flex flex-col gap-2">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <OmniSearch
              ref={omniSearchRef}
              bookmarks={allBookmarks}
              onQueryChange={(query, matches) => {
                setSearchMatches(matches)
                setCurrentPage(1)
              }}
              onMatchChange={() => setHighlightedBookmarkId(null)}
            />

            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="input-base text-sm cursor-pointer"
            >
              <option value="bookmarked_at" className="bg-slate-800">Date</option>
              <option value="name" className="bg-slate-800">Title</option>
            </select>
            <select
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value as any)}
              className="input-base text-sm cursor-pointer"
            >
              <option value="desc" className="bg-slate-800">↓ Desc</option>
              <option value="asc" className="bg-slate-800">↑ Asc</option>
            </select>

            {(() => {
              const displayedBookmarks = searchMatches.length > 0 ? searchMatches : bookmarks
              const totalPages = Math.max(1, Math.ceil(displayedBookmarks.length / 28));
              return (
                <>
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="input-base text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-400/20 hover:border-orange-500 transition-all duration-200"
                    title="Go to first page"
                  >
                    <ChevronsLeft />
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="input-base text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-400/20 hover:border-orange-500 transition-all duration-200"
                    title="Previous page"
                  >
                    <ChevronLeft />
                  </button>
                  <span className="input-base text-sm font-semibold whitespace-nowrap flex items-center">
                    {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="input-base text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-400/20 hover:border-orange-500 transition-all duration-200"
                    title="Next page"
                  >
                    <ChevronRight />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="input-base text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-400/20 hover:border-orange-500 transition-all duration-200"
                    title="Go to last page"
                  >
                    <ChevronsRight />
                  </button>
                </>
              );
            })()}
          </motion.div>

          <motion.div
            className="flex gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <FoldersColumn
              folders={folders}
              allBookmarks={allBookmarks}
              selectedFolderId={selectedFolderId}
              loading={loading}
              onFolderSelect={setSelectedFolderId}
              onCreateFolder={() => setIsModalOpen(true)}
            />

            <div className="relative">
              <div
                className="w-px h-full bg-gradient-to-b from-transparent via-white/20 to-transparent backdrop-blur-sm"
                style={{
                  maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)'
                }}
              />
            </div>

            <BookmarksGrid
              bookmarks={searchMatches.length > 0 ? searchMatches : bookmarks}
              folders={folders}
              selectedFolderId={selectedFolderId}
              selectedBookmarkIds={selectedBookmarkIds}
              highlightedBookmarkId={highlightedBookmarkId}
              isDragging={activeBookmarks.length > 0}
              loading={loading}
              currentPage={currentPage}
              onDeleteBookmark={handleDeleteBookmark}
              onSelectBookmark={toggleBookmarkSelection}
            />
          </motion.div>
        </div>

        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-sky-900/40 backdrop-blur-xl rounded-xl border border-white/20 p-6 w-full max-w-md"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h2 className="text-xl font-bold text-white mb-4">Create New Folder</h2>
              <input
                type="text"
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                className="w-full input-base mb-6"
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setNewFolderName('')
                  }}
                  className="btn-glass"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="btn-primary"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
      <DragOverlay>
        {activeBookmarks.length > 0 && (
          <div className="relative">
            <div className="card-glow opacity-100" />
            <div className="card-base bg-sky-400/15 border-orange-500 shadow-lg shadow-orange-500/20 flex flex-col">
              {activeBookmarks.length > 1 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg z-10">
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
