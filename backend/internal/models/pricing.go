package models

type Material struct {
	ID            string  `db:"id" json:"id"`
	Slug          string  `db:"slug" json:"slug"`
	Name          string  `db:"name" json:"name"`
	Category      string  `db:"category" json:"category"`
	PriceUSDPerM2 float64 `db:"price_usd_per_m2" json:"priceUsdPerM2"`
	Description   *string `db:"description" json:"description,omitempty"`
	ImageURL      *string `db:"image_url" json:"imageUrl,omitempty"`
	SortOrder     int     `db:"sort_order" json:"sortOrder"`
}

type ThicknessOption struct {
	ID        string  `db:"id" json:"id"`
	ValueMM   int     `db:"value_mm" json:"valueMm"`
	Factor    float64 `db:"factor" json:"factor"`
	SortOrder int     `db:"sort_order" json:"sortOrder"`
}

type EdgeType struct {
	ID            string  `db:"id" json:"id"`
	Slug          string  `db:"slug" json:"slug"`
	Name          string  `db:"name" json:"name"`
	PricePerMeter float64 `db:"price_per_meter" json:"pricePerMeter"`
	SortOrder     int     `db:"sort_order" json:"sortOrder"`
}

type ServicePrice struct {
	ID    string  `db:"id" json:"id"`
	Slug  string  `db:"slug" json:"slug"`
	Name  string  `db:"name" json:"name"`
	Price float64 `db:"price" json:"price"`
}

type PricingConfig struct {
	UsdRate      float64           `json:"usdRate"`
	Markup       float64           `json:"markup"`
	CuttingPerM2 float64           `json:"cuttingPerM2"`
	Materials    []Material        `json:"materials"`
	Thickness    []ThicknessOption `json:"thickness"`
	EdgeTypes    []EdgeType        `json:"edgeTypes"`
	Services     []ServicePrice    `json:"services"`
}
