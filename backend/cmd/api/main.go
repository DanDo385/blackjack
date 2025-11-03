package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/DanDo385/blackjack/backend/internal/contracts"
	"github.com/DanDo385/blackjack/backend/internal/handlers"
	"github.com/DanDo385/blackjack/backend/internal/storage"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file from project root (optional, will use defaults if not found)
	// When running from backend/ directory, .env is at ../.env
	_ = godotenv.Load("../.env")
	// Fallback to current directory if .env is in backend/
	_ = godotenv.Load()
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
	
	// CORS configuration - must be before other middleware
	allowedOrigin := os.Getenv("FRONTEND_URL")
	if allowedOrigin == "" {
		// Default to localhost:3000 for development
		allowedOrigin = "http://localhost:3000"
	}
	
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{allowedOrigin},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not to exceed preflight request cache duration
		Debug:            false, // Set to true for debugging CORS issues
	}))
	
	r.Use(middleware.RequestID, middleware.RealIP, middleware.Logger, middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))

	// Engine / Game
	r.Get("/api/engine/state", handlers.GetEngineState)
	r.Post("/api/engine/bet", handlers.PostBet)
	r.Post("/api/game/resolve", handlers.PostResolve)

	// Game actions
	r.Post("/api/game/hit", handlers.PostHit)
	r.Post("/api/game/stand", handlers.PostStand)
	r.Post("/api/game/split", handlers.PostSplit)
	r.Post("/api/game/double", handlers.PostDouble)
	r.Post("/api/game/insurance", handlers.PostInsurance)
	r.Post("/api/game/cashout", handlers.PostCashOut)

	// Treasury
	r.Get("/api/treasury/overview", handlers.GetTreasuryOverview)

	// User
	r.Get("/api/user/summary", handlers.GetUserSummary)
	r.Get("/api/user/hands", handlers.GetUserHands)

	// Start event watcher if TABLE_ADDRESS is configured
	tableAddr := os.Getenv("TABLE_ADDRESS")
	if tableAddr != "" {
		watcher, err := contracts.NewEventWatcher(tableAddr)
		if err != nil {
			log.Printf("Warning: Failed to start event watcher: %v", err)
		} else {
			ctx := context.Background()
			watcher.Start(ctx)
			log.Println("Event watcher started for table:", tableAddr)
			defer watcher.Stop()
		}
	}

	log.Println("dev api on :8080")
	http.ListenAndServe(":8080", r)
}
