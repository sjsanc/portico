import { motion } from 'framer-motion'
import { useDroppable } from '@dnd-kit/core'
import type { Bookmark, FolderId } from '../types'

interface FolderCardProps {
  folderId: FolderId
  name: string
  bookmarks: Bookmark[]
  isSelected: boolean
  onClick: () => void
  index?: number
}

export default function FolderCard({ folderId, name, bookmarks, isSelected, onClick, index = 0 }: FolderCardProps) {
  const isDroppable = folderId !== 'all'

  const { setNodeRef, isOver } = useDroppable({
    id: `folder-${folderId === null ? 'unsorted' : folderId}`,
    disabled: !isDroppable,
  })

  return (
    <motion.button
      ref={setNodeRef}
      onClick={onClick}
      className="relative group text-left w-full"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15, delay: index * 0.05 }}
    >
      <div className="card-glow" />
      <div
        className={`cursor-pointer card-base bg-sky-400/15 flex items-center gap-2 ${
          isOver && isDroppable
            ? 'border-orange-500 bg-orange-500/20 scale-[1.02]'
            : isSelected
              ? 'border-orange-500/60 bg-sky-400/20'
              : 'border-white/20 hover:border-orange-500'
        }`}
      >
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
    </motion.button>
  )
}
