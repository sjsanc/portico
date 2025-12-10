package models

import "time"

// Bookmark represents a bookmarked URL
type Bookmark struct {
	ID           int       `gorm:"primaryKey" json:"id"`
	URL          string    `gorm:"not null" json:"url"`
	Name         string    `gorm:"not null" json:"name"`
	FaviconURL   string    `json:"favicon_url"`
	Note         string    `json:"note"`
	FolderID     *int      `json:"folder_id"`
	Folder       *Folder   `gorm:"foreignKey:FolderID" json:"folder,omitempty"`
	Tags         string    `json:"tags"`
	Favorite     bool      `json:"favorite"`
	BookmarkedAt time.Time `gorm:"autoCreateTime" json:"bookmarked_at"`
}
