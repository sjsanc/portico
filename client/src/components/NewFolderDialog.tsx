import { useState, useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FolderPlus, X } from 'lucide-react'
import { createFolder } from '../api'

export function NewFolderDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => createFolder(name.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      setName('')
      setOpen(false)
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim()) mutation.mutate()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { setOpen(o); if (!o) setName('') }}>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-1.5 h-full px-3 rounded-md text-sm font-medium text-fg-subtle hover:text-fg-muted hover:bg-fill-hover transition-colors whitespace-nowrap">
          <FolderPlus size={14} />
          New folder
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-overlay z-40" />
        <Dialog.Content
          onOpenAutoFocus={(e) => { e.preventDefault(); inputRef.current?.focus() }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-surface rounded-xl shadow-lg border border-border p-6 focus:outline-none"
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-sm font-semibold text-fg">New folder</Dialog.Title>
            <Dialog.Close className="text-fg-faint hover:text-fg-muted transition-colors">
              <X size={16} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              ref={inputRef}
              type="text"
              placeholder="Folder name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-ring focus:border-accent-border transition"
            />
            <div className="flex justify-end gap-2">
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
                disabled={!name.trim() || mutation.isPending}
                className="px-3 py-1.5 text-sm font-medium text-accent-fg bg-accent rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {mutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
