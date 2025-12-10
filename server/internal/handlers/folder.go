package handlers

import (
	"encoding/json"
	"net/http"
	"server/internal/database"
	"server/internal/models"
)

// CreateFolder handles POST requests to create a new folder
func CreateFolder(w http.ResponseWriter, r *http.Request) {
	var folder models.Folder

	if err := json.NewDecoder(r.Body).Decode(&folder); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := database.DB.Create(&folder).Error; err != nil {
		http.Error(w, "Failed to create folder", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(folder)
}

// GetAllFolders handles GET requests to retrieve all folders with their bookmarks
func GetAllFolders(w http.ResponseWriter, r *http.Request) {
	var folders []models.Folder

	if err := database.DB.Preload("Bookmarks").Find(&folders).Error; err != nil {
		http.Error(w, "Failed to fetch folders", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(folders)
}

// GetFolder handles GET requests to retrieve a specific folder with its bookmarks
func GetFolder(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var folder models.Folder

	if err := database.DB.Preload("Bookmarks").First(&folder, id).Error; err != nil {
		http.Error(w, "Folder not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(folder)
}

// UpdateFolder handles PUT requests to update a folder
func UpdateFolder(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var folder models.Folder

	if err := json.NewDecoder(r.Body).Decode(&folder); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := database.DB.Model(&models.Folder{}).Where("id = ?", id).Updates(folder).Error; err != nil {
		http.Error(w, "Failed to update folder", http.StatusInternalServerError)
		return
	}

	if err := database.DB.Preload("Bookmarks").First(&folder, id).Error; err != nil {
		http.Error(w, "Folder not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(folder)
}

// DeleteFolder handles DELETE requests to remove a folder
func DeleteFolder(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	if err := database.DB.Delete(&models.Folder{}, id).Error; err != nil {
		http.Error(w, "Failed to delete folder", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
