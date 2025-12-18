package main

import (
	"log"
	"net/http"
	"os"
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

	// Get port from environment, default to 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Get environment mode
	env := os.Getenv("ENV")
	if env == "" {
		env = "development"
	}

	mux := http.NewServeMux()

	// API routes
	mux.HandleFunc("POST /bookmarks", handlers.CreateBookmark)
	mux.HandleFunc("GET /bookmarks", handlers.GetAllBookmarks)
	mux.HandleFunc("PUT /bookmarks/{id}", handlers.UpdateBookmark)
	mux.HandleFunc("DELETE /bookmarks/{id}", handlers.DeleteBookmark)

	mux.HandleFunc("POST /folders", handlers.CreateFolder)
	mux.HandleFunc("GET /folders", handlers.GetAllFolders)
	mux.HandleFunc("GET /folders/{id}", handlers.GetFolder)
	mux.HandleFunc("PUT /folders/{id}", handlers.UpdateFolder)
	mux.HandleFunc("DELETE /folders/{id}", handlers.DeleteFolder)

	// In production, serve static files
	if env == "production" {
		fs := http.FileServer(http.Dir("./dist"))
		mux.Handle("/", fs)
		log.Println("Serving static files from ./dist")
	}

	log.Printf("Server running in %s mode on port :%s\n", env, port)
	log.Fatal(http.ListenAndServe(":"+port, corsMiddleware(mux)))
}
