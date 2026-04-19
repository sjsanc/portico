import { create } from 'zustand'
import type { SortField, SortOrder } from '../api'

export type FolderId = 'all' | null | number

interface AppState {
  selectedFolderId: FolderId
  sortField: SortField
  sortOrder: SortOrder
  page: number

  setSelectedFolderId: (id: FolderId) => void
  setSortField: (field: SortField) => void
  setSortOrder: (order: SortOrder) => void
  setPage: (page: number) => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedFolderId: 'all',
  sortField: 'bookmarked_at',
  sortOrder: 'desc',
  page: 1,

  setSelectedFolderId: (id) => set({ selectedFolderId: id, page: 1 }),
  setSortField: (field) => set({ sortField: field, page: 1 }),
  setSortOrder: (order) => set({ sortOrder: order, page: 1 }),
  setPage: (page) => set({ page }),
}))
