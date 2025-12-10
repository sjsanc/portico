import { useEffect, useState } from 'react'

interface Bookmark {
  id: number
  url: string
  name: string
  favicon_url: string
  bookmarked_at: string
  folder_id: number | null
}

interface Folder {
  id: number
  name: string
  created_at: string
}

export default function App() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchFolders = async () => {
    try {
      const response = await fetch('http://localhost:8080/folders')
      if (!response.ok) {
        throw new Error(`Failed to fetch folders: ${response.statusText}`)
      }
      const data = await response.json()
      setFolders(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load folders')
    }
  }

  const fetchBookmarks = async (folderId: number | null = null) => {
    try {
      let url = 'http://localhost:8080/bookmarks'
      if (folderId !== null) {
        url += `?folder_id=${folderId}`
      }
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch bookmarks: ${response.statusText}`)
      }
      const data = await response.json()
      setBookmarks(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookmarks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true)
      await fetchFolders()
      await fetchBookmarks(null)
    }
    initializeApp()
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchBookmarks(selectedFolderId)
  }, [selectedFolderId])

  const handleDeleteBookmark = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8080/bookmarks/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error(`Failed to delete bookmark: ${response.statusText}`)
      }
      setBookmarks(bookmarks.filter(b => b.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bookmark')
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    try {
      const response = await fetch('http://localhost:8080/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newFolderName }),
      })
      if (!response.ok) {
        throw new Error(`Failed to create folder: ${response.statusText}`)
      }
      const newFolder = await response.json()
      setFolders([...folders, newFolder])
      setNewFolderName('')
      setIsModalOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create folder')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">Portico</h1>
        <p className="text-slate-300 text-lg text-center mb-12">Your bookmarks</p>

        {error && (
          <div className="text-center text-red-400 mb-4">{error}</div>
        )}

        {/* Folders Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Folders</h2>
          {loading && folders.length === 0 ? (
            <div className="text-slate-400">Loading folders...</div>
          ) : folders.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-teal-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex flex-col items-center justify-center p-8 bg-white/10 backdrop-blur-md rounded-xl border-2 border-dashed border-white/30 hover:border-white/50 transition-all duration-300 min-h-32 cursor-pointer group-hover:bg-white/15">
                  <div className="text-3xl text-white/60 group-hover:text-white transition-colors mb-2">+</div>
                  <p className="text-white/60 group-hover:text-white transition-colors font-semibold">Create folder</p>
                </div>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Unsorted folder */}
              {(() => {
                const unsortedBookmarks = bookmarks.filter(b => b.folder_id === null)
                const faviconSlots = [
                  unsortedBookmarks[0]?.favicon_url,
                  unsortedBookmarks[1]?.favicon_url,
                  unsortedBookmarks[2]?.favicon_url,
                  unsortedBookmarks[3]?.favicon_url,
                ]
                return (
                  <button
                    onClick={() => setSelectedFolderId(null)}
                    className="relative group text-left"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-teal-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="cursor-pointer relative flex items-start justify-start gap-6 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300">
                      {/* 2x2 Favicon Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {faviconSlots.map((faviconUrl, idx) => (
                          <div key={idx} className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                            {faviconUrl ? (
                              <img
                                src={faviconUrl}
                                alt="favicon"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-white/5" />
                            )}
                          </div>
                        ))}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-2xl line-clamp-2">Unsorted</h3>
                        <p className="text-slate-300 text-sm mt-1">{unsortedBookmarks.length} bookmarks</p>
                      </div>
                    </div>
                  </button>
                )
              })()}

              {folders.map((folder) => {
                const bookmarks = folder.bookmarks || []
                const faviconSlots = [
                  bookmarks[0]?.favicon_url,
                  bookmarks[1]?.favicon_url,
                  bookmarks[2]?.favicon_url,
                  bookmarks[3]?.favicon_url,
                ]
                return (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className="relative group text-left"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-teal-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="cursor-pointer relative flex items-start justify-start gap-6 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300">
                      {/* 2x2 Favicon Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {faviconSlots.map((faviconUrl, idx) => (
                          <div key={idx} className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                            {faviconUrl ? (
                              <img
                                src={faviconUrl}
                                alt="favicon"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-white/5" />
                            )}
                          </div>
                        ))}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-2xl line-clamp-2">{folder.name}</h3>
                        <p className="text-slate-300 text-sm mt-1">{bookmarks.length} bookmarks</p>
                      </div>
                    </div>
                  </button>
                )
              })}
              <button
                onClick={() => setIsModalOpen(true)}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-teal-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex flex-col items-center justify-center bg-slate-900 cursor-pointer backdrop-blur-md rounded-xl border-2 border-dashed border-white/20 hover:border-white/40 transition-all duration-300 h-full">
                  <div className="text-white font-semibold text-lg">+</div>
                  <p className="text-slate-400 mt-2">New folder</p>
                </div>
              </button>
            </div>
          )}
        </section>

        {/* Bookmarks Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">
              {selectedFolderId
                ? folders.find(f => f.id === selectedFolderId)?.name ?? 'Folder'
                : 'Unsorted'
              }
            </h2>
          </div>

          {loading && bookmarks.length === 0 && (
            <div className="text-center text-slate-400">Loading bookmarks...</div>
          )}

          {!loading && bookmarks.length === 0 && (
            <div className="text-center text-slate-400">
              {selectedFolderId ? 'No bookmarks in this folder' : 'No unsorted bookmarks yet'}
            </div>
          )}

          {!loading && bookmarks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex flex-col p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 overflow-hidden">
                    <button
                      onClick={() => handleDeleteBookmark(bookmark.id)}
                      className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-200 hover:text-red-100 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      title="Remove bookmark"
                    >
                      ✕
                    </button>
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3"
                    >
                      <img
                        src={bookmark.favicon_url}
                        alt={bookmark.name}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0 shadow-lg"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"%3E%3Ccircle cx="12" cy="12" r="10"/%3E%3C/svg%3E'
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-sm line-clamp-1 hover:text-blue-200 transition-colors">
                          {bookmark.name}
                        </h3>
                        <p className="text-slate-300 text-xs mt-0.5 line-clamp-1 break-all">
                          {bookmark.url}
                        </p>
                      </div>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Create Folder Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl border border-white/20 p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">Create New Folder</h2>
              <input
                type="text"
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                className="w-full px-4 py-2 mb-6 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setNewFolderName('')
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 font-semibold border border-white/20 hover:border-white/40"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-semibold"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
