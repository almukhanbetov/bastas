package models

type StoneCatalogItem struct {
	ID        string  `db:"id" json:"id"`
	Slug      string  `db:"slug" json:"slug"`
	Name      string  `db:"name" json:"name"`
	Tag       *string `db:"tag" json:"tag,omitempty"`
	ImageURL  *string `db:"image_url" json:"imageUrl,omitempty"`
	SortOrder int     `db:"sort_order" json:"sortOrder"`
}

type ProductType struct {
	ID          string  `db:"id" json:"id"`
	Slug        string  `db:"slug" json:"slug"`
	Name        string  `db:"name" json:"name"`
	Description *string `db:"description" json:"description,omitempty"`
	ImageURL    *string `db:"image_url" json:"imageUrl,omitempty"`
	SortOrder   int     `db:"sort_order" json:"sortOrder"`
}
