# BAS TAS — backend

Go + Gin API поверх Postgres 17. Отдаёт конфигурацию калькулятора и каталог, которые
раньше были захардкожены в `frontend/lib/pricing.js` и `frontend/app/catalog|products/page.js`,
и принимает заявки с калькулятора/контактной формы.

## Таблицы

`materials`, `thickness_options`, `edge_types`, `service_prices`, `settings` — конфигурация
калькулятора (см. `migrations/000001_init_schema.up.sql`). `stone_catalog`, `product_types` —
публичный каталог. `leads` — заявки. `admin_users` — доступ к админ-эндпоинтам.

## Локальный запуск

```bash
cd backend
docker compose up -d          # Postgres 17 на localhost:5434
cp .env.example .env          # при необходимости поменяйте порт/секрет
go run ./cmd/migrate up       # применить миграции + сид данных
go run ./cmd/createadmin -email admin@bastas.kz -password change-me
go run ./cmd/api              # API на :8080
```

Откат миграций: `go run ./cmd/migrate down`.

## Проверка

```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/v1/pricing
curl http://localhost:8080/api/v1/catalog/stones
curl http://localhost:8080/api/v1/catalog/products

curl -X POST http://localhost:8080/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{"source":"calculator","phone":"+77011234567","calculationSnapshot":{"total":332750}}'

curl -X POST http://localhost:8080/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bastas.kz","password":"change-me"}'
# → {"token": "..."}, дальше Authorization: Bearer <token>
```

## Эндпоинты

Публичные:
- `GET /api/v1/pricing` — материалы, толщина, обработка торца, доп. услуги, курс, наценка
- `GET /api/v1/catalog/stones`, `GET /api/v1/catalog/products`
- `POST /api/v1/leads`

Админские (`Authorization: Bearer <jwt>` из `/api/v1/admin/login`):
- `GET /api/v1/admin/leads`, `PATCH /api/v1/admin/leads/:id`
- `POST /api/v1/admin/materials`, `PUT/DELETE /api/v1/admin/materials/:id`
- `PUT /api/v1/admin/settings/:key` — например `usd_rate`, `markup`

## Docker

```bash
docker build -t bastas-backend .
docker run -p 8080:8080 -e DATABASE_URL=... -e JWT_SECRET=... bastas-backend
```

## Дальше

- Frontend (`frontend/lib/pricing.js`) пока не переключён на этот API — калькулятор
  на сайте всё ещё считает по захардкоженному конфигу. Переключение — следующий шаг.
- CORS сейчас разрешает только `http://localhost:3000`; поправить под прод-домен в
  `internal/router/router.go` при деплое.
