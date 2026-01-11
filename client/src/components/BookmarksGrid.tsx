import { useCallback } from 'react'
import { motion } from 'framer-motion'
import type { Bookmark, Folder, FolderId } from '../types'
import BookmarkCard from './BookmarkCard'

interface BookmarksGridProps {
  bookmarks: Bookmark[]
  folders: Folder[]
  selectedFolderId: FolderId
  selectedBookmarkIds: Set<number>
  highlightedBookmarkId: [number, number] | null
  isDragging: boolean
  loading: boolean
  currentPage: number
  onDeleteBookmark: (id: number) => void
  onSelectBookmark: (id: number) => void
}

const COLUMNS = 4
const ROWS = 7
const ITEMS_PER_PAGE = COLUMNS * ROWS // 28 bookmarks per page

export default function BookmarksGrid({
  bookmarks,
  folders,
  selectedFolderId,
  selectedBookmarkIds,
  highlightedBookmarkId,
  isDragging,
  loading,
  currentPage,
  onDeleteBookmark,
  onSelectBookmark,
}: BookmarksGridProps) {

  const getFolderName = useCallback(() => {
    if (selectedFolderId === 'all') return 'All Bookmarks'
    if (selectedFolderId === null) return 'Unsorted'
    return folders.find((f) => f.id === selectedFolderId)?.name ?? 'Folder'
  }, [selectedFolderId, folders])

  const getEmptyMessage = useCallback(() => {
    if (selectedFolderId === 'all') return 'No bookmarks yet'
    if (selectedFolderId) return 'No bookmarks in this folder'
    return 'No unsorted bookmarks yet'
  }, [selectedFolderId])

  const selectionCount = selectedBookmarkIds.size

  // Calculate pagination
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedBookmarks = bookmarks.slice(startIndex, endIndex)

  return (
    <main className="flex-1">
      <div className="w-full">
        {loading && bookmarks.length === 0 && (
          <div className="grid grid-cols-4 gap-2">
            {[...Array(ITEMS_PER_PAGE)].map((_, index) => (
              <div key={index} className="card-blue opacity-0">
                <div className="h-14" />
              </div>
            ))}
          </div>
        )}

        {!loading && bookmarks.length === 0 && (
          <motion.div
            className="text-slate-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {getEmptyMessage()}
          </motion.div>
        )}

        {bookmarks.length > 0 && (
          <div className="flex flex-col">
            <div className="grid grid-cols-4 gap-2 mb-2">
              {paginatedBookmarks.map((bookmark, index) => {
                const row = Math.floor(index / COLUMNS)
                const col = index % COLUMNS
                const isHighlighted = highlightedBookmarkId !== null &&
                  highlightedBookmarkId[0] === row &&
                  highlightedBookmarkId[1] === col
                return (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    isSelected={selectedBookmarkIds.has(bookmark.id)}
                    isHighlighted={isHighlighted}
                    selectionCount={selectionCount}
                    isDraggingAny={isDragging}
                    onDelete={onDeleteBookmark}
                    onSelect={onSelectBookmark}
                    index={index}
                  />
                )
              })}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
