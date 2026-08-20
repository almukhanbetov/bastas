package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"bastas-backend/internal/models"
)

type CatalogHandler struct {
	DB *pgxpool.Pool
}

// GetStones — GET /api/v1/catalog/stones, опционально ?slug=marble для одной позиции
// (используют SEO-лендинги /mramor-almaty и т.д., чтобы не тянуть весь каталог).
func (h *CatalogHandler) GetStones(c *gin.Context) {
	slug := c.Query("slug")

	var rows pgx.Rows
	var err error
	if slug != "" {
		rows, err = h.DB.Query(c.Request.Context(), `
			SELECT id, slug, name, tag, image_url, sort_order
			FROM stone_catalog WHERE is_active = true AND slug = $1 ORDER BY sort_order`, slug)
	} else {
		rows, err = h.DB.Query(c.Request.Context(), `
			SELECT id, slug, name, tag, image_url, sort_order
			FROM stone_catalog WHERE is_active = true ORDER BY sort_order`)
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load stone catalog"})
		return
	}
	defer rows.Close()

	items, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.StoneCatalogItem])
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read stone catalog"})
		return
	}
	if items == nil {
		items = []models.StoneCatalogItem{}
	}

	c.JSON(http.StatusOK, items)
}

// GetProducts — GET /api/v1/catalog/products, опционально ?slug=countertops для одной
// позиции (используют SEO-лендинги изделий из мрамора).
func (h *CatalogHandler) GetProducts(c *gin.Context) {
	slug := c.Query("slug")

	var rows pgx.Rows
	var err error
	if slug != "" {
		rows, err = h.DB.Query(c.Request.Context(), `
			SELECT id, slug, name, description, image_url, sort_order
			FROM product_types WHERE is_active = true AND slug = $1 ORDER BY sort_order`, slug)
	} else {
		rows, err = h.DB.Query(c.Request.Context(), `
			SELECT id, slug, name, description, image_url, sort_order
			FROM product_types WHERE is_active = true ORDER BY sort_order`)
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load product types"})
		return
	}
	defer rows.Close()

	items, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.ProductType])
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read product types"})
		return
	}
	if items == nil {
		items = []models.ProductType{}
	}

	c.JSON(http.StatusOK, items)
}

// --- Админские эндпоинты (защищены JWT) ---
// В отличие от публичных Get*, здесь возвращаются и неактивные записи —
// админу нужно видеть всё, чтобы включать/выключать и редактировать.

func (h *CatalogHandler) AdminListStones(c *gin.Context) {
	rows, err := h.DB.Query(c.Request.Context(), `
		SELECT id, slug, name, tag, image_url, sort_order FROM stone_catalog ORDER BY sort_order`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load stone catalog"})
		return
	}
	defer rows.Close()

	items, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.StoneCatalogItem])
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read stone catalog"})
		return
	}
	if items == nil {
		items = []models.StoneCatalogItem{}
	}
	c.JSON(http.StatusOK, items)
}

func (h *CatalogHandler) CreateStone(c *gin.Context) {
	var input models.StoneCatalogInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var s models.StoneCatalogItem
	err := h.DB.QueryRow(c.Request.Context(), `
		INSERT INTO stone_catalog (slug, name, tag, image_url, sort_order)
		VALUES ($1,$2,NULLIF($3,''),NULLIF($4,''),$5)
		RETURNING id, slug, name, tag, image_url, sort_order`,
		input.Slug, input.Name, input.Tag, input.ImageURL, input.SortOrder,
	).Scan(&s.ID, &s.Slug, &s.Name, &s.Tag, &s.ImageURL, &s.SortOrder)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create stone: " + err.Error()})
		return
	}
	c.JSON(http.StatusCreated, s)
}

func (h *CatalogHandler) UpdateStone(c *gin.Context) {
	id := c.Param("id")
	var input models.StoneCatalogInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var s models.StoneCatalogItem
	err := h.DB.QueryRow(c.Request.Context(), `
		UPDATE stone_catalog SET slug=$1, name=$2, tag=NULLIF($3,''), image_url=NULLIF($4,''), sort_order=$5
		WHERE id=$6
		RETURNING id, slug, name, tag, image_url, sort_order`,
		input.Slug, input.Name, input.Tag, input.ImageURL, input.SortOrder, id,
	).Scan(&s.ID, &s.Slug, &s.Name, &s.Tag, &s.ImageURL, &s.SortOrder)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "stone not found"})
		return
	}
	c.JSON(http.StatusOK, s)
}

func (h *CatalogHandler) DeleteStone(c *gin.Context) {
	id := c.Param("id")
	tag, err := h.DB.Exec(c.Request.Context(), `DELETE FROM stone_catalog WHERE id=$1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete stone"})
		return
	}
	if tag.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "stone not found"})
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *CatalogHandler) AdminListProducts(c *gin.Context) {
	rows, err := h.DB.Query(c.Request.Context(), `
		SELECT id, slug, name, description, image_url, sort_order FROM product_types ORDER BY sort_order`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load product types"})
		return
	}
	defer rows.Close()

	items, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.ProductType])
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read product types"})
		return
	}
	if items == nil {
		items = []models.ProductType{}
	}
	c.JSON(http.StatusOK, items)
}

func (h *CatalogHandler) CreateProduct(c *gin.Context) {
	var input models.ProductTypeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var p models.ProductType
	err := h.DB.QueryRow(c.Request.Context(), `
		INSERT INTO product_types (slug, name, description, image_url, sort_order)
		VALUES ($1,$2,NULLIF($3,''),NULLIF($4,''),$5)
		RETURNING id, slug, name, description, image_url, sort_order`,
		input.Slug, input.Name, input.Description, input.ImageURL, input.SortOrder,
	).Scan(&p.ID, &p.Slug, &p.Name, &p.Description, &p.ImageURL, &p.SortOrder)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create product: " + err.Error()})
		return
	}
	c.JSON(http.StatusCreated, p)
}

func (h *CatalogHandler) UpdateProduct(c *gin.Context) {
	id := c.Param("id")
	var input models.ProductTypeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var p models.ProductType
	err := h.DB.QueryRow(c.Request.Context(), `
		UPDATE product_types SET slug=$1, name=$2, description=NULLIF($3,''), image_url=NULLIF($4,''), sort_order=$5
		WHERE id=$6
		RETURNING id, slug, name, description, image_url, sort_order`,
		input.Slug, input.Name, input.Description, input.ImageURL, input.SortOrder, id,
	).Scan(&p.ID, &p.Slug, &p.Name, &p.Description, &p.ImageURL, &p.SortOrder)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *CatalogHandler) DeleteProduct(c *gin.Context) {
	id := c.Param("id")
	tag, err := h.DB.Exec(c.Request.Context(), `DELETE FROM product_types WHERE id=$1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete product"})
		return
	}
	if tag.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
		return
	}
	c.Status(http.StatusNoContent)
}
