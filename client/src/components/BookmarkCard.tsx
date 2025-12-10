import { formatDistanceToNow } from 'date-fns'

interface Bookmark {
  id: number
  url: string
  name: string
  favicon_url: string
  bookmarked_at: string
  folder_id: number | null
}

interface BookmarkCardProps {
  bookmark: Bookmark
  onDelete: (id: number) => void
}

export default function BookmarkCard({ bookmark, onDelete }: BookmarkCardProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex flex-col p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 overflow-hidden">
        <button
          onClick={() => onDelete(bookmark.id)}
          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-200 hover:text-red-100 opacity-0 group-hover:opacity-100 transition-all duration-200"
          title="Remove bookmark"
        >
          ✕
        </button>
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 h-14"
        >
          <img
            src={bookmark.favicon_url}
            alt={bookmark.name}
            className="h-full aspect-square rounded-lg object-cover flex-shrink-0 shadow-lg"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"%3E%3Ccircle cx="12" cy="12" r="10"/%3E%3C/svg%3E'
            }}
          />
          <div className="flex-1 min-w-0 gap-1">
            <p className="text-slate-400 text-xs">
              {formatDistanceToNow(new Date(bookmark.bookmarked_at), { addSuffix: true })}
            </p>
            <h3 className="text-white font-semibold text-sm line-clamp-1 hover:text-blue-200 transition-colors">
              {bookmark.name}
            </h3>
            <p className="text-slate-300 text-xs line-clamp-1 break-all">
              {bookmark.url}
            </p>
          </div>
        </a>
      </div>
    </div>
  )
}
