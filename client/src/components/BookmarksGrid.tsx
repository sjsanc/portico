import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { Grid, AutoSizer } from 'react-virtualized'
import type { GridCellProps } from 'react-virtualized'
import type { Bookmark, Folder, FolderId, SortField, SortDirection } from '../types'
import BookmarkCard from './BookmarkCard'

interface BookmarksGridProps {
  bookmarks: Bookmark[]
  folders: Folder[]
  selectedFolderId: FolderId
  selectedBookmarkIds: Set<number>
  isDragging: boolean
  loading: boolean
  sortField: SortField
  sortDirection: SortDirection
  onSortFieldChange: (field: SortField) => void
  onSortDirectionChange: (direction: SortDirection) => void
  onDeleteBookmark: (id: number) => void
  onSelectBookmark: (id: number) => void
}

const GAP = 16 // gap-4 in Tailwind
const ROW_HEIGHT = 104 // Card height + gap

function useColumnCount() {
  const [columns, setColumns] = useState(1)

  useEffect(() => {
    function updateColumns() {
      const width = window.innerWidth
      if (width >= 1280) setColumns(3)      // xl
      else if (width >= 1024) setColumns(2) // lg
      else if (width >= 640) setColumns(2)  // sm
      else setColumns(1)
    }

    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [])

  return columns
}

export default function BookmarksGrid({
  bookmarks,
  folders,
  selectedFolderId,
  selectedBookmarkIds,
  isDragging,
  loading,
  sortField,
  sortDirection,
  onSortFieldChange,
  onSortDirectionChange,
  onDeleteBookmark,
  onSelectBookmark,
}: BookmarksGridProps) {
  const columnCount = useColumnCount()
  const rowCount = useMemo(() => Math.ceil(bookmarks.length / columnCount), [bookmarks.length, columnCount])
  const gridRef = useRef<Grid>(null)
  const [isAtTop, setIsAtTop] = useState(true)
  const [isAtBottom, setIsAtBottom] = useState(false)

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

  const handleScroll = useCallback(({ scrollTop, scrollHeight, clientHeight }: { scrollTop: number; scrollHeight: number; clientHeight: number }) => {
    setIsAtTop(scrollTop === 0)
    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 1)
  }, [])

  const selectionCount = selectedBookmarkIds.size

  const cellRenderer = useCallback(({ columnIndex, rowIndex, key, style }: GridCellProps) => {
    const index = rowIndex * columnCount + columnIndex
    if (index >= bookmarks.length) return null

    const bookmark = bookmarks[index]

    // Apply gap spacing via padding
    const cellStyle: React.CSSProperties = {
      ...style,
      paddingRight: columnIndex < columnCount - 1 ? GAP : 0,
      paddingBottom: GAP,
    }

    return (
      <div key={key} style={cellStyle}>
        <BookmarkCard
          bookmark={bookmark}
          isSelected={selectedBookmarkIds.has(bookmark.id)}
          selectionCount={selectionCount}
          isDraggingAny={isDragging}
          onDelete={onDeleteBookmark}
          onSelect={onSelectBookmark}
        />
      </div>
    )
  }, [bookmarks, columnCount, isDragging, onDeleteBookmark, onSelectBookmark, selectedBookmarkIds, selectionCount])

  const getMaskImage = useCallback(() => {
    if (isAtTop && isAtBottom) {
      return 'none'
    } else if (isAtTop) {
      return 'linear-gradient(to bottom, black calc(100% - 40px), transparent)'
    } else if (isAtBottom) {
      return 'linear-gradient(to bottom, transparent, black 40px)'
    } else {
      return 'linear-gradient(to bottom, transparent, black 40px, black calc(100% - 40px), transparent)'
    }
  }, [isAtTop, isAtBottom])

  return (
    <main className="flex-1">
      <div className="max-w-7xl">
        <div className="flex items-center justify-between h-20">
          <h2 className="text-2xl font-bold text-white">{getFolderName()}</h2>
          <div className="flex items-center gap-3">
            <select
              value={sortField}
              onChange={(e) => onSortFieldChange(e.target.value as SortField)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all cursor-pointer"
            >
              <option value="bookmarked_at" className="bg-slate-800">Date Added</option>
              <option value="name" className="bg-slate-800">Title</option>
            </select>
            <select
              value={sortDirection}
              onChange={(e) => onSortDirectionChange(e.target.value as SortDirection)}
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

        {bookmarks.length > 0 && (
          <div
            className="h-[calc(100vh-160px)]"
            style={{
              maskImage: getMaskImage(),
              WebkitMaskImage: getMaskImage(),
            }}
          >
            <AutoSizer>
              {({ width, height }) => (
                <Grid
                  ref={gridRef}
                  cellRenderer={cellRenderer}
                  columnCount={columnCount}
                  columnWidth={width / columnCount}
                  height={height}
                  rowCount={rowCount}
                  rowHeight={ROW_HEIGHT}
                  width={width}
                  overscanRowCount={2}
                  style={{ overflow: 'auto' }}
                  className="scrollbar-styled"
                  onScroll={handleScroll}
                />
              )}
            </AutoSizer>
          </div>
        )}
      </div>
    </main>
  )
}
