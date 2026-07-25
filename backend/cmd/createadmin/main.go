// Утилита для создания первого админ-пользователя.
// Использование: go run ./cmd/createadmin -email admin@bastas.kz -password change-me
package main

import (
	"context"
	"flag"
	"log"

	"golang.org/x/crypto/bcrypt"

	"bastas-backend/internal/config"
	"bastas-backend/internal/db"
)

func main() {
	email := flag.String("email", "", "admin email")
	password := flag.String("password", "", "admin password")
	flag.Parse()

	if *email == "" || *password == "" {
		log.Fatal("both -email and -password are required")
	}

	cfg := config.Load()
	pool, err := db.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("db connect: %v", err)
	}
	defer pool.Close()

	hash, err := bcrypt.GenerateFromPassword([]byte(*password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("hash password: %v", err)
	}

	_, err = pool.Exec(context.Background(), `
		INSERT INTO admin_users (email, password_hash, role) VALUES ($1, $2, 'admin')
		ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
		*email, string(hash),
	)
	if err != nil {
		log.Fatalf("create admin: %v", err)
	}

	log.Printf("admin user ready: %s", *email)
}
