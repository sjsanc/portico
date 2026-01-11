import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Search, Bookmark } from 'lucide-react'
import type { Bookmark as BookmarkType } from '../types'

interface OmniSearchProps {
  bookmarks: BookmarkType[]
  onQueryChange?: (query: string, matches: BookmarkType[]) => void
  onMatchChange?: (match: BookmarkType | null) => void
}

export interface OmniSearchHandle {
  focus: () => void
}

// Scoring function for bookmark matching
function scoreBookmark(bookmark: BookmarkType, query: string): number {
  const lowerQuery = query.toLowerCase()
  const name = bookmark.name.toLowerCase()
  const url = bookmark.url.toLowerCase()

  // Exact start match on name is best
  if (name.startsWith(lowerQuery)) {
    return 100
  }
  // Word boundary match in name
  if (name.includes(' ' + lowerQuery) || name.includes(lowerQuery)) {
    return 50
  }
  // URL domain match
  if (url.includes(lowerQuery)) {
    return 25
  }

  return 0
}

// Get matching bookmarks sorted by score
export function getMatches(bookmarks: BookmarkType[], searchQuery: string): BookmarkType[] {
  if (!searchQuery.trim()) return []

  const scored = bookmarks
    .map(bookmark => ({
      bookmark,
      score: scoreBookmark(bookmark, searchQuery)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.map(item => item.bookmark)
}

const OmniSearch = forwardRef<OmniSearchHandle, OmniSearchProps>(
  ({ bookmarks, onQueryChange, onMatchChange }, ref) => {
    const [query, setQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus()
    }))

    // Debounce the query updates
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedQuery(query)
      }, 300)

      return () => clearTimeout(timer)
    }, [query])

    // Use immediate query for autocomplete, debounced query for results
    const immediateMatches = getMatches(bookmarks, query)
    const debouncedMatches = getMatches(bookmarks, debouncedQuery)

    const currentMatch = immediateMatches[selectedIndex] || null
    const isBookmarkMode = currentMatch !== null

    // Notify parent of debounced query/matches changes
    useEffect(() => {
      onQueryChange?.(debouncedQuery, debouncedMatches)
    }, [debouncedQuery, debouncedMatches.length])

    // Notify parent of selected match changes
    useEffect(() => {
      onMatchChange?.(currentMatch)
    }, [currentMatch?.id])

    // Get the autocomplete suggestion (the rest of the matched name)
    const getAutocompleteSuggestion = (): string => {
      if (!currentMatch || !query.trim()) return ''

      const name = currentMatch.name
      const lowerName = name.toLowerCase()
      const lowerQuery = query.toLowerCase()

      // If name starts with query, show the rest
      if (lowerName.startsWith(lowerQuery)) {
        return name.slice(query.length)
      }

      return ''
    }

    const autocompleteSuggestion = getAutocompleteSuggestion()

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (immediateMatches.length > 0) {
          setSelectedIndex(prev => (prev + 1) % immediateMatches.length)
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (immediateMatches.length > 0) {
          setSelectedIndex(prev => (prev - 1 + immediateMatches.length) % immediateMatches.length)
        }
      } else if (e.key === 'Tab' && autocompleteSuggestion) {
        e.preventDefault()
        // Complete the autocomplete
        setQuery(query + autocompleteSuggestion)
      } else if (e.key === 'Enter' && query.trim()) {
        e.preventDefault()
        if (isBookmarkMode && currentMatch) {
          // Navigate to the bookmark
          window.location.href = currentMatch.url
        } else {
          // Google search
          const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query.trim())}`
          window.location.href = searchUrl
        }
        setQuery('')
      } else if (e.key === 'Escape') {
        setQuery('')
        setSelectedIndex(0)
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value)
      setSelectedIndex(0) // Reset selection when query changes
    }

    return (
      <div className="flex-1 relative">
        {/* Icon on the left */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
          {isBookmarkMode ? (
            <Bookmark className="w-5 h-5 text-orange-400" />
          ) : (
            <Search className="w-5 h-5 text-cyan-400" />
          )}
        </div>

        {/* Autocomplete overlay */}
        <div className="absolute inset-0 flex items-center pointer-events-none pl-12 pr-4">
          <span className="text-white opacity-0">{query}</span>
          <span className="text-white/40 italic">{autocompleteSuggestion}</span>
        </div>

        {/* Actual input */}
        <input
          ref={inputRef}
          type="text"
          placeholder={isBookmarkMode ? "Go to bookmark..." : "Search Google..."}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={`w-full h-[58px] pl-12 pr-4 bg-sky-400/10 rounded-lg text-white placeholder-white/50 focus:outline-none transition-all shadow-md focus:shadow-lg ${
            isBookmarkMode
              ? 'border-2 border-orange-500 focus:ring-2 focus:ring-orange-400/30'
              : 'border border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30'
          }`}
          style={{ background: 'transparent', backgroundColor: 'rgba(56, 189, 248, 0.1)' }}
        />

        {/* Match info indicator */}
        {isBookmarkMode && immediateMatches.length > 1 && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-orange-400/70">
            {selectedIndex + 1}/{immediateMatches.length}
          </div>
        )}
      </div>
    )
  }
)

OmniSearch.displayName = 'OmniSearch'

export default OmniSearch
