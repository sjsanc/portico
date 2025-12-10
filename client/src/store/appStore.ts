import { create } from 'zustand'

interface AppState {
  selectedFolderId: number | null | 'all'
  sortField: 'bookmarked_at' | 'name'
  sortDirection: 'asc' | 'desc'
  isModalOpen: boolean
  newFolderName: string
  setSelectedFolderId: (folderId: number | null | 'all') => void
  setSortField: (field: 'bookmarked_at' | 'name') => void
  setSortDirection: (direction: 'asc' | 'desc') => void
  setIsModalOpen: (open: boolean) => void
  setNewFolderName: (name: string) => void
}

const getInitialState = () => {
  const searchParams = new URLSearchParams(window.location.search)
  const initialFolderId = searchParams.get('unsorted') === 'true'
    ? null
    : searchParams.get('folder_id')
      ? parseInt(searchParams.get('folder_id')!)
      : 'all'
  const initialSortField = (searchParams.get('sortBy') as 'bookmarked_at' | 'name') || 'bookmarked_at'
  const initialSortDirection = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'

  return {
    selectedFolderId: initialFolderId,
    sortField: initialSortField,
    sortDirection: initialSortDirection,
  }
}

const updateSearchParams = (updates: {
  folder_id?: number | null | 'all'
  sortBy?: 'bookmarked_at' | 'name'
  sortOrder?: 'asc' | 'desc'
}) => {
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

  const newUrl = `${window.location.pathname}?${params.toString()}`
  window.history.pushState({}, '', newUrl)
}

export const useAppStore = create<AppState>((set) => ({
  ...getInitialState(),
  isModalOpen: false,
  newFolderName: '',
  setSelectedFolderId: (folderId) => {
    set({ selectedFolderId: folderId })
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
}))
