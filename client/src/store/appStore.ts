import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SortField, SortOrder } from '../api'

export type FolderId = 'all' | 'broken' | null | number
export type ThemeId = 'light' | 'dark'

interface AppState {
  selectedFolderId: FolderId
  sortField: SortField
  sortOrder: SortOrder
  page: number
  theme: ThemeId

  setSelectedFolderId: (id: FolderId) => void
  setSortField: (field: SortField) => void
  setSortOrder: (order: SortOrder) => void
  setPage: (page: number) => void
  setTheme: (theme: ThemeId) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedFolderId: 'all',
      sortField: 'bookmarked_at',
      sortOrder: 'desc',
      page: 1,
      theme: 'light',

      setSelectedFolderId: (id) => set({ selectedFolderId: id, page: 1 }),
      setSortField: (field) => set({ sortField: field, page: 1 }),
      setSortOrder: (order) => set({ sortOrder: order, page: 1 }),
      setPage: (page) => set({ page }),
      setTheme: (theme) => {
        document.documentElement.dataset.theme = theme
        set({ theme })
      },
    }),
    {
      name: 'portico-prefs',
      partialize: (state) => ({ sortField: state.sortField, sortOrder: state.sortOrder, theme: state.theme }),
    }
  )
)
