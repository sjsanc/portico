import { memo } from 'react'
import { motion } from 'framer-motion'
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
  index: number
}

const FALLBACK_ICON = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"%3E%3Ccircle cx="12" cy="12" r="10"/%3E%3C/svg%3E'

function BookmarkCard({ bookmark, isSelected, selectionCount, isDraggingAny, onDelete, onSelect, index }: BookmarkCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `bookmark-${bookmark.id}`,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  const handleCardClick = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      e.preventDefault()
      onSelect(bookmark.id)
    } else {
      // Regular click - open bookmark in new tab
      window.open(bookmark.url, '_blank', 'noopener,noreferrer')
    }
  }

  // Hide selected items (except the one being dragged) during multi-drag
  const shouldHide = isDraggingAny && isSelected && selectionCount > 1 && !isDragging

  return (
    <motion.div
      ref={setNodeRef}
      style={{ ...style, opacity: shouldHide ? 0 : 1 }}
      {...attributes}
      onClick={handleCardClick}
      className="relative group transition-opacity cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: shouldHide ? 0 : 1, y: 0 }}
      transition={{ duration: 0.15, delay: index * 0.01 }}
    >
      <div className="card-glow" />
      <div className={`card-blue flex flex-col ${isSelected ? 'border-orange-500 ring-2 ring-orange-500/30' : ''}`}>
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
        <div className="flex items-start gap-3 h-14">
          <div
            {...listeners}
            className="h-full cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
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
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-1">
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
        </div>
      </div>
    </motion.div>
  )
}

export default memo(BookmarkCard)
