package main

import (
	"log"
	"net/http"
	"server/internal/database"
	"server/internal/handlers"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Accept")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	db, err := gorm.Open(sqlite.Open("./server.db"), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Successfully connected to SQLite database")

	if err := database.Initialize(db); err != nil {
		log.Fatal(err)
	}

	log.Println("Database initialized successfully")

	mux := http.NewServeMux()

	// Bookmark routes
	mux.HandleFunc("POST /bookmarks", handlers.CreateBookmark)
	mux.HandleFunc("GET /bookmarks", handlers.GetAllBookmarks)
	mux.HandleFunc("PUT /bookmarks/{id}", handlers.UpdateBookmark)
	mux.HandleFunc("DELETE /bookmarks/{id}", handlers.DeleteBookmark)

	// Folder routes
	mux.HandleFunc("POST /folders", handlers.CreateFolder)
	mux.HandleFunc("GET /folders", handlers.GetAllFolders)
	mux.HandleFunc("GET /folders/{id}", handlers.GetFolder)
	mux.HandleFunc("PUT /folders/{id}", handlers.UpdateFolder)
	mux.HandleFunc("DELETE /folders/{id}", handlers.DeleteFolder)

	log.Println("Server listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", corsMiddleware(mux)))
}
