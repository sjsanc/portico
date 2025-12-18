import type { Bookmark, Folder, FolderId, SortField, SortDirection } from './types'

const API_BASE = 'http://localhost:8080'

export async function fetchFolders(): Promise<Folder[]> {
  const response = await fetch(`${API_BASE}/folders`)
  if (!response.ok) {
    throw new Error(`Failed to fetch folders: ${response.statusText}`)
  }
  return (await response.json()) ?? []
}

export async function fetchBookmarks(
  folderId: FolderId,
  sortField: SortField,
  sortDirection: SortDirection
): Promise<Bookmark[]> {
  const params = new URLSearchParams({
    sortBy: sortField,
    sortOrder: sortDirection,
  })

  if (folderId === null) {
    params.set('unsorted', 'true')
  } else if (folderId !== 'all') {
    params.set('folder_id', folderId.toString())
  }

  const response = await fetch(`${API_BASE}/bookmarks?${params}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch bookmarks: ${response.statusText}`)
  }
  return (await response.json()) ?? []
}

export async function deleteBookmark(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/bookmarks/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error(`Failed to delete bookmark: ${response.statusText}`)
  }
}

export async function moveBookmark(bookmarkId: number, folderId: number | null): Promise<void> {
  const response = await fetch(`${API_BASE}/bookmarks/${bookmarkId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder_id: folderId }),
  })
  if (!response.ok) {
    throw new Error(`Failed to move bookmark: ${response.statusText}`)
  }
}

export async function createFolder(name: string): Promise<Folder> {
  const response = await fetch(`${API_BASE}/folders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!response.ok) {
    throw new Error(`Failed to create folder: ${response.statusText}`)
  }
  return response.json()
}
