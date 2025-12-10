package main

import (
	"encoding/csv"
	"flag"
	"fmt"
	"log"
	"net/url"
	"os"
	"strings"
	"time"
)

func main() {
	inputFile := flag.String("input", "", "Path to Raindrop.io CSV file")
	outputFile := flag.String("output", "", "Path to output SQL file")
	flag.Parse()

	if *inputFile == "" || *outputFile == "" {
		log.Fatal("Usage: migrate -input <csv_file> -output <sql_file>")
	}

	// Read CSV file
	file, err := os.Open(*inputFile)
	if err != nil {
		log.Fatalf("Failed to open input file: %v", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		log.Fatalf("Failed to read CSV: %v", err)
	}

	if len(records) == 0 {
		log.Fatal("CSV file is empty")
	}

	// Generate SQL statements
	sqlStatements := []string{}
	sqlStatements = append(sqlStatements, "BEGIN TRANSACTION;")

	// Skip header row and process data
	for i, record := range records[1:] {
		if len(record) < 5 {
			log.Printf("Warning: Skipping row %d with insufficient columns", i+2)
			continue
		}

		// Raindrop.io CSV format: id,title,note,excerpt,url,folder,tags,created,cover,highlights,favorite
		// Map to: 0=id, 1=title, 2=note, 3=excerpt, 4=url, 5=folder, 6=tags, 7=created, 8=cover, 9=highlights, 10=favorite
		title := strings.TrimSpace(record[1])
		note := strings.TrimSpace(record[2])
		url := strings.TrimSpace(record[4])
		folder := strings.TrimSpace(record[5])
		tags := strings.TrimSpace(record[6])
		createdStr := strings.TrimSpace(record[7])
		favoriteStr := strings.TrimSpace(record[10])

		if url == "" {
			log.Printf("Warning: Skipping row %d with empty URL", i+2)
			continue
		}

		// Parse created timestamp, fallback to now if invalid
		bookmarkedAt := time.Now().Format("2006-01-02 15:04:05")
		if createdStr != "" {
			if parsedTime, err := time.Parse(time.RFC3339, createdStr); err == nil {
				bookmarkedAt = parsedTime.Format("2006-01-02 15:04:05")
			}
		}

		// Parse favorite boolean
		favorite := false
		if strings.ToLower(favoriteStr) == "true" {
			favorite = true
		}

		// Escape single quotes in string fields
		escapedTitle := strings.ReplaceAll(title, "'", "''")
		escapedNote := strings.ReplaceAll(note, "'", "''")
		escapedFolder := strings.ReplaceAll(folder, "'", "''")
		escapedTags := strings.ReplaceAll(tags, "'", "''")

		// Generate favicon URL from domain
		faviconURL := ""
		if parsed, err := url.Parse(url); err == nil {
			faviconURL = fmt.Sprintf("https://www.google.com/s2/favicons?sz=64&domain=%s", parsed.Host)
		}

		// Generate INSERT statement
		stmt := fmt.Sprintf(
			"INSERT INTO bookmarks (url, name, favicon_url, note, folder, tags, favorite, bookmarked_at) VALUES ('%s', '%s', '%s', '%s', '%s', '%s', %v, '%s');",
			url,
			escapedTitle,
			faviconURL,
			escapedNote,
			escapedFolder,
			escapedTags,
			favorite,
			bookmarkedAt,
		)
		sqlStatements = append(sqlStatements, stmt)
	}

	sqlStatements = append(sqlStatements, "COMMIT;")

	// Write SQL file
	output, err := os.Create(*outputFile)
	if err != nil {
		log.Fatalf("Failed to create output file: %v", err)
	}
	defer output.Close()

	for _, stmt := range sqlStatements {
		_, err := output.WriteString(stmt + "\n")
		if err != nil {
			log.Fatalf("Failed to write SQL statement: %v", err)
		}
	}

	fmt.Printf("Successfully generated %s with %d bookmarks\n", *outputFile, len(sqlStatements)-2)
}
