package main

import (
	"errors"
	"log"
	"os"
	"strings"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/pgx/v5"
	_ "github.com/golang-migrate/migrate/v4/source/file"

	"bastas-backend/internal/config"
)

func main() {
	cfg := config.Load()

	direction := "up"
	if len(os.Args) > 1 {
		direction = os.Args[1]
	}

	// golang-migrate's pgx/v5 driver registers under the "pgx5" scheme.
	migrateDSN := "pgx5://" + strings.TrimPrefix(strings.TrimPrefix(cfg.DatabaseURL, "postgres://"), "postgresql://")

	m, err := migrate.New("file://migrations", migrateDSN)
	if err != nil {
		log.Fatalf("migrate init: %v", err)
	}

	switch direction {
	case "up":
		err = m.Up()
	case "down":
		err = m.Down()
	default:
		log.Fatalf("unknown direction %q, use \"up\" or \"down\"", direction)
	}

	if err != nil && !errors.Is(err, migrate.ErrNoChange) {
		log.Fatalf("migrate %s: %v", direction, err)
	}

	log.Printf("migrate %s: done", direction)
}
