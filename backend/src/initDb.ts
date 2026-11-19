export const initSql = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS vehicle_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS brands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS models (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  name TEXT NOT NULL,
  UNIQUE (brand_id, name)
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0 AND price <= 99999999),
  vehicle_type_id INTEGER REFERENCES vehicle_types(id),
  brand_id INTEGER REFERENCES brands(id),
  model_id INTEGER REFERENCES models(id),
  year INTEGER,
  seller_name TEXT,
  seller_phone TEXT,
  seller_line_url TEXT,
  seller_avatar TEXT,
  view_count INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS products_created_at_idx ON products (created_at);
CREATE INDEX IF NOT EXISTS products_view_count_idx ON products (view_count);
CREATE INDEX IF NOT EXISTS products_price_idx ON products (price);
CREATE INDEX IF NOT EXISTS products_year_idx ON products (year);

CREATE TABLE IF NOT EXISTS product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  sort_order INTEGER NOT NULL CHECK (sort_order >= 0 AND sort_order <= 3),
  UNIQUE (product_id, sort_order)
);
`;
