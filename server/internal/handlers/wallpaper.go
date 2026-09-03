package handlers

import (
	"encoding/json"
	"hash/fnv"
	"math/rand"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

var validImageExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".webp": true,
	".avif": true,
	".gif":  true,
	".bmp":  true,
}

type WallpaperTodayResponse struct {
	Available bool   `json:"available"`
	Filename  string `json:"filename,omitempty"`
	Date      string `json:"date,omitempty"`
	URL       string `json:"url,omitempty"`
}

func getWallpaperDir() string {
	if dir := os.Getenv("WALLPAPERS_DIR"); dir != "" {
		return expandHome(dir)
	}
	home, err := os.UserHomeDir()
	if err != nil {
		return ""
	}
	return filepath.Join(home, "img", "wallpapers", "widescreen")
}

func expandHome(path string) string {
	if strings.HasPrefix(path, "~/") {
		home, err := os.UserHomeDir()
		if err == nil {
			return filepath.Join(home, path[2:])
		}
	}
	return path
}

func getWallpaperFiles(dir string) ([]string, error) {
	if dir == "" {
		return nil, nil
	}
	entries, err := os.ReadDir(dir)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, err
	}

	var files []string
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		ext := strings.ToLower(filepath.Ext(entry.Name()))
		if validImageExtensions[ext] {
			files = append(files, entry.Name())
		}
	}

	sort.Strings(files)
	return files, nil
}

func getDailyWallpaper() (fullPath string, fileName string, exists bool) {
	dir := getWallpaperDir()
	files, err := getWallpaperFiles(dir)
	if err != nil || len(files) == 0 {
		return "", "", false
	}

	today := time.Now().Format("2006-01-02")
	h := fnv.New64a()
	h.Write([]byte(today))
	seed := int64(h.Sum64())

	rng := rand.New(rand.NewSource(seed))
	idx := rng.Intn(len(files))
	selected := files[idx]

	return filepath.Join(dir, selected), selected, true
}

// GetWallpaper serves the daily selected wallpaper image file
func GetWallpaper(w http.ResponseWriter, r *http.Request) {
	fullPath, _, exists := getDailyWallpaper()
	if !exists {
		http.NotFound(w, r)
		return
	}

	w.Header().Set("Cache-Control", "no-cache")
	http.ServeFile(w, r, fullPath)
}

// GetWallpaperToday returns metadata for today's selected wallpaper
func GetWallpaperToday(w http.ResponseWriter, r *http.Request) {
	_, filename, exists := getDailyWallpaper()
	w.Header().Set("Content-Type", "application/json")
	if !exists {
		json.NewEncoder(w).Encode(WallpaperTodayResponse{
			Available: false,
		})
		return
	}

	today := time.Now().Format("2006-01-02")
	json.NewEncoder(w).Encode(WallpaperTodayResponse{
		Available: true,
		Filename:  filename,
		Date:      today,
		URL:       "/wallpaper?date=" + today,
	})
}
