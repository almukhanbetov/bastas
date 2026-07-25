CREATE TYPE order_status AS ENUM ('new', 'confirmed', 'in_production', 'ready', 'completed', 'cancelled');

-- Используется для читаемого order_number (BST-YYYYMMDD-0001).
-- Последовательность глобальная (не сбрасывается по дням) — это осознанный выбор:
-- сброс "по дням" под конкурентными вставками потребовал бы блокировок/advisory lock,
-- а глобальный SEQUENCE в Postgres гарантированно уникален и безопасен без них.
CREATE SEQUENCE order_number_seq START 1;

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,

    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    city TEXT,
    address TEXT,
    comment TEXT,

    subtotal BIGINT NOT NULL CHECK (subtotal >= 0),
    total_amount BIGINT NOT NULL CHECK (total_amount >= 0),

    status order_status NOT NULL DEFAULT 'new',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
    material_name TEXT NOT NULL,
    stone_type TEXT,

    thickness INT NOT NULL,
    area NUMERIC(10,2) NOT NULL CHECK (area > 0),

    edge_type TEXT NOT NULL,
    edge_length NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (edge_length >= 0),

    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),

    material_price_usd NUMERIC(10,2) NOT NULL,
    usd_rate NUMERIC(10,2) NOT NULL,
    markup NUMERIC(5,3) NOT NULL,

    cutting_price_per_m2 BIGINT NOT NULL,
    edge_price_per_meter BIGINT NOT NULL,

    material_cost BIGINT NOT NULL,
    cutting_cost BIGINT NOT NULL,
    edge_cost BIGINT NOT NULL,
    services_cost BIGINT NOT NULL DEFAULT 0,

    unit_total BIGINT NOT NULL,
    line_total BIGINT NOT NULL,

    configuration JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
