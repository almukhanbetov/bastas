package models

import (
	"encoding/json"
	"time"
)

type PageSection struct {
	ID         string          `db:"id" json:"id"`
	Page       string          `db:"page" json:"page"`
	SectionKey string          `db:"section_key" json:"sectionKey"`
	SortOrder  int             `db:"sort_order" json:"sortOrder"`
	Title      *string         `db:"title" json:"title,omitempty"`
	Subtitle   *string         `db:"subtitle" json:"subtitle,omitempty"`
	Body       *string         `db:"body" json:"body,omitempty"`
	ImageURL   *string         `db:"image_url" json:"imageUrl,omitempty"`
	Items      json.RawMessage `db:"items" json:"items"`
	Extra      json.RawMessage `db:"extra" json:"extra"`
	UpdatedAt  time.Time       `db:"updated_at" json:"updatedAt"`
}

type PageSectionInput struct {
	Page       string          `json:"page" binding:"required"`
	SectionKey string          `json:"sectionKey" binding:"required"`
	SortOrder  int             `json:"sortOrder"`
	Title      string          `json:"title"`
	Subtitle   string          `json:"subtitle"`
	Body       string          `json:"body"`
	ImageURL   string          `json:"imageUrl"`
	Items      json.RawMessage `json:"items"`
	Extra      json.RawMessage `json:"extra"`
}

type StoneCatalogInput struct {
	Slug      string `json:"slug" binding:"required"`
	Name      string `json:"name" binding:"required"`
	Tag       string `json:"tag"`
	ImageURL  string `json:"imageUrl"`
	SortOrder int    `json:"sortOrder"`
}

type ProductTypeInput struct {
	Slug        string `json:"slug" binding:"required"`
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	ImageURL    string `json:"imageUrl"`
	SortOrder   int    `json:"sortOrder"`
}
