package main

import (
	"log"
	"net/http"
	"time"

	"github.com/DanDo385/blackjack/backend/internal/handlers"
	"github.com/DanDo385/blackjack/backend/internal/storage"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	// Initialize databases
	if err := storage.InitPostgres(); err != nil {
		log.Fatalf("Failed to init postgres: %v", err)
	}
	defer storage.ClosePostgres()

	if err := storage.InitRedis(); err != nil {
		log.Fatalf("Failed to init redis: %v", err)
	}
	defer storage.CloseRedis()

	r := chi.NewRouter()
	r.Use(middleware.RequestID, middleware.RealIP, middleware.Logger, middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))

	// Engine / Game
	r.Get("/api/engine/state", handlers.GetEngineState)
	r.Post("/api/engine/bet", handlers.PostBet)

	// Treasury
	r.Get("/api/treasury/overview", handlers.GetTreasuryOverview)

	// User
	r.Get("/api/user/summary", handlers.GetUserSummary)
	r.Get("/api/user/hands", handlers.GetUserHands)

	log.Println("dev api on :8080")
	http.ListenAndServe(":8080", r)
}
