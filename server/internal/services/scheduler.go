package services

import (
	"log"
	"time"
)

// StartLinkCheckScheduler runs CheckAllLinks once a day at local noon,
// blocking until the next noon before the first run.
func StartLinkCheckScheduler() {
	go func() {
		for {
			time.Sleep(durationUntilNextNoon())
			log.Println("Running scheduled link check")
			CheckAllLinks()
			log.Println("Scheduled link check complete")
		}
	}()
}

func durationUntilNextNoon() time.Duration {
	now := time.Now()
	next := time.Date(now.Year(), now.Month(), now.Day(), 12, 0, 0, 0, now.Location())
	if !next.After(now) {
		next = next.Add(24 * time.Hour)
	}
	return next.Sub(now)
}
