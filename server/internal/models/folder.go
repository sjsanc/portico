package models

import "time"

type Folder struct {
	ID        int        `gorm:"primaryKey" json:"id"`
	Name      string     `gorm:"not null" json:"name"`
	CreatedAt time.Time  `gorm:"autoCreateTime" json:"created_at"`
	Bookmarks []Bookmark `gorm:"foreignKey:FolderID" json:"bookmarks,omitempty"`
}
