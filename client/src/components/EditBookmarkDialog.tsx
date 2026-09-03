import { useState, useRef, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { updateBookmark } from '../api'
import type { Bookmark } from '../api'

interface Props {
  bookmark: Bookmark | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditBookmarkDialog({ bookmark, open, onOpenChange }: Props) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (bookmark) {
      setName(bookmark.name)
      setUrl(bookmark.url)
      setNote(bookmark.note ?? '')
    }
  }, [bookmark])

  const mutation = useMutation({
    mutationFn: () => updateBookmark(bookmark!.id, { name: name.trim(), url: url.trim(), note: note.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      onOpenChange(false)
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim() && url.trim()) mutation.mutate()
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-overlay z-40" />
        <Dialog.Content
          onOpenAutoFocus={(e) => { e.preventDefault(); inputRef.current?.focus() }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-surface rounded-xl shadow-lg border border-border p-6 focus:outline-none"
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-sm font-semibold text-fg">Edit bookmark</Dialog.Title>
            <Dialog.Close className="text-fg-faint hover:text-fg-muted transition-colors">
              <X size={16} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-fg-subtle">Name</label>
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-ring focus:border-accent-border transition"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-fg-subtle">URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-ring focus:border-accent-border transition"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-fg-subtle">Note</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-ring focus:border-accent-border transition resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm font-medium text-fg-subtle hover:text-fg-muted rounded-lg hover:bg-surface-hover transition-colors"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={!name.trim() || !url.trim() || mutation.isPending}
                className="px-3 py-1.5 text-sm font-medium text-accent-fg bg-accent rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {mutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
