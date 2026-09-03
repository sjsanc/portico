import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Bookmark, Folder } from '../api'
import { deleteBookmark, moveBookmark, updateBookmark } from '../api'
import { BookmarkCard } from './BookmarkCard'

const COLS = 4

interface Props {
  bookmarks: Bookmark[]
  folders: Folder[]
  isLoading: boolean
  highlightedIndex: number | null
  onHighlight: (index: number | null) => void
  onEscape: () => void
}

export function BookmarksGrid({ bookmarks, folders, isLoading, highlightedIndex, onHighlight, onEscape }: Props) {
  const queryClient = useQueryClient()

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    queryClient.invalidateQueries({ queryKey: ['folders'] })
  }, [queryClient])

  const deleteMutation = useMutation({ mutationFn: deleteBookmark, onSuccess: invalidate })
  const moveMutation = useMutation({ mutationFn: ({ id, folder_id }: { id: number; folder_id: number | null }) => moveBookmark(id, folder_id), onSuccess: invalidate })
  const favouriteMutation = useMutation({ mutationFn: ({ id, favorite }: { id: number; favorite: boolean }) => updateBookmark(id, { favorite }), onSuccess: invalidate })

  const handleDelete = useCallback((id: number) => deleteMutation.mutate(id), [deleteMutation])
  const handleMove = useCallback((id: number, folder_id: number | null) => moveMutation.mutate({ id, folder_id }), [moveMutation])
  const handleFavouriteBookmark = useCallback((id: number, favorite: boolean) => favouriteMutation.mutate({ id, favorite }), [favouriteMutation])

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault()
        if ((index + 1) % COLS !== 0 && index + 1 < bookmarks.length) onHighlight(index + 1)
        break
      case 'ArrowLeft':
        e.preventDefault()
        if (index % COLS !== 0) onHighlight(index - 1)
        break
      case 'ArrowDown':
        e.preventDefault()
        if (index + COLS < bookmarks.length) onHighlight(index + COLS)
        break
      case 'ArrowUp':
        e.preventDefault()
        if (index < COLS) onEscape()
        else onHighlight(index - COLS)
        break
      case 'Escape':
        e.preventDefault()
        onEscape()
        break
    }
  }, [bookmarks.length, onHighlight, onEscape])

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 28 }).map((_, i) => (
          <div key={i} className="h-[76px] bg-fill rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (bookmarks.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-fg-subtle">
        No bookmarks found
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {bookmarks.map((b, i) => (
        <BookmarkCard
          key={b.id}
          bookmark={b}
          folders={folders}
          highlighted={highlightedIndex === i}
          onDelete={handleDelete}
          onMove={handleMove}
          onFavouriteBookmark={handleFavouriteBookmark}
          onKeyDown={handleKeyDown}
          onFocus={onHighlight}
          index={i}
        />
      ))}
    </div>
  )
}
