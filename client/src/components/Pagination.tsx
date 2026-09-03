import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  totalPages: number
  onPage: (page: number) => void
}

function PagBtn({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void
  disabled: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-7 h-7 flex items-center justify-center rounded-lg border border-border bg-surface text-fg-subtle hover:bg-surface-hover hover:text-fg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  )
}

export function Pagination({ page, totalPages, onPage }: Props) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center gap-1">
      <PagBtn disabled={page === 1} onClick={() => onPage(1)}>
        <ChevronFirst size={13} />
      </PagBtn>
      <PagBtn disabled={page === 1} onClick={() => onPage(page - 1)}>
        <ChevronLeft size={13} />
      </PagBtn>
      <span className="text-xs text-fg-subtle px-2 tabular-nums">
        {page} / {totalPages}
      </span>
      <PagBtn disabled={page === totalPages} onClick={() => onPage(page + 1)}>
        <ChevronRight size={13} />
      </PagBtn>
      <PagBtn disabled={page === totalPages} onClick={() => onPage(totalPages)}>
        <ChevronLast size={13} />
      </PagBtn>
    </div>
  )
}
