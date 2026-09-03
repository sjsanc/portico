import { memo, useState, useRef, useEffect, useCallback } from 'react'
import * as ContextMenu from '@radix-ui/react-context-menu'
import { formatDistanceToNow } from 'date-fns'
import { Globe, FolderInput, Trash2, Star, Pencil } from 'lucide-react'
import type { Bookmark, Folder } from '../api'
import { recordVisit } from '../api'
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
  const handleClick = useCallback(() => recordVisit(bookmark.id), [bookmark.id])
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
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          className={`group relative flex items-start gap-3 p-3 bg-surface border rounded-lg shadow-sm hover:shadow-md hover:bg-surface-hover transition-all duration-150 no-underline focus:outline-none
            ${highlighted
              ? 'border-accent-border ring-2 ring-accent-ring'
              : 'border-transparent hover:border-border-strong'
            }`}
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-md bg-surface-hover border border-border flex items-center justify-center overflow-hidden">
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
              <Globe size={14} className="text-fg-subtle" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-fg truncate leading-snug">
              {bookmark.name || hostname(bookmark.url)}
            </p>
            <p className="text-xs text-fg-subtle truncate mt-0.5">{hostname(bookmark.url)}</p>
            <p className="text-xs text-fg-faint mt-1">
              {age}{bookmark.visits > 0 && ` · ${bookmark.visits} ${bookmark.visits === 1 ? 'visit' : 'visits'}`}
            </p>
          </div>

          {bookmark.favorite && (
            <span className="absolute bottom-2 right-2 text-star text-xs leading-none">★</span>
          )}
          {bookmark.folder_id == null && (
            <span className={`absolute bottom-2 w-1.5 h-1.5 rounded-full bg-accent-soft ${bookmark.favorite ? 'right-5' : 'right-2'}`} />
          )}

          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded-md text-fg-faint hover:text-danger hover:bg-danger-soft text-base leading-none transition-all duration-100"
            aria-label="Delete bookmark"
          >
            ×
          </button>
        </a>
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content className="z-50 min-w-48 bg-surface border border-border rounded-lg shadow-lg py-1 text-sm focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 duration-100">
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger className="flex items-center gap-2 px-3 py-2 text-fg-muted hover:bg-surface-hover cursor-default select-none focus:outline-none focus:bg-surface-hover">
              <FolderInput size={14} className="text-fg-subtle" />
              Move to folder
              <span className="ml-auto text-fg-faint">›</span>
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent className="z-50 min-w-40 bg-surface border border-border rounded-lg shadow-lg py-1 text-sm focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 duration-100">
                <ContextMenu.Item
                  onSelect={() => onMove(bookmark.id, null)}
                  disabled={bookmark.folder_id == null}
                  className="flex items-center gap-2 px-3 py-2 text-fg-muted hover:bg-surface-hover cursor-default select-none focus:outline-none focus:bg-surface-hover disabled:opacity-40 disabled:pointer-events-none"
                >
                  Unsorted
                  {bookmark.folder_id == null && <span className="ml-auto text-accent-soft">✓</span>}
                </ContextMenu.Item>
                {folders.length > 0 && <ContextMenu.Separator className="my-1 border-t border-border" />}
                {folders.map((f) => (
                  <ContextMenu.Item
                    key={f.id}
                    onSelect={() => onMove(bookmark.id, f.id)}
                    disabled={bookmark.folder_id === f.id}
                    className="flex items-center gap-2 px-3 py-2 text-fg-muted hover:bg-surface-hover cursor-default select-none focus:outline-none focus:bg-surface-hover disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {f.name}
                    {bookmark.folder_id === f.id && <span className="ml-auto text-accent-soft">✓</span>}
                  </ContextMenu.Item>
                ))}
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>

          <ContextMenu.Item
            onSelect={() => onFavouriteBookmark(bookmark.id, !bookmark.favorite)}
            className="flex items-center gap-2 px-3 py-2 text-fg-muted hover:bg-surface-hover cursor-default select-none focus:outline-none focus:bg-surface-hover"
          >
            <Star size={14} className={bookmark.favorite ? 'text-star fill-star' : 'text-fg-subtle'} />
            {bookmark.favorite ? 'Unfavourite' : 'Favourite'}
          </ContextMenu.Item>

          <ContextMenu.Item
            onSelect={() => setEditOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-fg-muted hover:bg-surface-hover cursor-default select-none focus:outline-none focus:bg-surface-hover"
          >
            <Pencil size={14} className="text-fg-subtle" />
            Edit bookmark
          </ContextMenu.Item>

          <ContextMenu.Separator className="my-1 border-t border-border" />

          <ContextMenu.Item
            onSelect={() => onDelete(bookmark.id)}
            className="flex items-center gap-2 px-3 py-2 text-danger-strong hover:bg-danger-soft cursor-default select-none focus:outline-none focus:bg-danger-soft"
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
