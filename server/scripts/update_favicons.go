package main

import (
	"fmt"
	"log"
	"net/url"
	"os"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Bookmark struct {
	ID        int    `gorm:"primaryKey"`
	URL       string
	Name      string
	FaviconURL string
}

func main() {
	dbPath := "server.db"
	if len(os.Args) > 1 {
		dbPath = os.Args[1]
	}

	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	var bookmarks []Bookmark
	if err := db.Find(&bookmarks).Error; err != nil {
		log.Fatalf("Failed to fetch bookmarks: %v", err)
	}

	updated := 0
	for _, bookmark := range bookmarks {
		if bookmark.FaviconURL == "" {
			if parsed, err := url.Parse(bookmark.URL); err == nil {
				faviconURL := fmt.Sprintf("https://www.google.com/s2/favicons?sz=64&domain=%s", parsed.Host)
				if err := db.Model(&bookmark).Update("favicon_url", faviconURL).Error; err != nil {
					log.Printf("Failed to update bookmark %d: %v", bookmark.ID, err)
					continue
				}
				updated++
				fmt.Printf("Updated bookmark %d: %s\n", bookmark.ID, faviconURL)
			}
		}
	}

	fmt.Printf("\nSuccessfully updated %d bookmarks with favicon URLs\n", updated)
}
