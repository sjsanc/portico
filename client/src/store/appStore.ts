import { create } from 'zustand'
import type { FolderId, SortField, SortDirection } from '../types'

interface AppState {
  selectedFolderId: FolderId
  sortField: SortField
  sortDirection: SortDirection
  isModalOpen: boolean
  newFolderName: string
  selectedBookmarkIds: Set<number>
  setSelectedFolderId: (folderId: FolderId) => void
  setSortField: (field: SortField) => void
  setSortDirection: (direction: SortDirection) => void
  setIsModalOpen: (open: boolean) => void
  setNewFolderName: (name: string) => void
  toggleBookmarkSelection: (id: number) => void
  clearBookmarkSelection: () => void
}

function getInitialState(): Pick<AppState, 'selectedFolderId' | 'sortField' | 'sortDirection'> {
  const params = new URLSearchParams(window.location.search)

  const selectedFolderId: FolderId = params.get('unsorted') === 'true'
    ? null
    : params.has('folder_id')
      ? parseInt(params.get('folder_id')!, 10)
      : 'all'

  const sortField = (params.get('sortBy') as SortField) || 'bookmarked_at'
  const sortDirection = (params.get('sortOrder') as SortDirection) || 'desc'

  return { selectedFolderId, sortField, sortDirection }
}

function updateSearchParams(updates: Partial<{
  folder_id: FolderId
  sortBy: SortField
  sortOrder: SortDirection
}>): void {
  const params = new URLSearchParams(window.location.search)

  if (updates.folder_id !== undefined) {
    params.delete('folder_id')
    params.delete('unsorted')

    if (updates.folder_id === null) {
      params.set('unsorted', 'true')
    } else if (updates.folder_id !== 'all') {
      params.set('folder_id', updates.folder_id.toString())
    }
  }

  if (updates.sortBy !== undefined) {
    params.set('sortBy', updates.sortBy)
  }

  if (updates.sortOrder !== undefined) {
    params.set('sortOrder', updates.sortOrder)
  }

  const newUrl = `${window.location.pathname}?${params}`
  window.history.pushState({}, '', newUrl)
}

export const useAppStore = create<AppState>((set) => ({
  ...getInitialState(),
  isModalOpen: false,
  newFolderName: '',
  selectedBookmarkIds: new Set(),

  setSelectedFolderId: (folderId) => {
    set({ selectedFolderId: folderId, selectedBookmarkIds: new Set() })
    updateSearchParams({ folder_id: folderId })
  },

  setSortField: (field) => {
    set({ sortField: field })
    updateSearchParams({ sortBy: field })
  },

  setSortDirection: (direction) => {
    set({ sortDirection: direction })
    updateSearchParams({ sortOrder: direction })
  },

  setIsModalOpen: (open) => set({ isModalOpen: open }),
  setNewFolderName: (name) => set({ newFolderName: name }),

  toggleBookmarkSelection: (id) => set((state) => {
    const newSet = new Set(state.selectedBookmarkIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    return { selectedBookmarkIds: newSet }
  }),

  clearBookmarkSelection: () => set({ selectedBookmarkIds: new Set() }),
}))
