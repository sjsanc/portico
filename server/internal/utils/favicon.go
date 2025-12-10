package utils

import (
	"fmt"
	"net/url"
)

// GetFaviconURL returns a favicon URL for a given website URL
func GetFaviconURL(websiteURL string) string {
	parsed, err := url.Parse(websiteURL)
	if err != nil {
		return ""
	}

	// Build the favicon URL using Google's favicon service
	return fmt.Sprintf("https://www.google.com/s2/favicons?sz=64&domain=%s", parsed.Host)
}
