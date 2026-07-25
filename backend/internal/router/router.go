package router

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"bastas-backend/internal/handlers"
	"bastas-backend/internal/middleware"
)

func New(pool *pgxpool.Pool, jwtSecret string, uploadDir string) *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	pricingH := &handlers.PricingHandler{DB: pool}
	catalogH := &handlers.CatalogHandler{DB: pool}
	leadsH := &handlers.LeadsHandler{DB: pool}
	adminH := &handlers.AdminHandler{DB: pool, JWTSecret: jwtSecret}
	ordersH := &handlers.OrdersHandler{DB: pool}
	contentH := &handlers.ContentHandler{DB: pool}
	uploadsH := &handlers.UploadsHandler{UploadDir: uploadDir}
	customersH := &handlers.CustomersHandler{DB: pool, JWTSecret: jwtSecret}

	r.GET("/health", handlers.Health)
	r.Static("/uploads", uploadDir)

	v1 := r.Group("/api/v1")
	{
		v1.GET("/pricing", pricingH.GetPricing)
		v1.GET("/catalog/stones", catalogH.GetStones)
		v1.GET("/catalog/products", catalogH.GetProducts)
		v1.GET("/content/:page", contentH.GetPageContent)
		v1.POST("/leads", leadsH.CreateLead)
		// OptionalCustomerAuth: гостевой чекаут работает без токена; если покупатель
		// вошёл в личный кабинет, заказ прозрачно привяжется к его аккаунту.
		v1.POST("/orders", middleware.OptionalCustomerAuth(jwtSecret), ordersH.CreateOrder)

		v1.POST("/admin/login", adminH.Login)

		v1.POST("/auth/register", customersH.Register)
		v1.POST("/auth/login", customersH.Login)

		me := v1.Group("/me")
		me.Use(middleware.RequireCustomerAuth(jwtSecret))
		{
			me.GET("", customersH.Me)
			me.GET("/orders", customersH.MyOrders)
			me.GET("/orders/:id", customersH.MyOrderDetail)
		}

		admin := v1.Group("/admin")
		admin.Use(middleware.RequireAuth(jwtSecret))
		{
			admin.GET("/leads", leadsH.ListLeads)
			admin.PATCH("/leads/:id", leadsH.UpdateLeadStatus)

			admin.GET("/materials", adminH.AdminListMaterials)
			admin.POST("/materials", adminH.CreateMaterial)
			admin.PUT("/materials/:id", adminH.UpdateMaterial)
			admin.DELETE("/materials/:id", adminH.DeleteMaterial)

			admin.PUT("/settings/:key", adminH.UpdateSetting)

			admin.GET("/orders", ordersH.ListOrders)
			admin.GET("/orders/:id", ordersH.GetOrder)
			admin.PATCH("/orders/:id/status", ordersH.UpdateOrderStatus)

			admin.GET("/catalog/stones", catalogH.AdminListStones)
			admin.POST("/catalog/stones", catalogH.CreateStone)
			admin.PUT("/catalog/stones/:id", catalogH.UpdateStone)
			admin.DELETE("/catalog/stones/:id", catalogH.DeleteStone)

			admin.GET("/catalog/products", catalogH.AdminListProducts)
			admin.POST("/catalog/products", catalogH.CreateProduct)
			admin.PUT("/catalog/products/:id", catalogH.UpdateProduct)
			admin.DELETE("/catalog/products/:id", catalogH.DeleteProduct)

			admin.GET("/content", contentH.ListSections)
			admin.GET("/content/:id", contentH.GetSection)
			admin.POST("/content", contentH.CreateSection)
			admin.PUT("/content/:id", contentH.UpdateSection)
			admin.DELETE("/content/:id", contentH.DeleteSection)

			admin.POST("/uploads", uploadsH.UploadImage)
		}
	}

	return r
}
