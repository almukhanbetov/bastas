package models

import (
	"encoding/json"
	"time"
)

type Lead struct {
	ID                  string          `db:"id" json:"id"`
	Source              string          `db:"source" json:"source"`
	Name                *string         `db:"name" json:"name,omitempty"`
	Phone               string          `db:"phone" json:"phone"`
	Email               *string         `db:"email" json:"email,omitempty"`
	Message             *string         `db:"message" json:"message,omitempty"`
	CalculationSnapshot json.RawMessage `db:"calculation_snapshot" json:"calculationSnapshot,omitempty"`
	Status              string          `db:"status" json:"status"`
	CreatedAt           time.Time       `db:"created_at" json:"createdAt"`
}

type CreateLeadInput struct {
	Source              string          `json:"source" binding:"required,oneof=calculator contact_form"`
	Name                string          `json:"name"`
	Phone               string          `json:"phone" binding:"required"`
	Email               string          `json:"email"`
	Message             string          `json:"message"`
	CalculationSnapshot json.RawMessage `json:"calculationSnapshot"`
}

type UpdateLeadStatusInput struct {
	Status string `json:"status" binding:"required,oneof=new contacted closed"`
}
