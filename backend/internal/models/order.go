package models

import (
	"encoding/json"
	"time"
)

// --- Входные данные от клиента (POST /api/v1/orders) ---
// totalPrice от клиента сюда намеренно не входит — backend пересчитывает всё сам.

type CustomerInput struct {
	Name    string `json:"name" binding:"required"`
	Phone   string `json:"phone" binding:"required"`
	Email   string `json:"email"`
	City    string `json:"city"`
	Address string `json:"address"`
	Comment string `json:"comment"`
}

type OrderItemInput struct {
	MaterialID string  `json:"materialId" binding:"required"`
	Thickness  int     `json:"thickness" binding:"required"`
	Area       float64 `json:"area" binding:"required,gt=0"`
	EdgeType   string  `json:"edgeType"`
	EdgeLength float64 `json:"edgeLength"`

	SinkCutoutCount int `json:"sinkCutoutCount"`
	HobCutoutCount  int `json:"hobCutoutCount"`
	HolesCount      int `json:"holesCount"`

	Installation bool `json:"installation"`
	Delivery     bool `json:"delivery"`

	Quantity int `json:"quantity"`
}

type CreateOrderInput struct {
	Customer CustomerInput    `json:"customer" binding:"required"`
	Items    []OrderItemInput `json:"items" binding:"required,min=1,dive"`
}

// --- Хранимые сущности ---

type Order struct {
	ID             string    `db:"id" json:"id"`
	OrderNumber    string    `db:"order_number" json:"orderNumber"`
	CustomerName   string    `db:"customer_name" json:"customerName"`
	CustomerPhone  string    `db:"customer_phone" json:"customerPhone"`
	CustomerEmail  *string   `db:"customer_email" json:"customerEmail,omitempty"`
	City           *string   `db:"city" json:"city,omitempty"`
	Address        *string   `db:"address" json:"address,omitempty"`
	Comment        *string   `db:"comment" json:"comment,omitempty"`
	Subtotal       int64     `db:"subtotal" json:"subtotal"`
	TotalAmount    int64     `db:"total_amount" json:"totalAmount"`
	Status         string    `db:"status" json:"status"`
	CreatedAt      time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt      time.Time `db:"updated_at" json:"updatedAt"`
}

type OrderItem struct {
	ID                 string          `db:"id" json:"id"`
	OrderID            string          `db:"order_id" json:"orderId"`
	MaterialID         *string         `db:"material_id" json:"materialId,omitempty"`
	MaterialName       string          `db:"material_name" json:"materialName"`
	StoneType          *string         `db:"stone_type" json:"stoneType,omitempty"`
	Thickness          int             `db:"thickness" json:"thickness"`
	Area               float64         `db:"area" json:"area"`
	EdgeType           string          `db:"edge_type" json:"edgeType"`
	EdgeLength         float64         `db:"edge_length" json:"edgeLength"`
	Quantity           int             `db:"quantity" json:"quantity"`
	MaterialPriceUSD   float64         `db:"material_price_usd" json:"materialPriceUsd"`
	UsdRate            float64         `db:"usd_rate" json:"usdRate"`
	Markup             float64         `db:"markup" json:"markup"`
	CuttingPricePerM2  int64           `db:"cutting_price_per_m2" json:"cuttingPricePerM2"`
	EdgePricePerMeter  int64           `db:"edge_price_per_meter" json:"edgePricePerMeter"`
	MaterialCost       int64           `db:"material_cost" json:"materialCost"`
	CuttingCost        int64           `db:"cutting_cost" json:"cuttingCost"`
	EdgeCost           int64           `db:"edge_cost" json:"edgeCost"`
	ServicesCost       int64           `db:"services_cost" json:"servicesCost"`
	UnitTotal          int64           `db:"unit_total" json:"unitTotal"`
	LineTotal          int64           `db:"line_total" json:"lineTotal"`
	Configuration      json.RawMessage `db:"configuration" json:"configuration,omitempty"`
	CreatedAt          time.Time       `db:"created_at" json:"createdAt"`
}

// --- Ответы API ---

type CreateOrderResponse struct {
	ID          string `json:"id"`
	OrderNumber string `json:"orderNumber"`
	Status      string `json:"status"`
	TotalAmount int64  `json:"totalAmount"`
}

type OrderListItem struct {
	ID            string    `db:"id" json:"id"`
	OrderNumber   string    `db:"order_number" json:"orderNumber"`
	CustomerName  string    `db:"customer_name" json:"customerName"`
	CustomerPhone string    `db:"customer_phone" json:"customerPhone"`
	City          *string   `db:"city" json:"city,omitempty"`
	ItemsCount    int64     `db:"items_count" json:"itemsCount"`
	TotalAmount   int64     `db:"total_amount" json:"totalAmount"`
	Status        string    `db:"status" json:"status"`
	CreatedAt     time.Time `db:"created_at" json:"createdAt"`
}

type OrderDetail struct {
	Order
	Items []OrderItem `json:"items"`
}

type UpdateOrderStatusInput struct {
	Status string `json:"status" binding:"required,oneof=new confirmed in_production ready completed cancelled"`
}
