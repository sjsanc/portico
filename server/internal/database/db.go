package database

import (
	"server/internal/models"

	"gorm.io/gorm"
)

var DB *gorm.DB

// Initialize opens the database connection and runs migrations
func Initialize(instance *gorm.DB) error {
	DB = instance
	return Migrate()
}

// Migrate runs all database migrations
func Migrate() error {
	return DB.AutoMigrate(&models.Folder{}, &models.Bookmark{})
}
