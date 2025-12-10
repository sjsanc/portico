-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL UNIQUE,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add folder_id column to bookmarks if it doesn't exist
ALTER TABLE bookmarks ADD COLUMN folder_id INTEGER REFERENCES folders(id);

-- Migrate existing folder data from string to IDs
-- First, get unique folder names from bookmarks
INSERT OR IGNORE INTO folders (name)
SELECT DISTINCT folder FROM bookmarks WHERE folder != '' AND folder IS NOT NULL;

-- Update bookmark folder_id based on folder name
UPDATE bookmarks
SET folder_id = (SELECT id FROM folders WHERE folders.name = bookmarks.folder)
WHERE folder != '' AND folder IS NOT NULL;
