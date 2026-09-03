export interface Bookmark {
  id: number
  name: string
  url: string
  favicon_url: string
  note: string
  folder_id: number | null
  favorite: boolean
  bookmarked_at: string
  created_at: string
  visits: number
  last_visited_at: string | null
}

export interface Folder {
  id: number
  name: string
  created_at: string
  bookmarks: Bookmark[]
}

export type SortField = 'bookmarked_at' | 'name' | 'visits'
export type SortOrder = 'asc' | 'desc'

export async function fetchBookmarks(params: {
  folder_id?: number | null
  unsorted?: boolean
  sortBy?: SortField
  sortOrder?: SortOrder
  url?: string
  name?: string
}): Promise<Bookmark[]> {
  const query = new URLSearchParams()
  if (params.folder_id != null) query.set('folder_id', String(params.folder_id))
  if (params.unsorted) query.set('unsorted', 'true')
  if (params.sortBy) query.set('sortBy', params.sortBy)
  if (params.sortOrder) query.set('sortOrder', params.sortOrder)
  if (params.url) query.set('url', params.url)
  if (params.name) query.set('name', params.name)
  const res = await fetch(`/bookmarks?${query}`)
  if (!res.ok) throw new Error('Failed to fetch bookmarks')
  return res.json()
}

export async function fetchFolders(): Promise<Folder[]> {
  const res = await fetch('/folders')
  if (!res.ok) throw new Error('Failed to fetch folders')
  return res.json()
}

export async function deleteFolder(id: number): Promise<void> {
  const res = await fetch(`/folders/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete folder')
}

export async function createFolder(name: string): Promise<Folder> {
  const res = await fetch('/folders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error('Failed to create folder')
  return res.json()
}

export async function updateBookmark(id: number, patch: Partial<Pick<Bookmark, 'favorite' | 'folder_id' | 'name' | 'url' | 'note'>>): Promise<Bookmark> {
  const res = await fetch(`/bookmarks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error('Failed to update bookmark')
  return res.json()
}

export async function deleteBookmark(id: number): Promise<void> {
  const res = await fetch(`/bookmarks/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete bookmark')
}

export async function moveBookmark(id: number, folder_id: number | null): Promise<void> {
  const res = await fetch(`/bookmarks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder_id }),
  })
  if (!res.ok) throw new Error('Failed to move bookmark')
}

export function recordVisit(id: number): void {
  const url = `/bookmarks/${id}/visit`
  if (navigator.sendBeacon?.(url)) return
  fetch(url, { method: 'POST', keepalive: true }).catch(() => {})
}
