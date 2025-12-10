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

	// Handle unsorted parameter - fetch only bookmarks without a folder
	if unsorted := r.URL.Query().Get("unsorted"); unsorted == "true" {
		query = query.Where("folder_id IS NULL")
	} else if folderId := r.URL.Query().Get("folder_id"); folderId != "" {
		// Fetch bookmarks for a specific folder
		query = query.Where("folder_id = ?", folderId)
	}
	// If neither unsorted nor folder_id are provided, fetch all bookmarks (no filter)

	// Handle sorting
	sortBy := r.URL.Query().Get("sortBy")
	sortOrder := r.URL.Query().Get("sortOrder")

	// Default to sorting by bookmarked_at desc if not specified
	if sortBy == "" {
		sortBy = "bookmarked_at"
	}
	if sortOrder == "" {
		sortOrder = "desc"
	}

	// Validate sortBy to prevent SQL injection
	validSortFields := map[string]bool{
		"bookmarked_at": true,
		"name":          true,
	}
	if !validSortFields[sortBy] {
		sortBy = "bookmarked_at"
	}

	// Validate sortOrder
	if sortOrder != "asc" && sortOrder != "desc" {
		sortOrder = "desc"
	}

	query = query.Order(sortBy + " " + sortOrder)

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
