import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ArrowDownAZ, ArrowUpAZ, ChevronDown } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import type { SortField } from '../api'

const FIELDS: { value: SortField; label: string }[] = [
  { value: 'bookmarked_at', label: 'Added' },
  { value: 'name', label: 'Name' },
  { value: 'visits', label: 'Visits' },
]

export function SortControls() {
  const { sortField, sortOrder, setSortField, setSortOrder } = useAppStore()
  const current = FIELDS.find((f) => f.value === sortField)

  return (
    <div className="flex items-center rounded-lg border border-border bg-surface shadow-sm overflow-hidden">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="flex items-center gap-1 px-2.5 h-7 text-xs font-medium text-fg-muted hover:bg-surface-hover transition-colors focus:outline-none">
            {current?.label ?? 'Sort'}
            <ChevronDown size={12} className="text-fg-subtle" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            className="z-50 min-w-32 bg-surface border border-border rounded-lg shadow-lg py-1 text-sm focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 duration-100"
          >
            {FIELDS.map((f) => (
              <DropdownMenu.Item
                key={f.value}
                onSelect={() => setSortField(f.value)}
                className="flex items-center gap-2 px-3 py-2 text-fg-muted hover:bg-surface-hover cursor-default select-none focus:outline-none focus:bg-surface-hover"
              >
                {f.label}
                {f.value === sortField && <span className="ml-auto text-accent-soft">✓</span>}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <button
        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        aria-label={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        className="flex items-center justify-center w-7 h-7 border-l border-border text-fg-subtle hover:bg-surface-hover hover:text-fg-muted transition-colors focus:outline-none"
      >
        {sortOrder === 'asc' ? <ArrowUpAZ size={14} /> : <ArrowDownAZ size={14} />}
      </button>
    </div>
  )
}
