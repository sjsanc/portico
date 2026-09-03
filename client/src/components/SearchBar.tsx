import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react'
import { Search, X } from 'lucide-react'

interface Props {
  onChange: (q: string) => void
  onArrowDown: () => void
  onClear: () => void
  onSubmit: (q: string) => void
}

export interface SearchBarHandle {
  focus: () => void
  clear: () => void
}

export const SearchBar = forwardRef<SearchBarHandle, Props>(function SearchBar(
  { onChange, onArrowDown, onClear, onSubmit },
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
      <Search size={18} className="absolute left-4 text-fg-subtle pointer-events-none" />
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
            onSubmit(value.trim())
          }
        }}
        className="w-full pl-11 pr-10 py-3 text-base bg-surface border border-border rounded-lg shadow-sm placeholder-fg-subtle focus:outline-none focus:ring-2 focus:ring-accent-ring focus:border-accent-border transition"
      />
      {value && (
        <button
          onClick={() => handleChange('')}
          className="absolute right-3 text-fg-faint hover:text-fg-subtle transition-colors"
          tabIndex={-1}
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
})
