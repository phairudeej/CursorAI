import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const vehicleTypes = sqliteTable("vehicle_types", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});

export const brands = sqliteTable("brands", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});

export const models = sqliteTable("models", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  brandId: integer("brand_id").notNull(),
  name: text("name").notNull(),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  vehicleTypeId: integer("vehicle_type_id"),
  brandId: integer("brand_id"),
  modelId: integer("model_id"),
  year: integer("year"),
  sellerName: text("seller_name"),
  sellerPhone: text("seller_phone"),
  sellerLineUrl: text("seller_line_url"),
  sellerAvatar: text("seller_avatar"),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const productImages = sqliteTable("product_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull(),
  filePath: text("file_path").notNull(),
  sortOrder: integer("sort_order").notNull(),
});
