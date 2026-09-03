import { useMemo, useRef, useState, useEffect, startTransition } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DoorOpen } from 'lucide-react'
import { fetchBookmarks, fetchFolders, fetchWallpaperToday, recordVisit } from './api'
import { useAppStore } from './store/appStore'
import { BookmarksGrid } from './components/BookmarksGrid'
import { SearchBar, type SearchBarHandle } from './components/SearchBar'
import { Pagination } from './components/Pagination'
import { FoldersBar } from './components/FoldersBar'
import { SortControls } from './components/SortControls'
import { ThemePicker } from './components/ThemePicker'

const PAGE_SIZE = 32

export default function App() {
  const { sortField, sortOrder, page, setPage, selectedFolderId, setSelectedFolderId } = useAppStore()
  const [search, setSearch] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)
  const searchRef = useRef<SearchBarHandle>(null)

  const { data: folders = [] } = useQuery({
    queryKey: ['folders'],
    queryFn: fetchFolders,
  })

  const { data: allBookmarks = [], isLoading } = useQuery({
    queryKey: ['bookmarks', sortField, sortOrder],
    queryFn: () => fetchBookmarks({ sortBy: sortField, sortOrder }),
  })

  const { data: wallpaper } = useQuery({
    queryKey: ['wallpaper'],
    queryFn: fetchWallpaperToday,
  })

  const [hasWallpaper, setHasWallpaper] = useState(() => {
    try {
      return localStorage.getItem('portico-has-wallpaper') === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (wallpaper) {
      const available = Boolean(wallpaper.available)
      setHasWallpaper(available)
      try {
        localStorage.setItem('portico-has-wallpaper', available ? 'true' : 'false')
      } catch { }
    }
  }, [wallpaper])

  const filtered = useMemo(() => {
    let bm = allBookmarks

    if (selectedFolderId === null) {
      bm = bm.filter((b) => b.folder_id == null)
    } else if (selectedFolderId === 'broken') {
      bm = bm.filter((b) => b.link_broken)
    } else if (selectedFolderId !== 'all') {
      bm = bm.filter((b) => b.folder_id === selectedFolderId)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      bm = bm.filter((b) => b.name?.toLowerCase().includes(q) || b.url?.toLowerCase().includes(q))
      bm = [...bm].sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0))
    }

    return bm
  }, [allBookmarks, selectedFolderId, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function focusSearch() {
    setHighlightedIndex(null)
    searchRef.current?.focus()
  }

  return (
    <div
      className="min-h-screen bg-bg flex justify-center items-start"
      style={
        hasWallpaper
          ? {
            backgroundImage: `url(${wallpaper?.url || '/wallpaper'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            backgroundRepeat: 'no-repeat',
          }
          : undefined
      }
    >
      <div
        className={`w-full max-w-screen-2xl p-6 rounded-3xl my-4 sm:my-6 md:my-8 mx-4 sm:mx-6 md:mx-8 transition-colors duration-150 ${hasWallpaper
          ? 'glass-panel'
          : 'bg-surface border border-border shadow-sm'
          }`}
      >
        <div className="mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DoorOpen size={26} className="text-accent" />
              <h1 className="text-2xl font-brand text-fg tracking-wide">Portico</h1>
            </div>
            <div className="flex items-center gap-2">
              <SortControls />
              <Pagination page={safePage} totalPages={totalPages} onPage={setPage} />
              <ThemePicker />
            </div>
          </div>
          <SearchBar
            ref={searchRef}
            onChange={(q) => { setSearch(q); startTransition(() => setPage(1)); setHighlightedIndex(null) }}
            onClear={() => { setSearch(''); startTransition(() => setPage(1)) }}
            onArrowDown={() => setHighlightedIndex(0)}
            onSubmit={(q) => {
              const top = filtered[0]
              if (top) {
                recordVisit(top.id)
                window.location.assign(top.url)
              } else {
                window.location.assign(`https://www.google.com/search?q=${encodeURIComponent(q)}`)
              }
            }}
          />
          <FoldersBar
            folders={folders}
            unsortedCount={allBookmarks.filter((b) => b.folder_id == null).length}
            brokenCount={allBookmarks.filter((b) => b.link_broken).length}
            selected={selectedFolderId}
            onSelect={(id) => { setSelectedFolderId(id); setPage(1) }}
          />
        </div>

        <BookmarksGrid
          bookmarks={paginated}
          folders={folders}
          isLoading={isLoading}
          highlightedIndex={highlightedIndex}
          onHighlight={setHighlightedIndex}
          onEscape={focusSearch}
        />
      </div>
    </div>
  )
}
