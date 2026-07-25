package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"bastas-backend/internal/models"
)

type LeadsHandler struct {
	DB *pgxpool.Pool
}

func (h *LeadsHandler) CreateLead(c *gin.Context) {
	var input models.CreateLeadInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var lead models.Lead
	err := h.DB.QueryRow(c.Request.Context(), `
		INSERT INTO leads (source, name, phone, email, message, calculation_snapshot)
		VALUES ($1, NULLIF($2, ''), $3, NULLIF($4, ''), NULLIF($5, ''), $6)
		RETURNING id, source, name, phone, email, message, calculation_snapshot, status, created_at`,
		input.Source, input.Name, input.Phone, input.Email, input.Message, nullableJSON(input.CalculationSnapshot),
	).Scan(&lead.ID, &lead.Source, &lead.Name, &lead.Phone, &lead.Email, &lead.Message, &lead.CalculationSnapshot, &lead.Status, &lead.CreatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save lead"})
		return
	}

	c.JSON(http.StatusCreated, lead)
}

func (h *LeadsHandler) ListLeads(c *gin.Context) {
	rows, err := h.DB.Query(c.Request.Context(), `
		SELECT id, source, name, phone, email, message, calculation_snapshot, status, created_at
		FROM leads ORDER BY created_at DESC LIMIT 200`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load leads"})
		return
	}
	defer rows.Close()

	leads, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.Lead])
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read leads"})
		return
	}

	c.JSON(http.StatusOK, leads)
}

func (h *LeadsHandler) UpdateLeadStatus(c *gin.Context) {
	id := c.Param("id")

	var input models.UpdateLeadStatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tag, err := h.DB.Exec(c.Request.Context(), `UPDATE leads SET status = $1 WHERE id = $2`, input.Status, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update lead"})
		return
	}
	if tag.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "lead not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": input.Status})
}

func nullableJSON(raw []byte) any {
	if len(raw) == 0 {
		return nil
	}
	return raw
}
