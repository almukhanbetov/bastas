package handlers

import (
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"

	"bastas-backend/internal/models"
)

type CustomersHandler struct {
	DB        *pgxpool.Pool
	JWTSecret string
}

// customer-токен живёт дольше админского (30 дней) — это личный кабинет
// покупателя, не рабочая сессия сотрудника, повторный логин каждый день неуместен.
func (h *CustomersHandler) issueToken(customer models.Customer) (string, error) {
	claims := jwt.MapClaims{
		"sub":   customer.ID,
		"phone": customer.Phone,
		"role":  "customer",
		"exp":   time.Now().Add(30 * 24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(h.JWTSecret))
}

func (h *CustomersHandler) Register(c *gin.Context) {
	var input models.RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	phone, err := normalizePhone(input.Phone)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "телефон должен быть в формате +7 XXX XXX XX XX"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	var customer models.Customer
	err = h.DB.QueryRow(c.Request.Context(), `
		INSERT INTO customers (name, phone, email, password_hash)
		VALUES ($1, $2, NULLIF($3, ''), $4)
		RETURNING id, name, phone, email, created_at`,
		input.Name, phone, input.Email, string(hash),
	).Scan(&customer.ID, &customer.Name, &customer.Phone, &customer.Email, &customer.CreatedAt)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			c.JSON(http.StatusConflict, gin.H{"error": "аккаунт с этим номером телефона уже существует"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create account"})
		return
	}

	token, err := h.issueToken(customer)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to sign token"})
		return
	}

	c.JSON(http.StatusCreated, models.AuthResponse{Token: token, Customer: customer})
}

func (h *CustomersHandler) Login(c *gin.Context) {
	var input models.CustomerLoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	phone, err := normalizePhone(input.Phone)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "неверный телефон или пароль"})
		return
	}

	var customer models.Customer
	var passwordHash string
	err = h.DB.QueryRow(c.Request.Context(), `
		SELECT id, name, phone, email, password_hash, created_at FROM customers WHERE phone = $1`, phone,
	).Scan(&customer.ID, &customer.Name, &customer.Phone, &customer.Email, &passwordHash, &customer.CreatedAt)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "неверный телефон или пароль"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "неверный телефон или пароль"})
		return
	}

	token, err := h.issueToken(customer)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to sign token"})
		return
	}

	c.JSON(http.StatusOK, models.AuthResponse{Token: token, Customer: customer})
}

func (h *CustomersHandler) Me(c *gin.Context) {
	customerID, _ := c.Get("customerID")

	var customer models.Customer
	err := h.DB.QueryRow(c.Request.Context(), `
		SELECT id, name, phone, email, created_at FROM customers WHERE id = $1`, customerID,
	).Scan(&customer.ID, &customer.Name, &customer.Phone, &customer.Email, &customer.CreatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "customer not found"})
		return
	}

	c.JSON(http.StatusOK, customer)
}

// MyOrders — GET /api/v1/me/orders (защищено customer-JWT).
func (h *CustomersHandler) MyOrders(c *gin.Context) {
	customerID, _ := c.Get("customerID")

	rows, err := h.DB.Query(c.Request.Context(), `
		SELECT o.id, o.order_number, o.customer_name, o.customer_phone, o.city,
		       COUNT(oi.id) AS items_count, o.total_amount, o.status, o.created_at
		FROM orders o
		LEFT JOIN order_items oi ON oi.order_id = o.id
		WHERE o.customer_id = $1
		GROUP BY o.id
		ORDER BY o.created_at DESC`, customerID)
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

// MyOrderDetail — GET /api/v1/me/orders/:id (защищено customer-JWT).
// customer_id проверяется прямо в WHERE — чужой заказ вернёт 404, даже если
// покупатель знает/подберёт его UUID.
func (h *CustomersHandler) MyOrderDetail(c *gin.Context) {
	customerID, _ := c.Get("customerID")
	id := c.Param("id")

	var order models.Order
	err := h.DB.QueryRow(c.Request.Context(), `
		SELECT id, order_number, customer_name, customer_phone, customer_email, city, address, comment,
		       subtotal, total_amount, status, created_at, updated_at
		FROM orders WHERE id = $1 AND customer_id = $2`, id, customerID,
	).Scan(&order.ID, &order.OrderNumber, &order.CustomerName, &order.CustomerPhone, &order.CustomerEmail,
		&order.City, &order.Address, &order.Comment, &order.Subtotal, &order.TotalAmount,
		&order.Status, &order.CreatedAt, &order.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
		return
	}

	rows, err := h.DB.Query(c.Request.Context(), `
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
