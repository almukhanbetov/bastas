package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func parseBearerToken(c *gin.Context, secret string) (jwt.MapClaims, bool) {
	header := c.GetHeader("Authorization")
	if !strings.HasPrefix(header, "Bearer ") {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing bearer token"})
		return nil, false
	}
	tokenString := strings.TrimPrefix(header, "Bearer ")

	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	}, jwt.WithValidMethods([]string{"HS256"}))
	if err != nil || !token.Valid {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
		return nil, false
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token claims"})
		return nil, false
	}
	return claims, true
}

// RequireAuth — для админ-эндпоинтов. До этой правки любой валидный по подписи
// токен проходил сюда, включая (будущие) customer-токены — роль не проверялась.
// Теперь строго требуется claim role=="admin".
func RequireAuth(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		claims, ok := parseBearerToken(c, secret)
		if !ok {
			return
		}
		if claims["role"] != "admin" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "admin access required"})
			return
		}
		c.Set("adminID", claims["sub"])
		c.Set("adminEmail", claims["email"])
		c.Next()
	}
}

// RequireCustomerAuth — для личного кабинета покупателя (role=="customer").
func RequireCustomerAuth(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		claims, ok := parseBearerToken(c, secret)
		if !ok {
			return
		}
		if claims["role"] != "customer" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "customer access required"})
			return
		}
		c.Set("customerID", claims["sub"])
		c.Next()
	}
}

// OptionalCustomerAuth — используется в POST /orders: гостевой чекаут должен
// работать без токена. Если валидный customer-токен присутствует — кладём
// customerID в контекст, чтобы заказ привязался к аккаунту; если токена нет
// или он невалиден/чужой роли — просто продолжаем без customerID, не блокируя запрос.
func OptionalCustomerAuth(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			c.Next()
			return
		}
		tokenString := strings.TrimPrefix(header, "Bearer ")
		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			return []byte(secret), nil
		}, jwt.WithValidMethods([]string{"HS256"}))
		if err != nil || !token.Valid {
			c.Next()
			return
		}
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || claims["role"] != "customer" {
			c.Next()
			return
		}
		c.Set("customerID", claims["sub"])
		c.Next()
	}
}
