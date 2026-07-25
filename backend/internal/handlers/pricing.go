package handlers

import (
	"context"
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"bastas-backend/internal/models"
)

type PricingHandler struct {
	DB *pgxpool.Pool
}

func (h *PricingHandler) GetPricing(c *gin.Context) {
	ctx := c.Request.Context()

	materials, err := h.loadMaterials(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load materials"})
		return
	}

	thickness, err := h.loadThickness(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load thickness options"})
		return
	}

	edgeTypes, err := h.loadEdgeTypes(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load edge types"})
		return
	}

	services, err := h.loadServices(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load services"})
		return
	}

	usdRate, err := h.loadNumericSetting(ctx, "usd_rate", 550)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load usd_rate"})
		return
	}

	markup, err := h.loadNumericSetting(ctx, "markup", 1.3)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load markup"})
		return
	}

	cuttingPerM2, err := h.loadNumericSetting(ctx, "cutting_per_m2", 12000)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load cutting_per_m2"})
		return
	}

	c.JSON(http.StatusOK, models.PricingConfig{
		UsdRate:      usdRate,
		Markup:       markup,
		CuttingPerM2: cuttingPerM2,
		Materials:    materials,
		Thickness:    thickness,
		EdgeTypes:    edgeTypes,
		Services:     services,
	})
}

func (h *PricingHandler) loadMaterials(ctx context.Context) ([]models.Material, error) {
	rows, err := h.DB.Query(ctx, `
		SELECT id, slug, name, category, price_usd_per_m2, description, image_url, sort_order
		FROM materials WHERE is_active = true ORDER BY sort_order`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return pgx.CollectRows(rows, pgx.RowToStructByName[models.Material])
}

func (h *PricingHandler) loadThickness(ctx context.Context) ([]models.ThicknessOption, error) {
	rows, err := h.DB.Query(ctx, `
		SELECT id, value_mm, factor, sort_order
		FROM thickness_options WHERE is_active = true ORDER BY sort_order`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return pgx.CollectRows(rows, pgx.RowToStructByName[models.ThicknessOption])
}

func (h *PricingHandler) loadEdgeTypes(ctx context.Context) ([]models.EdgeType, error) {
	rows, err := h.DB.Query(ctx, `
		SELECT id, slug, name, price_per_meter, sort_order
		FROM edge_types WHERE is_active = true ORDER BY sort_order`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return pgx.CollectRows(rows, pgx.RowToStructByName[models.EdgeType])
}

func (h *PricingHandler) loadServices(ctx context.Context) ([]models.ServicePrice, error) {
	rows, err := h.DB.Query(ctx, `
		SELECT id, slug, name, price
		FROM service_prices WHERE is_active = true ORDER BY slug`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return pgx.CollectRows(rows, pgx.RowToStructByName[models.ServicePrice])
}

func (h *PricingHandler) loadNumericSetting(ctx context.Context, key string, fallback float64) (float64, error) {
	var value string
	err := h.DB.QueryRow(ctx, `SELECT value FROM settings WHERE key = $1`, key).Scan(&value)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return fallback, nil
		}
		return 0, err
	}
	parsed, err := strconv.ParseFloat(value, 64)
	if err != nil {
		return fallback, nil
	}
	return parsed, nil
}
