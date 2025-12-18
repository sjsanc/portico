export interface Bookmark {
  id: number
  url: string
  name: string
  favicon_url: string
  bookmarked_at: string
  folder_id: number | null
}

export interface Folder {
  id: number
  name: string
  created_at: string
  bookmarks?: Bookmark[]
}

export type FolderId = number | null | 'all'
export type SortField = 'bookmarked_at' | 'name'
export type SortDirection = 'asc' | 'desc'
