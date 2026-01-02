import { motion } from 'framer-motion'
import type { Bookmark, Folder, FolderId } from '../types'
import FolderCard from './FolderCard'

interface FoldersColumnProps {
  folders: Folder[]
  allBookmarks: Bookmark[]
  selectedFolderId: FolderId
  loading: boolean
  onFolderSelect: (folderId: FolderId) => void
  onCreateFolder: () => void
}

export default function FoldersColumn({
  folders,
  allBookmarks,
  selectedFolderId,
  loading,
  onFolderSelect,
  onCreateFolder,
}: FoldersColumnProps) {
  const unsortedBookmarks = allBookmarks.filter((b) => b.folder_id === null)

  if (loading && folders.length === 0) {
    return (
      <div className="flex flex-col w-90 flex-shrink-0 sticky">
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="w-full h-[90px] opacity-0" />
          ))}
        </div>
      </div>
    )
  }

  if (folders.length === 0) {
    return (
      <div className="flex flex-col w-90 flex-shrink-0 sticky">
        <motion.button
          onClick={onCreateFolder}
          className="relative group w-full"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="card-glow" />
          <div className="card-base bg-sky-400/10 cursor-pointer border-2 border-dashed border-white/20 hover:border-orange-500 flex items-center justify-center gap-3">
            <div className="text-white font-semibold text-lg">+</div>
            <p className="text-slate-300 text-base font-semibold">New folder</p>
          </div>
        </motion.button>
      </div>
    )
  }

  const handleFolderClick = (folderId: FolderId) => {
    // Toggle: if already selected, deselect and go to 'all' view
    if (selectedFolderId === folderId) {
      onFolderSelect('all')
    } else {
      onFolderSelect(folderId)
    }
  }

  return (
    <div className="flex flex-col w-90 flex-shrink-0 sticky">
      <div className="flex flex-col gap-2">
        <motion.button
          onClick={onCreateFolder}
          className="relative group w-full h-[90px]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="card-glow" />
          <div className="h-full card-base bg-sky-400/10 cursor-pointer border-2 border-dashed border-white/20 hover:border-orange-500 flex items-center justify-center gap-3">
            <div className="text-white font-semibold text-lg">+</div>
            <p className="text-slate-300 text-base font-semibold">New folder</p>
          </div>
        </motion.button>

        <FolderCard
          folderId={null}
          name="Unsorted"
          bookmarks={unsortedBookmarks}
          isSelected={selectedFolderId === null}
          onClick={() => handleFolderClick(null)}
          index={0}
        />

        {folders.map((folder, index) => (
          <FolderCard
            key={folder.id}
            folderId={folder.id}
            name={folder.name}
            bookmarks={folder.bookmarks ?? []}
            isSelected={selectedFolderId === folder.id}
            onClick={() => handleFolderClick(folder.id)}
            index={index + 1}
          />
        ))}
      </div>
    </div>
  )
}
