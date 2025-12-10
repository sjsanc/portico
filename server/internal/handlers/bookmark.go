package handlers

import (
	"encoding/json"
	"net/http"
	"server/internal/database"
	"server/internal/models"
	"server/internal/utils"
)

// CreateBookmark handles POST requests to create a new bookmark
func CreateBookmark(w http.ResponseWriter, r *http.Request) {
	var bookmark models.Bookmark

	if err := json.NewDecoder(r.Body).Decode(&bookmark); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Auto-generate favicon URL if not provided
	if bookmark.FaviconURL == "" {
		bookmark.FaviconURL = utils.GetFaviconURL(bookmark.URL)
	}

	if err := database.DB.Create(&bookmark).Error; err != nil {
		http.Error(w, "Failed to create bookmark", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(bookmark)
}

// GetAllBookmarks handles GET requests to retrieve all bookmarks
func GetAllBookmarks(w http.ResponseWriter, r *http.Request) {
	var bookmarks []models.Bookmark
	query := database.DB

	if url := r.URL.Query().Get("url"); url != "" {
		query = query.Where("url LIKE ?", "%"+url+"%")
	}

	if name := r.URL.Query().Get("name"); name != "" {
		query = query.Where("name LIKE ?", "%"+name+"%")
	}

	if folderId := r.URL.Query().Get("folder_id"); folderId != "" {
		query = query.Where("folder_id = ?", folderId)
	} else {
		// Default: only show unsorted bookmarks (folder_id IS NULL)
		query = query.Where("folder_id IS NULL")
	}

	if err := query.Find(&bookmarks).Error; err != nil {
		http.Error(w, "Failed to fetch bookmarks", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(bookmarks)
}

// UpdateBookmark handles PUT requests to update a bookmark
func UpdateBookmark(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var bookmark models.Bookmark

	if err := json.NewDecoder(r.Body).Decode(&bookmark); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := database.DB.Model(&models.Bookmark{}).Where("id = ?", id).Updates(bookmark).Error; err != nil {
		http.Error(w, "Failed to update bookmark", http.StatusInternalServerError)
		return
	}

	if err := database.DB.First(&bookmark, id).Error; err != nil {
		http.Error(w, "Bookmark not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(bookmark)
}

// DeleteBookmark handles DELETE requests to remove a bookmark
func DeleteBookmark(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	if err := database.DB.Delete(&models.Bookmark{}, id).Error; err != nil {
		http.Error(w, "Failed to delete bookmark", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
