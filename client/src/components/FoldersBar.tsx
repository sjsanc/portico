import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteFolder } from '../api'
import type { Folder } from '../api'
import type { FolderId } from '../store/appStore'
import { NewFolderDialog } from './NewFolderDialog'

interface Props {
  folders: Folder[]
  unsortedCount: number
  brokenCount: number
  selected: FolderId
  onSelect: (id: FolderId) => void
}

function SpecialChip({ label, count, active, onClick }: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-100 whitespace-nowrap
        ${active
          ? 'bg-accent text-accent-fg hover:bg-accent-hover'
          : 'text-fg-subtle hover:text-fg-muted hover:bg-fill-hover'
        }`}
    >
      {label}
      <span className={`text-xs tabular-nums ${active ? 'text-accent-fg/70' : 'text-fg-faint'}`}>{count}</span>
    </button>
  )
}

function FolderChip({ folder, active, onClick, onDeleted }: {
  folder: Folder
  active: boolean
  onClick: () => void
  onDeleted: () => void
}) {
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: () => deleteFolder(folder.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      onDeleted()
    },
  })

  const count = folder.bookmarks?.length ?? 0

  return (
    <AlertDialog.Root>
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-100 whitespace-nowrap
          ${active
            ? 'bg-accent text-accent-fg hover:bg-accent-hover'
            : 'text-fg-subtle hover:text-fg-muted hover:bg-fill-hover'
          }`}
      >
        <button onClick={onClick} className="focus:outline-none">
          {folder.name}
        </button>

        {/* Count → × on hover of the number */}
        <span className="group relative w-4 h-4 flex items-center justify-center">
          <span className={`text-xs tabular-nums group-hover:opacity-0 transition-opacity leading-none ${active ? 'text-accent-fg/70' : 'text-fg-faint'}`}>{count}</span>
          <AlertDialog.Trigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none
                ${active ? 'text-accent-fg/80 hover:text-accent-fg' : 'text-fg-subtle hover:text-accent'}`}
              aria-label={`Delete ${folder.name}`}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>
          </AlertDialog.Trigger>
        </span>
      </div>

      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-overlay z-40" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-surface rounded-xl shadow-lg border border-border p-6 focus:outline-none">
          <AlertDialog.Title className="text-sm font-semibold text-fg mb-2">
            Delete "{folder.name}"?
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-fg-subtle mb-6">
            {count > 0
              ? `This will unassign ${count} bookmark${count !== 1 ? 's' : ''} from this folder. They won't be deleted.`
              : 'This folder is empty and will be permanently removed.'}
          </AlertDialog.Description>
          <div className="flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <button className="px-3 py-1.5 text-sm font-medium text-fg-subtle hover:text-fg-muted rounded-lg hover:bg-surface-hover transition-colors">
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                onClick={() => deleteMutation.mutate()}
                className="px-3 py-1.5 text-sm font-medium text-accent-fg bg-accent rounded-lg hover:bg-accent-hover transition-colors"
              >
                Delete
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

export function FoldersBar({ folders, unsortedCount, brokenCount, selected, onSelect }: Props) {
  const totalCount = folders.reduce((n, f) => n + (f.bookmarks?.length ?? 0), 0) + unsortedCount
  return (
    <div className="flex items-stretch gap-2">
      <div className="flex items-center gap-2 px-2 py-2 bg-fill rounded-lg shrink-0">
        <SpecialChip
          label="All"
          count={totalCount}
          active={selected === 'all'}
          onClick={() => onSelect('all')}
        />
        <SpecialChip
          label="Unsorted"
          count={unsortedCount}
          active={selected === null}
          onClick={() => onSelect(selected === null ? 'all' : null)}
        />
        <SpecialChip
          label="Broken"
          count={brokenCount}
          active={selected === 'broken'}
          onClick={() => onSelect(selected === 'broken' ? 'all' : 'broken')}
        />
      </div>
      <div className="flex items-center gap-2 px-2 py-2 bg-fill gap-1 rounded-lg flex-1">
        {folders.map((f) => (
          <FolderChip
            key={f.id}
            folder={f}
            active={selected === f.id}
            onClick={() => onSelect(selected === f.id ? 'all' : f.id)}
            onDeleted={() => { if (selected === f.id) onSelect('all') }}
          />
        ))}
      </div>
      <div className="flex items-center shrink-0 p-1 bg-fill rounded-lg">
        <NewFolderDialog />
      </div>
    </div>
  )
}
