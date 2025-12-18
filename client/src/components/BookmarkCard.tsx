import { memo } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { formatDistanceToNow } from 'date-fns'
import { Check } from 'lucide-react'
import type { Bookmark } from '../types'

interface BookmarkCardProps {
  bookmark: Bookmark
  isSelected: boolean
  selectionCount: number
  isDraggingAny: boolean
  onDelete: (id: number) => void
  onSelect: (id: number) => void
}

const FALLBACK_ICON = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"%3E%3Ccircle cx="12" cy="12" r="10"/%3E%3C/svg%3E'

function BookmarkCard({ bookmark, isSelected, selectionCount, isDraggingAny, onDelete, onSelect }: BookmarkCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `bookmark-${bookmark.id}`,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      e.preventDefault()
      onSelect(bookmark.id)
    }
  }

  // Hide selected items (except the one being dragged) during multi-drag
  const shouldHide = isDraggingAny && isSelected && selectionCount > 1 && !isDragging

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, opacity: shouldHide ? 0 : 1 }}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className="relative group transition-opacity"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className={`relative flex flex-col p-4 bg-white/10 backdrop-blur-md rounded-xl border transition-all duration-300 ${isSelected ? 'border-cyan-400 ring-2 ring-cyan-400/30' : 'border-white/20 hover:border-white/40'}`}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(bookmark.id)
          }}
          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-200 hover:text-red-100 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
          title="Remove bookmark"
        >
          ✕
        </button>
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.shiftKey && e.preventDefault()}
          className="flex items-start gap-3 h-14"
        >
          {isSelected ? (
            <div className="h-full aspect-square rounded-lg flex-shrink-0 shadow-lg bg-cyan-500 flex items-center justify-center">
              <Check className="w-8 h-8 text-white" strokeWidth={3} />
            </div>
          ) : (
            <img
              src={bookmark.favicon_url}
              alt={bookmark.name}
              className="h-full aspect-square rounded-lg object-cover flex-shrink-0 shadow-lg"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_ICON
              }}
            />
          )}
          <div className="flex-1 min-w-0 gap-1">
            <p className="text-slate-400 text-xs">
              {formatDistanceToNow(new Date(bookmark.bookmarked_at), { addSuffix: true })}
            </p>
            <h3 className="text-white font-semibold text-sm line-clamp-1 hover:text-blue-200 transition-colors">
              {bookmark.name}
            </h3>
            <p className="text-slate-300 text-xs line-clamp-1 break-all">
              {bookmark.url}
            </p>
          </div>
        </a>
      </div>
    </div>
  )
}

export default memo(BookmarkCard)
