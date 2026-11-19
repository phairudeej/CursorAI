import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { backendRoot, dbPath, getUploadsDir } from "./config.js";
import { closeDatabase, getSqlite, openDatabase } from "./db.js";
import { ensureUploadDirs } from "./files.js";

const dataExampleDir = path.resolve(backendRoot, "..", "docs", "DataExample");
const mockTruckSourceCandidates = [
  path.join(backendRoot, "assets", "mock-truck.jpg"),
  path.resolve(backendRoot, "..", "assets", "mock-truck.jpg"),
];
const sellerSourceCandidates = [
  path.join(backendRoot, "assets", "seller.jpg"),
  path.resolve(backendRoot, "..", "assets", "carhub-logo.png"),
];

/** Minimal RFC4180-ish CSV parser that supports quoted fields with commas. */
export function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]!;
    const next = text[i + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field);
      field = "";
      if (row.some((value) => value.length > 0) || row.length > 1) rows.push(row);
      row = [];
      continue;
    }
    field += char;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (rows.length === 0) return { headers: [], rows: [] };
  const headers = rows[0]!.map((header) => header.trim());
  const data = rows.slice(1).map((values) => {
    const record: Record<string, string> = {};
    for (let index = 0; index < headers.length; index += 1) {
      record[headers[index]!] = (values[index] ?? "").trim();
    }
    return record;
  });
  return { headers, rows: data };
}

function readCsv(fileName: string): Record<string, string>[] {
  const filePath = path.join(dataExampleDir, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing seed CSV: ${filePath}`);
  }
  return parseCsv(fs.readFileSync(filePath, "utf8")).rows;
}

function nullable(value: string | undefined): string | null {
  if (value == null || value === "") return null;
  return value;
}

function requiredInt(value: string | undefined, field: string): number {
  if (value == null || value === "" || !/^-?\d+$/.test(value)) {
    throw new Error(`Invalid integer for ${field}: ${value ?? ""}`);
  }
  return Number(value);
}

function nullableInt(value: string | undefined): number | null {
  if (value == null || value === "") return null;
  return requiredInt(value, "value");
}

function firstExisting(paths: string[]): string | null {
  for (const candidate of paths) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function ensureSeedImages(): void {
  ensureUploadDirs();
  const uploadsDir = getUploadsDir();
  const mockTruckDest = path.join(uploadsDir, "mock-truck.jpg");
  const sellerDest = path.join(uploadsDir, "avatars", "seller.jpg");

  const mockSource = firstExisting(mockTruckSourceCandidates);
  if (!mockSource) {
    throw new Error("Could not find a source image for uploads/mock-truck.jpg");
  }
  if (!fs.existsSync(mockTruckDest) || fs.statSync(mockTruckDest).size < 100) {
    fs.copyFileSync(mockSource, mockTruckDest);
  }

  const sellerSource = firstExisting(sellerSourceCandidates);
  if (!sellerSource) {
    throw new Error("Could not find a source image for uploads/avatars/seller.jpg");
  }
  if (!fs.existsSync(sellerDest) || fs.statSync(sellerDest).size < 100) {
    fs.copyFileSync(sellerSource, sellerDest);
  }
}

function resetTables(): void {
  const db = getSqlite();
  db.exec(`
    DELETE FROM product_images;
    DELETE FROM products;
    DELETE FROM models;
    DELETE FROM brands;
    DELETE FROM vehicle_types;
    DELETE FROM sqlite_sequence
      WHERE name IN ('product_images', 'products', 'models', 'brands', 'vehicle_types');
  `);
}

function seedCatalog(): void {
  const db = getSqlite();
  const insertVehicleType = db.prepare(
    `INSERT INTO vehicle_types (id, name) VALUES (@id, @name)`,
  );
  const insertBrand = db.prepare(`INSERT INTO brands (id, name) VALUES (@id, @name)`);
  const insertModel = db.prepare(
    `INSERT INTO models (id, brand_id, name) VALUES (@id, @brand_id, @name)`,
  );

  for (const row of readCsv("vehicle_types.csv")) {
    insertVehicleType.run({ id: requiredInt(row.id, "vehicle_types.id"), name: row.name });
  }
  for (const row of readCsv("brands.csv")) {
    insertBrand.run({ id: requiredInt(row.id, "brands.id"), name: row.name });
  }
  for (const row of readCsv("models.csv")) {
    insertModel.run({
      id: requiredInt(row.id, "models.id"),
      brand_id: requiredInt(row.brand_id, "models.brand_id"),
      name: row.name,
    });
  }
}

function seedProductsAndImages(): { baseCount: number; missingCount: number } {
  const db = getSqlite();
  const insertProduct = db.prepare(`
    INSERT INTO products (
      id, name, description, price, vehicle_type_id, brand_id, model_id, year,
      seller_name, seller_phone, seller_line_url, seller_avatar, view_count, created_at
    ) VALUES (
      @id, @name, @description, @price, @vehicle_type_id, @brand_id, @model_id, @year,
      @seller_name, @seller_phone, @seller_line_url, @seller_avatar, @view_count, @created_at
    )
  `);
  const insertImage = db.prepare(`
    INSERT INTO product_images (id, product_id, file_path, sort_order)
    VALUES (@id, @product_id, @file_path, @sort_order)
  `);

  const products = readCsv("products.csv");
  const images = readCsv("product_images.csv");
  const baseProducts = products.filter((row) => requiredInt(row.id, "products.id") <= 8);
  const missingProducts = products.filter((row) => requiredInt(row.id, "products.id") > 8);

  for (const row of [...baseProducts, ...missingProducts]) {
    insertProduct.run({
      id: requiredInt(row.id, "products.id"),
      name: row.name,
      description: nullable(row.description),
      price: requiredInt(row.price, "products.price"),
      vehicle_type_id: nullableInt(row.vehicle_type_id),
      brand_id: nullableInt(row.brand_id),
      model_id: nullableInt(row.model_id),
      year: nullableInt(row.year),
      seller_name: nullable(row.seller_name),
      seller_phone: nullable(row.seller_phone),
      seller_line_url: nullable(row.seller_line_url),
      seller_avatar: nullable(row.seller_avatar),
      view_count: requiredInt(row.view_count, "products.view_count"),
      created_at: row.created_at,
    });
  }

  for (const row of images) {
    insertImage.run({
      id: requiredInt(row.id, "product_images.id"),
      product_id: requiredInt(row.product_id, "product_images.product_id"),
      file_path: row.file_path,
      sort_order: requiredInt(row.sort_order, "product_images.sort_order"),
    });
  }

  return { baseCount: baseProducts.length, missingCount: missingProducts.length };
}

export function seedDatabase(options: { reset?: boolean } = {}): {
  vehicleTypes: number;
  brands: number;
  models: number;
  products: number;
  productImages: number;
  baseCount: number;
  missingCount: number;
} {
  ensureSeedImages();
  const db = getSqlite();
  const productCount = Number(db.prepare(`SELECT COUNT(*) AS c FROM products`).get()?.c ?? 0);
  const shouldReset = options.reset ?? productCount === 0;

  if (!shouldReset && productCount > 0) {
    // seedMissing: keep existing rows, insert only CSV products that are absent
    const existingIds = new Set(
      (db.prepare(`SELECT id FROM products`).all() as Array<{ id: number }>).map((row) => row.id),
    );
    const products = readCsv("products.csv");
    const images = readCsv("product_images.csv");
    const insertProduct = db.prepare(`
      INSERT INTO products (
        id, name, description, price, vehicle_type_id, brand_id, model_id, year,
        seller_name, seller_phone, seller_line_url, seller_avatar, view_count, created_at
      ) VALUES (
        @id, @name, @description, @price, @vehicle_type_id, @brand_id, @model_id, @year,
        @seller_name, @seller_phone, @seller_line_url, @seller_avatar, @view_count, @created_at
      )
    `);
    const insertImage = db.prepare(`
      INSERT INTO product_images (id, product_id, file_path, sort_order)
      VALUES (@id, @product_id, @file_path, @sort_order)
    `);

    let added = 0;
    for (const row of products) {
      const id = requiredInt(row.id, "products.id");
      if (existingIds.has(id)) continue;
      insertProduct.run({
        id,
        name: row.name,
        description: nullable(row.description),
        price: requiredInt(row.price, "products.price"),
        vehicle_type_id: nullableInt(row.vehicle_type_id),
        brand_id: nullableInt(row.brand_id),
        model_id: nullableInt(row.model_id),
        year: nullableInt(row.year),
        seller_name: nullable(row.seller_name),
        seller_phone: nullable(row.seller_phone),
        seller_line_url: nullable(row.seller_line_url),
        seller_avatar: nullable(row.seller_avatar),
        view_count: requiredInt(row.view_count, "products.view_count"),
        created_at: row.created_at,
      });
      added += 1;
    }
    const existingImageIds = new Set(
      (db.prepare(`SELECT id FROM product_images`).all() as Array<{ id: number }>).map((row) => row.id),
    );
    for (const row of images) {
      const id = requiredInt(row.id, "product_images.id");
      if (existingImageIds.has(id)) continue;
      insertImage.run({
        id,
        product_id: requiredInt(row.product_id, "product_images.product_id"),
        file_path: row.file_path,
        sort_order: requiredInt(row.sort_order, "product_images.sort_order"),
      });
    }

    return {
      vehicleTypes: Number(db.prepare(`SELECT COUNT(*) AS c FROM vehicle_types`).get()?.c ?? 0),
      brands: Number(db.prepare(`SELECT COUNT(*) AS c FROM brands`).get()?.c ?? 0),
      models: Number(db.prepare(`SELECT COUNT(*) AS c FROM models`).get()?.c ?? 0),
      products: Number(db.prepare(`SELECT COUNT(*) AS c FROM products`).get()?.c ?? 0),
      productImages: Number(db.prepare(`SELECT COUNT(*) AS c FROM product_images`).get()?.c ?? 0),
      baseCount: Math.min(8, productCount),
      missingCount: added,
    };
  }

  const run = db.transaction(() => {
    resetTables();
    seedCatalog();
    return seedProductsAndImages();
  });
  const counts = run();

  return {
    vehicleTypes: Number(db.prepare(`SELECT COUNT(*) AS c FROM vehicle_types`).get()?.c ?? 0),
    brands: Number(db.prepare(`SELECT COUNT(*) AS c FROM brands`).get()?.c ?? 0),
    models: Number(db.prepare(`SELECT COUNT(*) AS c FROM models`).get()?.c ?? 0),
    products: Number(db.prepare(`SELECT COUNT(*) AS c FROM products`).get()?.c ?? 0),
    productImages: Number(db.prepare(`SELECT COUNT(*) AS c FROM product_images`).get()?.c ?? 0),
    baseCount: counts.baseCount,
    missingCount: counts.missingCount,
  };
}

function main(): void {
  const reset = process.argv.includes("--reset");
  openDatabase(dbPath);
  try {
    const result = seedDatabase({ reset: reset || undefined });
    console.log(
      `Seed complete: ${result.products} products (${result.baseCount} base + ${result.missingCount} missing), ` +
        `${result.productImages} images, ${result.vehicleTypes} vehicle types, ` +
        `${result.brands} brands, ${result.models} models`,
    );
  } finally {
    closeDatabase();
  }
}

const isDirectRun =
  process.argv[1] != null && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  main();
}
