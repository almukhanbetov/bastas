package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"net/http"
	"regexp"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	"bastas-backend/internal/models"
)

type OrdersHandler struct {
	DB *pgxpool.Pool
}

// dbtx удовлетворяют и *pgxpool.Pool, и pgx.Tx — так поисковые/проверочные запросы
// работают одинаково что вне транзакции (GET/PATCH), что внутри (CreateOrder).
type dbtx interface {
	Query(ctx context.Context, sql string, args ...any) (pgx.Rows, error)
	QueryRow(ctx context.Context, sql string, args ...any) pgx.Row
	Exec(ctx context.Context, sql string, args ...any) (pgconn.CommandTag, error)
}

// customerIDFromContext достаёт customerID, если запрос пришёл с валидным
// customer-токеном (см. middleware.OptionalCustomerAuth) — для гостевого
// чекаута его просто не будет, и заказ создастся с customer_id = NULL.
func customerIDFromContext(c *gin.Context) any {
	v, exists := c.Get("customerID")
	if !exists {
		return nil
	}
	return v
}

var phoneDigitsRe = regexp.MustCompile(`\D+`)

// normalizePhone приводит любой ввод к формату +7XXXXXXXXXX (KZ/RU).
func normalizePhone(raw string) (string, error) {
	digits := phoneDigitsRe.ReplaceAllString(raw, "")
	if len(digits) == 11 && (digits[0] == '7' || digits[0] == '8') {
		return "+7" + digits[1:], nil
	}
	if len(digits) == 10 {
		return "+7" + digits, nil
	}
	return "", fmt.Errorf("phone must look like +7 XXX XXX XX XX")
}

type materialRow struct {
	Name     string
	Category *string
	PriceUSD float64
	IsActive bool
}

func (h *OrdersHandler) loadMaterial(ctx context.Context, tx dbtx, id string) (*materialRow, error) {
	var m materialRow
	err := tx.QueryRow(ctx, `
		SELECT name, category, price_usd_per_m2, is_active FROM materials WHERE id = $1`, id,
	).Scan(&m.Name, &m.Category, &m.PriceUSD, &m.IsActive)
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (h *OrdersHandler) loadThicknessFactor(ctx context.Context, tx dbtx, valueMM int) (float64, error) {
	var factor float64
	var isActive bool
	err := tx.QueryRow(ctx, `
		SELECT factor, is_active FROM thickness_options WHERE value_mm = $1`, valueMM,
	).Scan(&factor, &isActive)
	if err != nil {
		return 0, err
	}
	if !isActive {
		return 0, fmt.Errorf("thickness %d is not active", valueMM)
	}
	return factor, nil
}

type edgeRow struct {
	Name          string
	PricePerMeter float64
	IsActive      bool
}

func (h *OrdersHandler) loadEdgeType(ctx context.Context, tx dbtx, slug string) (*edgeRow, error) {
	var e edgeRow
	err := tx.QueryRow(ctx, `
		SELECT name, price_per_meter, is_active FROM edge_types WHERE slug = $1`, slug,
	).Scan(&e.Name, &e.PricePerMeter, &e.IsActive)
	if err != nil {
		return nil, err
	}
	if !e.IsActive {
		return nil, fmt.Errorf("edge type %s is not active", slug)
	}
	return &e, nil
}

func (h *OrdersHandler) loadServicePrices(ctx context.Context, tx dbtx) (map[string]float64, error) {
	rows, err := tx.Query(ctx, `SELECT slug, price FROM service_prices WHERE is_active = true`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	prices := make(map[string]float64)
	for rows.Next() {
		var slug string
		var price float64
		if err := rows.Scan(&slug, &price); err != nil {
			return nil, err
		}
		prices[slug] = price
	}
	return prices, rows.Err()
}

func (h *OrdersHandler) loadNumericSetting(ctx context.Context, tx dbtx, key string, fallback float64) (float64, error) {
	var value string
	err := tx.QueryRow(ctx, `SELECT value FROM settings WHERE key = $1`, key).Scan(&value)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return fallback, nil
		}
		return 0, err
	}
	var parsed float64
	if _, err := fmt.Sscanf(value, "%f", &parsed); err != nil {
		return fallback, nil
	}
	return parsed, nil
}

// computedItem — результат пересчёта одной позиции по актуальным ценам из БД.
type computedItem struct {
	input             models.OrderItemInput
	materialName      string
	stoneType         *string
	edgePricePerMeter float64
	materialPriceUSD  float64
	materialCost      int64
	cuttingCost       int64
	edgeCost          int64
	servicesCost      int64
	unitTotal         int64
	lineTotal         int64
}

func round(v float64) int64 {
	return int64(math.Round(v))
}

// CreateOrder — POST /api/v1/orders (публичный).
// Клиент присылает ТОЛЬКО параметры изделия (материал/толщина/площадь/...).
// Все цены backend подтягивает из БД заново и сам считает totalPrice —
// значения, присланные с фронта, никогда не используются для денег.
func (h *OrdersHandler) CreateOrder(c *gin.Context) {
	var input models.CreateOrderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	phone, err := normalizePhone(input.Customer.Phone)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "телефон должен быть в формате +7 XXX XXX XX XX"})
		return
	}

	ctx := c.Request.Context()

	tx, err := h.DB.Begin(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to start transaction"})
		return
	}
	defer tx.Rollback(ctx) // no-op после успешного Commit

	usdRate, err := h.loadNumericSetting(ctx, tx, "usd_rate", 550)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load usd_rate"})
		return
	}
	markup, err := h.loadNumericSetting(ctx, tx, "markup", 1.3)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load markup"})
		return
	}
	cuttingPerM2, err := h.loadNumericSetting(ctx, tx, "cutting_per_m2", 12000)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load cutting_per_m2"})
		return
	}
	services, err := h.loadServicePrices(ctx, tx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load service prices"})
		return
	}

	computed := make([]computedItem, 0, len(input.Items))
	var subtotal int64

	for i, item := range input.Items {
		if item.Quantity <= 0 {
			item.Quantity = 1
		}
		if item.EdgeLength < 0 || item.SinkCutoutCount < 0 || item.HobCutoutCount < 0 || item.HolesCount < 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("item %d: negative values are not allowed", i)})
			return
		}

		material, err := h.loadMaterial(ctx, tx, item.MaterialID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("item %d: material not found", i)})
			return
		}
		if !material.IsActive {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("item %d: material %q is not available", i, material.Name)})
			return
		}

		thicknessFactor, err := h.loadThicknessFactor(ctx, tx, item.Thickness)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("item %d: thickness %dmm not found", i, item.Thickness)})
			return
		}

		edgeSlug := item.EdgeType
		if edgeSlug == "" {
			edgeSlug = "none"
		}
		edge, err := h.loadEdgeType(ctx, tx, edgeSlug)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("item %d: edge type %q not found", i, edgeSlug)})
			return
		}

		materialCost := round(item.Area * material.PriceUSD * usdRate * markup * thicknessFactor)
		cuttingCost := round(item.Area * cuttingPerM2)
		edgeCost := round(item.EdgeLength * edge.PricePerMeter)

		sinkCost := int64(item.SinkCutoutCount) * round(services["sink_cutout"])
		hobCost := int64(item.HobCutoutCount) * round(services["hob_cutout"])
		holesCost := int64(item.HolesCount) * round(services["hole"])
		var installCost, deliveryCost int64
		if item.Installation {
			installCost = round(services["installation"])
		}
		if item.Delivery {
			deliveryCost = round(services["delivery"])
		}
		servicesCost := sinkCost + hobCost + holesCost + installCost + deliveryCost

		unitTotal := materialCost + cuttingCost + edgeCost + servicesCost
		lineTotal := unitTotal * int64(item.Quantity)
		subtotal += lineTotal

		computed = append(computed, computedItem{
			input:             item,
			materialName:      material.Name,
			stoneType:         material.Category,
			edgePricePerMeter: edge.PricePerMeter,
			materialPriceUSD:  material.PriceUSD,
			materialCost:      materialCost,
			cuttingCost:       cuttingCost,
			edgeCost:          edgeCost,
			servicesCost:      servicesCost,
			unitTotal:         unitTotal,
			lineTotal:         lineTotal,
		})
	}

	totalAmount := subtotal // отдельных скидок/наценок на уровне заказа пока нет

	var seq int64
	if err := tx.QueryRow(ctx, `SELECT nextval('order_number_seq')`).Scan(&seq); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate order number"})
		return
	}
	orderNumber := fmt.Sprintf("BST-%s-%04d", time.Now().Format("20060102"), seq)

	var order models.Order
	err = tx.QueryRow(ctx, `
		INSERT INTO orders (order_number, customer_name, customer_phone, customer_email, city, address, comment, subtotal, total_amount, customer_id)
		VALUES ($1, $2, $3, NULLIF($4, ''), NULLIF($5, ''), NULLIF($6, ''), NULLIF($7, ''), $8, $9, $10)
		RETURNING id, order_number, status, total_amount`,
		orderNumber, input.Customer.Name, phone, input.Customer.Email, input.Customer.City, input.Customer.Address, input.Customer.Comment, subtotal, totalAmount, customerIDFromContext(c),
	).Scan(&order.ID, &order.OrderNumber, &order.Status, &order.TotalAmount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create order"})
		return
	}

	for _, ci := range computed {
		configJSON, _ := json.Marshal(map[string]any{
			"sinkCutoutCount": ci.input.SinkCutoutCount,
			"hobCutoutCount":  ci.input.HobCutoutCount,
			"holesCount":      ci.input.HolesCount,
			"installation":    ci.input.Installation,
			"delivery":        ci.input.Delivery,
		})

		edgeSlug := ci.input.EdgeType
		if edgeSlug == "" {
			edgeSlug = "none"
		}

		_, err = tx.Exec(ctx, `
			INSERT INTO order_items (
				order_id, material_id, material_name, stone_type, thickness, area,
				edge_type, edge_length, quantity,
				material_price_usd, usd_rate, markup,
				cutting_price_per_m2, edge_price_per_meter,
				material_cost, cutting_cost, edge_cost, services_cost,
				unit_total, line_total, configuration
			) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
			order.ID, ci.input.MaterialID, ci.materialName, ci.stoneType, ci.input.Thickness, ci.input.Area,
			edgeSlug, ci.input.EdgeLength, ci.input.Quantity,
			ci.materialPriceUSD, usdRate, markup,
			round(cuttingPerM2), round(ci.edgePricePerMeter),
			ci.materialCost, ci.cuttingCost, ci.edgeCost, ci.servicesCost,
			ci.unitTotal, ci.lineTotal, configJSON,
		)
		if err != nil {
			// откатываем ВЕСЬ заказ, если хотя бы одна позиция не сохранилась
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save order item, order was not created"})
			return
		}
	}

	if err := tx.Commit(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to commit order"})
		return
	}

	c.JSON(http.StatusCreated, models.CreateOrderResponse{
		ID:          order.ID,
		OrderNumber: order.OrderNumber,
		Status:      order.Status,
		TotalAmount: order.TotalAmount,
	})
}

var validOrderStatuses = map[string]bool{
	"new": true, "confirmed": true, "in_production": true,
	"ready": true, "completed": true, "cancelled": true,
}

// ListOrders — GET /api/v1/admin/orders?status=new (защищено JWT).
func (h *OrdersHandler) ListOrders(c *gin.Context) {
	status := c.Query("status")
	if status != "" && !validOrderStatuses[status] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid status filter"})
		return
	}

	ctx := c.Request.Context()
	baseQuery := `
		SELECT o.id, o.order_number, o.customer_name, o.customer_phone, o.city,
		       COUNT(oi.id) AS items_count, o.total_amount, o.status, o.created_at
		FROM orders o
		LEFT JOIN order_items oi ON oi.order_id = o.id
		%s
		GROUP BY o.id
		ORDER BY o.created_at DESC
		LIMIT 200`

	var rows pgx.Rows
	var err error
	if status != "" {
		rows, err = h.DB.Query(ctx, fmt.Sprintf(baseQuery, "WHERE o.status = $1"), status)
	} else {
		rows, err = h.DB.Query(ctx, fmt.Sprintf(baseQuery, ""))
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load orders"})
		return
	}
	defer rows.Close()

	orders, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.OrderListItem])
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read orders"})
		return
	}
	if orders == nil {
		orders = []models.OrderListItem{}
	}

	c.JSON(http.StatusOK, orders)
}

// GetOrder — GET /api/v1/admin/orders/:id (защищено JWT).
func (h *OrdersHandler) GetOrder(c *gin.Context) {
	id := c.Param("id")
	ctx := c.Request.Context()

	var order models.Order
	err := h.DB.QueryRow(ctx, `
		SELECT id, order_number, customer_name, customer_phone, customer_email, city, address, comment,
		       subtotal, total_amount, status, created_at, updated_at
		FROM orders WHERE id = $1`, id,
	).Scan(&order.ID, &order.OrderNumber, &order.CustomerName, &order.CustomerPhone, &order.CustomerEmail,
		&order.City, &order.Address, &order.Comment, &order.Subtotal, &order.TotalAmount,
		&order.Status, &order.CreatedAt, &order.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
		return
	}

	rows, err := h.DB.Query(ctx, `
		SELECT id, order_id, material_id, material_name, stone_type, thickness, area,
		       edge_type, edge_length, quantity, material_price_usd, usd_rate, markup,
		       cutting_price_per_m2, edge_price_per_meter, material_cost, cutting_cost,
		       edge_cost, services_cost, unit_total, line_total, configuration, created_at
		FROM order_items WHERE order_id = $1 ORDER BY created_at`, order.ID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load order items"})
		return
	}
	defer rows.Close()

	items, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.OrderItem])
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read order items"})
		return
	}

	c.JSON(http.StatusOK, models.OrderDetail{Order: order, Items: items})
}

// UpdateOrderStatus — PATCH /api/v1/admin/orders/:id/status (защищено JWT).
func (h *OrdersHandler) UpdateOrderStatus(c *gin.Context) {
	id := c.Param("id")

	var input models.UpdateOrderStatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tag, err := h.DB.Exec(c.Request.Context(),
		`UPDATE orders SET status = $1, updated_at = now() WHERE id = $2`, input.Status, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update order"})
		return
	}
	if tag.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": input.Status})
}
