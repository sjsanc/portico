package services

import (
	"context"
	"net/http"
	"server/internal/database"
	"server/internal/models"
	"sync"
	"time"
)

const (
	checkTimeout     = 10 * time.Second
	checkConcurrency = 10
)

var httpClient = &http.Client{
	Timeout: checkTimeout,
}

// CheckAllLinks fetches every bookmark and updates its LinkBroken/LastCheckedAt
// fields based on a live HTTP check, running up to checkConcurrency requests
// at once.
func CheckAllLinks() {
	var bookmarks []models.Bookmark
	if err := database.DB.Find(&bookmarks).Error; err != nil {
		return
	}

	sem := make(chan struct{}, checkConcurrency)
	var wg sync.WaitGroup

	for _, b := range bookmarks {
		wg.Add(1)
		sem <- struct{}{}
		go func(bookmark models.Bookmark) {
			defer wg.Done()
			defer func() { <-sem }()
			checkOne(bookmark)
		}(b)
	}

	wg.Wait()
}

func checkOne(bookmark models.Bookmark) {
	broken := isBroken(bookmark.URL)
	now := time.Now()

	database.DB.Model(&models.Bookmark{}).Where("id = ?", bookmark.ID).Updates(map[string]interface{}{
		"link_broken":     broken,
		"last_checked_at": now,
	})
}

// isBroken reports whether a URL should be flagged as dead. It only flags
// hard failures (DNS/connection errors, timeouts, 404/410/5xx) - a 401/403
// usually just means a bot is being blocked, not that the site is down, so
// those are treated as reachable to avoid false positives.
func isBroken(url string) bool {
	ctx, cancel := context.WithTimeout(context.Background(), checkTimeout)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return true
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; PorticoLinkCheck/1.0)")

	resp, err := httpClient.Do(req)
	if err != nil {
		return true
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound || resp.StatusCode == http.StatusGone {
		return true
	}
	if resp.StatusCode >= 500 {
		return true
	}

	return false
}
