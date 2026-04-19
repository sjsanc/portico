import { memo, useState, useRef, useEffect, useCallback } from 'react'
import * as ContextMenu from '@radix-ui/react-context-menu'
import { formatDistanceToNow } from 'date-fns'
import { Globe, FolderInput, Trash2, Star, Pencil } from 'lucide-react'
import type { Bookmark, Folder } from '../api'
import { EditBookmarkDialog } from './EditBookmarkDialog'

interface Props {
  bookmark: Bookmark
  folders: Folder[]
  highlighted: boolean
  index: number
  onDelete: (id: number) => void
  onMove: (id: number, folder_id: number | null) => void
  onFavouriteBookmark: (id: number, favorite: boolean) => void
  onKeyDown: (e: React.KeyboardEvent, index: number) => void
  onFocus: (index: number) => void
}

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export const BookmarkCard = memo(function BookmarkCard({ bookmark, folders, highlighted, index, onDelete, onMove, onFavouriteBookmark, onKeyDown, onFocus }: Props) {
  const [imgError, setImgError] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (highlighted) ref.current?.focus()
  }, [highlighted])

  const age = (() => {
    try {
      return formatDistanceToNow(new Date(bookmark.bookmarked_at || bookmark.created_at), { addSuffix: true })
    } catch {
      return ''
    }
  })()

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => onKeyDown(e, index), [onKeyDown, index])
  const handleFocus = useCallback(() => onFocus(index), [onFocus, index])
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete(bookmark.id)
  }, [onDelete, bookmark.id])

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <a
          ref={ref}
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          className={`group relative flex items-start gap-3 p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-all duration-150 no-underline focus:outline-none
            ${highlighted
              ? 'border-rose-300 ring-2 ring-rose-200'
              : 'border-gray-200 hover:border-gray-300'
            }`}
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
            {bookmark.favicon_url && !imgError ? (
              <img
                src={bookmark.favicon_url}
                alt=""
                width={16}
                height={16}
                onError={() => setImgError(true)}
                className="w-4 h-4 object-contain"
              />
            ) : (
              <Globe size={14} className="text-gray-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate leading-snug">
              {bookmark.name || hostname(bookmark.url)}
            </p>
            <p className="text-xs text-gray-400 truncate mt-0.5">{hostname(bookmark.url)}</p>
            <p className="text-xs text-gray-300 mt-1">{age}</p>
          </div>

          {bookmark.favorite && (
            <span className="absolute bottom-2 right-2 text-yellow-400 text-xs leading-none">★</span>
          )}
          {bookmark.folder_id == null && (
            <span className={`absolute bottom-2 w-1.5 h-1.5 rounded-full bg-rose-400 ${bookmark.favorite ? 'right-5' : 'right-2'}`} />
          )}

          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-gray-300 hover:text-red-500 hover:bg-red-50 text-base leading-none transition-all duration-100"
            aria-label="Delete bookmark"
          >
            ×
          </button>
        </a>
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content className="z-50 min-w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-sm focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 duration-100">
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 cursor-default select-none focus:outline-none focus:bg-gray-50">
              <FolderInput size={14} className="text-gray-400" />
              Move to folder
              <span className="ml-auto text-gray-300">›</span>
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent className="z-50 min-w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-sm focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 duration-100">
                <ContextMenu.Item
                  onSelect={() => onMove(bookmark.id, null)}
                  disabled={bookmark.folder_id == null}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 cursor-default select-none focus:outline-none focus:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
                >
                  Unsorted
                  {bookmark.folder_id == null && <span className="ml-auto text-rose-400">✓</span>}
                </ContextMenu.Item>
                {folders.length > 0 && <ContextMenu.Separator className="my-1 border-t border-gray-100" />}
                {folders.map((f) => (
                  <ContextMenu.Item
                    key={f.id}
                    onSelect={() => onMove(bookmark.id, f.id)}
                    disabled={bookmark.folder_id === f.id}
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 cursor-default select-none focus:outline-none focus:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {f.name}
                    {bookmark.folder_id === f.id && <span className="ml-auto text-rose-400">✓</span>}
                  </ContextMenu.Item>
                ))}
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>

          <ContextMenu.Item
            onSelect={() => onFavouriteBookmark(bookmark.id, !bookmark.favorite)}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 cursor-default select-none focus:outline-none focus:bg-gray-50"
          >
            <Star size={14} className={bookmark.favorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'} />
            {bookmark.favorite ? 'Unfavourite' : 'Favourite'}
          </ContextMenu.Item>

          <ContextMenu.Item
            onSelect={() => setEditOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 cursor-default select-none focus:outline-none focus:bg-gray-50"
          >
            <Pencil size={14} className="text-gray-400" />
            Edit bookmark
          </ContextMenu.Item>

          <ContextMenu.Separator className="my-1 border-t border-gray-100" />

          <ContextMenu.Item
            onSelect={() => onDelete(bookmark.id)}
            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 cursor-default select-none focus:outline-none focus:bg-red-50"
          >
            <Trash2 size={14} />
            Delete bookmark
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>

      <EditBookmarkDialog bookmark={bookmark} open={editOpen} onOpenChange={setEditOpen} />
    </ContextMenu.Root>
  )
})
