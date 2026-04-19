import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react'
import { Search, X } from 'lucide-react'

interface Props {
  onChange: (q: string) => void
  onArrowDown: () => void
  onClear: () => void
}

export interface SearchBarHandle {
  focus: () => void
  clear: () => void
}

export const SearchBar = forwardRef<SearchBarHandle, Props>(function SearchBar(
  { onChange, onArrowDown, onClear },
  ref
) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => { setValue(''); onClear() },
  }))

  function handleChange(q: string) {
    setValue(q)
    onChange(q)
  }

  return (
    <div className="relative flex items-center w-full">
      <Search size={18} className="absolute left-4 text-gray-400 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search bookmarks..."
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            onArrowDown()
          } else if (e.key === 'Enter' && value.trim()) {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(value.trim())}`, '_blank')
          }
        }}
        className="w-full pl-11 pr-10 py-3 text-base bg-white border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition"
      />
      {value && (
        <button
          onClick={() => handleChange('')}
          className="absolute right-3 text-gray-300 hover:text-gray-500 transition-colors"
          tabIndex={-1}
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
})
