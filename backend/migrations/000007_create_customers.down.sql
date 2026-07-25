DROP INDEX IF EXISTS idx_orders_customer_id;
ALTER TABLE orders DROP COLUMN IF EXISTS customer_id;
DROP TABLE IF EXISTS customers;
