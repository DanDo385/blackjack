package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/DanDo385/blackjack/backend/internal/contracts"
	"github.com/DanDo385/blackjack/backend/internal/handlers"
	"github.com/go-chi/chi/v5"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file from project root (optional, will use defaults if not found)
	// When running from backend/ directory, .env is at ../.env
	_ = godotenv.Load("../.env")
	// Fallback to current directory if .env is in backend/
	_ = godotenv.Load()

	r := chi.NewRouter()
	
	// CORS configuration - must be before other middleware
	allowedOrigin := os.Getenv("FRONTEND_URL")
	if allowedOrigin == "" {
		// Default to localhost:3000 for development
		allowedOrigin = "http://localhost:3000"
	}
	
	// r.Use(cors.Handler(cors.Options{ // Temporarily disabled
	// 	AllowedOrigins:   []string{allowedOrigin},
	// 	AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
	// 	AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
	// 	ExposedHeaders:   []string{"Link"},
	// 	AllowCredentials: true,
	// 	MaxAge:           300, // Maximum value not to exceed preflight request cache duration
	// 	Debug:            false, // Set to true for debugging CORS issues
	// }))
	
	// r.Use(middleware.RequestID, middleware.RealIP, middleware.Logger, middleware.Recoverer)
	// r.Use(middleware.Timeout(30 * time.Second)) // All middleware disabled

	// Engine / Game
	r.Get("/api/engine/state", handlers.GetEngineState)
	r.Post("/api/engine/bet", handlers.PostBet)
	r.Post("/api/game/resolve", handlers.PostResolve)

	// Test route
	r.Get("/test", func(w http.ResponseWriter, r *http.Request) {
		log.Println("Test route called")
		w.Write([]byte("test ok"))
	})

	// Test handler function
	testHandler := func(w http.ResponseWriter, r *http.Request) {
		log.Println("Test handler called")
		w.Write([]byte("handler ok"))
	}
	r.Get("/handler", testHandler)

	// Game actions
	r.Post("/api/game/hit", handlers.PostHit)
	r.Post("/api/game/stand", handlers.PostStand)
	r.Post("/api/game/split", handlers.PostSplit)
	r.Post("/api/game/double", handlers.PostDouble)
	r.Post("/api/game/insurance", handlers.PostInsurance)
	r.Post("/api/game/cashout", handlers.PostCashOut)

	log.Println("Registered game routes: /api/game/*")

	// Treasury
	r.Get("/api/treasury/overview", handlers.GetTreasuryOverview)

	// User
	r.Get("/api/user/summary", handlers.GetUserSummary)
	r.Get("/api/user/hands", handlers.GetUserHands)

	// Start event watcher if TABLE_ADDRESS is configured (or found in Foundry broadcast)
	tableAddr := contracts.GetTableAddress()
	if tableAddr != "" {
		watcher, err := contracts.NewEventWatcher(tableAddr)
		if err != nil {
			log.Printf("Warning: Failed to start event watcher: %v", err)
		} else {
			ctx := context.Background()
			watcher.Start(ctx)
			log.Printf("Event watcher started for table: %s", tableAddr)
			defer watcher.Stop()
		}
	} else {
		log.Println("No TABLE_ADDRESS found - event watcher disabled (set TABLE_ADDRESS env var or deploy contracts)")
	}

	log.Println("dev api on :8080")
	log.Printf("Router has routes registered")

	log.Fatal(http.ListenAndServe(":8080", r))
}
