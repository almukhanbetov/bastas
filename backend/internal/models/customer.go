package models

import "time"

type Customer struct {
	ID        string    `db:"id" json:"id"`
	Name      string    `db:"name" json:"name"`
	Phone     string    `db:"phone" json:"phone"`
	Email     *string   `db:"email" json:"email,omitempty"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
}

type RegisterInput struct {
	Name     string `json:"name" binding:"required"`
	Phone    string `json:"phone" binding:"required"`
	Email    string `json:"email"`
	Password string `json:"password" binding:"required,min=6"`
}

type CustomerLoginInput struct {
	Phone    string `json:"phone" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Token    string   `json:"token"`
	Customer Customer `json:"customer"`
}
