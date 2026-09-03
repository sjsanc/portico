package handlers

import (
	"encoding/json"
	"fmt"
	"hash/fnv"
	"math/rand"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

func TestWallpaperEndpoints(t *testing.T) {
	// Create a temp directory
	tempDir, err := os.MkdirTemp("", "wallpaper_test")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tempDir)

	// Set WALLPAPERS_DIR to temp directory
	t.Setenv("WALLPAPERS_DIR", tempDir)

	// Case 1: Empty directory
	req := httptest.NewRequest(http.MethodGet, "/wallpaper/today", nil)
	rec := httptest.NewRecorder()
	GetWallpaperToday(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}

	var resp WallpaperTodayResponse
	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatal(err)
	}
	if resp.Available {
		t.Fatalf("expected available to be false for empty directory")
	}

	// GET /wallpaper when empty should 404
	req = httptest.NewRequest(http.MethodGet, "/wallpaper", nil)
	rec = httptest.NewRecorder()
	GetWallpaper(rec, req)
	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", rec.Code)
	}

	// Case 2: Add non-image file
	if err := os.WriteFile(filepath.Join(tempDir, "notes.txt"), []byte("not an image"), 0644); err != nil {
		t.Fatal(err)
	}

	req = httptest.NewRequest(http.MethodGet, "/wallpaper/today", nil)
	rec = httptest.NewRecorder()
	GetWallpaperToday(rec, req)
	var respNonImg WallpaperTodayResponse
	if err := json.NewDecoder(rec.Body).Decode(&respNonImg); err != nil {
		t.Fatal(err)
	}
	if respNonImg.Available {
		t.Fatalf("expected available to be false when only non-images present")
	}

	// Case 3: Add image files
	img1 := filepath.Join(tempDir, "wallpaper1.jpg")
	img2 := filepath.Join(tempDir, "wallpaper2.png")
	if err := os.WriteFile(img1, []byte("fake-jpeg-data"), 0644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(img2, []byte("fake-png-data"), 0644); err != nil {
		t.Fatal(err)
	}

	req = httptest.NewRequest(http.MethodGet, "/wallpaper/today", nil)
	rec = httptest.NewRecorder()
	GetWallpaperToday(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
	var respImg WallpaperTodayResponse
	if err := json.NewDecoder(rec.Body).Decode(&respImg); err != nil {
		t.Fatal(err)
	}
	if !respImg.Available {
		t.Fatalf("expected available to be true")
	}
	if respImg.Filename != "wallpaper1.jpg" && respImg.Filename != "wallpaper2.png" {
		t.Fatalf("unexpected filename: %s", respImg.Filename)
	}

	// GET /wallpaper should return the file
	req = httptest.NewRequest(http.MethodGet, "/wallpaper", nil)
	rec = httptest.NewRecorder()
	GetWallpaper(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
	if rec.Body.String() != "fake-jpeg-data" && rec.Body.String() != "fake-png-data" {
		t.Fatalf("unexpected file body: %s", rec.Body.String())
	}
}

func TestDailySeedVariety(t *testing.T) {
	files := []string{"a.jpg", "b.jpg", "c.jpg", "d.jpg", "e.jpg"}
	picks := make(map[string]int)

	for day := 1; day <= 30; day++ {
		dateStr := fmt.Sprintf("2026-09-%02d", day)
		h := fnv.New64a()
		h.Write([]byte(dateStr))
		rng := rand.New(rand.NewSource(int64(h.Sum64())))
		selected := files[rng.Intn(len(files))]
		picks[selected]++
	}

	// Across 30 days with 5 files, all files should be picked at least once or twice
	if len(picks) < 3 {
		t.Fatalf("expected distribution across files, got only %d unique picks", len(picks))
	}
}
