package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"bastas-backend/internal/models"
)

type ContentHandler struct {
	DB *pgxpool.Pool
}

// GetPageContent — GET /api/v1/content/:page (публичный).
func (h *ContentHandler) GetPageContent(c *gin.Context) {
	page := c.Param("page")

	rows, err := h.DB.Query(c.Request.Context(), `
		SELECT id, page, section_key, sort_order, title, subtitle, body, image_url, items, extra, updated_at
		FROM page_sections WHERE page = $1 ORDER BY sort_order`, page)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load page content"})
		return
	}
	defer rows.Close()

	sections, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.PageSection])
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read page content"})
		return
	}
	if sections == nil {
		sections = []models.PageSection{}
	}

	c.JSON(http.StatusOK, sections)
}

// ListSections — GET /api/v1/admin/content?page=home (защищено JWT).
func (h *ContentHandler) ListSections(c *gin.Context) {
	page := c.Query("page")
	ctx := c.Request.Context()

	var rows pgx.Rows
	var err error
	baseQuery := `SELECT id, page, section_key, sort_order, title, subtitle, body, image_url, items, extra, updated_at FROM page_sections %s ORDER BY page, sort_order`
	if page != "" {
		rows, err = h.DB.Query(ctx, fmt.Sprintf(baseQuery, "WHERE page = $1"), page)
	} else {
		rows, err = h.DB.Query(ctx, fmt.Sprintf(baseQuery, ""))
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load sections"})
		return
	}
	defer rows.Close()

	sections, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.PageSection])
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read sections"})
		return
	}
	if sections == nil {
		sections = []models.PageSection{}
	}

	c.JSON(http.StatusOK, sections)
}

// GetSection — GET /api/v1/admin/content/:id (защищено JWT).
func (h *ContentHandler) GetSection(c *gin.Context) {
	id := c.Param("id")

	var s models.PageSection
	err := h.DB.QueryRow(c.Request.Context(), `
		SELECT id, page, section_key, sort_order, title, subtitle, body, image_url, items, extra, updated_at
		FROM page_sections WHERE id = $1`, id,
	).Scan(&s.ID, &s.Page, &s.SectionKey, &s.SortOrder, &s.Title, &s.Subtitle, &s.Body, &s.ImageURL, &s.Items, &s.Extra, &s.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "section not found"})
		return
	}

	c.JSON(http.StatusOK, s)
}

func normalizeJSON(raw json.RawMessage, fallback string) json.RawMessage {
	if len(raw) == 0 {
		return json.RawMessage(fallback)
	}
	return raw
}

// CreateSection — POST /api/v1/admin/content (защищено JWT).
func (h *ContentHandler) CreateSection(c *gin.Context) {
	var input models.PageSectionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var s models.PageSection
	err := h.DB.QueryRow(c.Request.Context(), `
		INSERT INTO page_sections (page, section_key, sort_order, title, subtitle, body, image_url, items, extra)
		VALUES ($1,$2,$3, NULLIF($4,''), NULLIF($5,''), NULLIF($6,''), NULLIF($7,''), $8, $9)
		RETURNING id, page, section_key, sort_order, title, subtitle, body, image_url, items, extra, updated_at`,
		input.Page, input.SectionKey, input.SortOrder, input.Title, input.Subtitle, input.Body, input.ImageURL,
		normalizeJSON(input.Items, "[]"), normalizeJSON(input.Extra, "{}"),
	).Scan(&s.ID, &s.Page, &s.SectionKey, &s.SortOrder, &s.Title, &s.Subtitle, &s.Body, &s.ImageURL, &s.Items, &s.Extra, &s.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create section: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, s)
}

// UpdateSection — PUT /api/v1/admin/content/:id (защищено JWT).
func (h *ContentHandler) UpdateSection(c *gin.Context) {
	id := c.Param("id")

	var input models.PageSectionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var s models.PageSection
	err := h.DB.QueryRow(c.Request.Context(), `
		UPDATE page_sections SET
			page=$1, section_key=$2, sort_order=$3,
			title=NULLIF($4,''), subtitle=NULLIF($5,''), body=NULLIF($6,''), image_url=NULLIF($7,''),
			items=$8, extra=$9, updated_at=now()
		WHERE id=$10
		RETURNING id, page, section_key, sort_order, title, subtitle, body, image_url, items, extra, updated_at`,
		input.Page, input.SectionKey, input.SortOrder, input.Title, input.Subtitle, input.Body, input.ImageURL,
		normalizeJSON(input.Items, "[]"), normalizeJSON(input.Extra, "{}"), id,
	).Scan(&s.ID, &s.Page, &s.SectionKey, &s.SortOrder, &s.Title, &s.Subtitle, &s.Body, &s.ImageURL, &s.Items, &s.Extra, &s.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "section not found"})
		return
	}

	c.JSON(http.StatusOK, s)
}

// DeleteSection — DELETE /api/v1/admin/content/:id (защищено JWT).
func (h *ContentHandler) DeleteSection(c *gin.Context) {
	id := c.Param("id")

	tag, err := h.DB.Exec(c.Request.Context(), `DELETE FROM page_sections WHERE id=$1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete section"})
		return
	}
	if tag.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "section not found"})
		return
	}

	c.Status(http.StatusNoContent)
}
