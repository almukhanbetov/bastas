package handlers

import (
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"

	"bastas-backend/internal/models"
)

type AdminHandler struct {
	DB        *pgxpool.Pool
	JWTSecret string
}

func (h *AdminHandler) Login(c *gin.Context) {
	var input models.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.AdminUser
	err := h.DB.QueryRow(c.Request.Context(), `
		SELECT id, email, password_hash, role FROM admin_users WHERE email = $1`, input.Email,
	).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Role)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	claims := jwt.MapClaims{
		"sub":   user.ID,
		"email": user.Email,
		"role":  user.Role,
		"exp":   time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(h.JWTSecret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to sign token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": signed, "user": user})
}

func (h *AdminHandler) AdminListMaterials(c *gin.Context) {
	rows, err := h.DB.Query(c.Request.Context(), `
		SELECT id, slug, name, category, price_usd_per_m2, description, image_url, sort_order
		FROM materials ORDER BY sort_order`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load materials"})
		return
	}
	defer rows.Close()

	materials, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.Material])
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read materials"})
		return
	}
	if materials == nil {
		materials = []models.Material{}
	}
	c.JSON(http.StatusOK, materials)
}

func (h *AdminHandler) CreateMaterial(c *gin.Context) {
	var input models.MaterialInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var m models.Material
	err := h.DB.QueryRow(c.Request.Context(), `
		INSERT INTO materials (slug, name, category, price_usd_per_m2, description, image_url, sort_order)
		VALUES ($1, $2, $3, $4, NULLIF($5, ''), NULLIF($6, ''), $7)
		RETURNING id, slug, name, category, price_usd_per_m2, description, image_url, sort_order`,
		input.Slug, input.Name, input.Category, input.PriceUSDPerM2, input.Description, input.ImageURL, input.SortOrder,
	).Scan(&m.ID, &m.Slug, &m.Name, &m.Category, &m.PriceUSDPerM2, &m.Description, &m.ImageURL, &m.SortOrder)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create material"})
		return
	}

	c.JSON(http.StatusCreated, m)
}

func (h *AdminHandler) UpdateMaterial(c *gin.Context) {
	id := c.Param("id")

	var input models.MaterialInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var m models.Material
	err := h.DB.QueryRow(c.Request.Context(), `
		UPDATE materials SET slug=$1, name=$2, category=$3, price_usd_per_m2=$4,
			description=NULLIF($5,''), image_url=NULLIF($6,''), sort_order=$7, updated_at=now()
		WHERE id=$8
		RETURNING id, slug, name, category, price_usd_per_m2, description, image_url, sort_order`,
		input.Slug, input.Name, input.Category, input.PriceUSDPerM2, input.Description, input.ImageURL, input.SortOrder, id,
	).Scan(&m.ID, &m.Slug, &m.Name, &m.Category, &m.PriceUSDPerM2, &m.Description, &m.ImageURL, &m.SortOrder)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "material not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update material"})
		return
	}

	c.JSON(http.StatusOK, m)
}

func (h *AdminHandler) DeleteMaterial(c *gin.Context) {
	id := c.Param("id")
	tag, err := h.DB.Exec(c.Request.Context(), `DELETE FROM materials WHERE id=$1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete material"})
		return
	}
	if tag.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "material not found"})
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *AdminHandler) UpdateSetting(c *gin.Context) {
	key := c.Param("key")

	var input struct {
		Value string `json:"value" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := h.DB.Exec(c.Request.Context(), `
		INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, now())
		ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
		key, input.Value,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update setting"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"key": key, "value": input.Value})
}
