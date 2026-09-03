import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Palette, Check } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import type { ThemeId } from '../store/appStore'

const THEMES: { value: ThemeId; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

export function ThemePicker() {
  const { theme, setTheme } = useAppStore()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label="Change theme"
          className="flex items-center justify-center w-7 h-7 rounded-lg border border-border bg-surface text-fg-subtle hover:bg-surface-hover hover:text-fg-muted shadow-sm transition-colors focus:outline-none"
        >
          <Palette size={14} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="z-50 min-w-32 bg-surface border border-border rounded-lg shadow-lg py-1 text-sm focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 duration-100"
        >
          {THEMES.map((t) => (
            <DropdownMenu.Item
              key={t.value}
              onSelect={() => setTheme(t.value)}
              className="flex items-center gap-2 px-3 py-2 text-fg-muted hover:bg-surface-hover cursor-default select-none focus:outline-none focus:bg-surface-hover"
            >
              {t.label}
              {t.value === theme && <Check size={14} className="ml-auto text-accent-soft" />}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
