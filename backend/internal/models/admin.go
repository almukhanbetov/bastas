package models

type AdminUser struct {
	ID           string `db:"id" json:"id"`
	Email        string `db:"email" json:"email"`
	PasswordHash string `db:"password_hash" json:"-"`
	Role         string `db:"role" json:"role"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type MaterialInput struct {
	Slug          string  `json:"slug" binding:"required"`
	Name          string  `json:"name" binding:"required"`
	Category      string  `json:"category" binding:"required,oneof=natural engineered"`
	PriceUSDPerM2 float64 `json:"priceUsdPerM2" binding:"required,gt=0"`
	Description   string  `json:"description"`
	ImageURL      string  `json:"imageUrl"`
	SortOrder     int     `json:"sortOrder"`
}
