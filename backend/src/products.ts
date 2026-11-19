import { and, asc, count, desc, eq, gte, inArray, lte, sql, type SQL } from "drizzle-orm";
import { findBlockedTerms } from "./config/blocklist.js";
import { getDb } from "./db.js";
import { duplicateNameError, HttpError, productNotFoundError, validationError } from "./errors.js";
import { toPublicUrl, toStoredPath } from "./files.js";
import { brands, models, productImages, products, vehicleTypes } from "./schema.js";

const PRODUCT_SORTS = ["newest", "oldest", "views", "price", "price_desc"] as const;
type ProductSort = (typeof PRODUCT_SORTS)[number];
const MAX_PRICE = 99_999_999;

type ProductRow = typeof products.$inferSelect;
type ImageRow = typeof productImages.$inferSelect;

export type ApiVehicleType = { id: number; name: string };
export type ApiBrand = { id: number; name: string };
export type ApiModel = { id: number; brandId: number; name: string };
export type ApiProductImage = { id: number; url: string; sortOrder: number };
export type ApiProduct = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  year: number | null;
  vehicleType: ApiVehicleType | null;
  brand: ApiBrand | null;
  model: ApiModel | null;
  sellerName: string | null;
  sellerPhone: string | null;
  sellerLineUrl: string | null;
  sellerAvatar: string | null;
  viewCount: number;
  createdAt: string;
  images: ApiProductImage[];
};

type UploadedFile = { path: string };
type ProductFiles = { images: UploadedFile[]; avatar: UploadedFile | null };
type ImageRef = { type: "existing"; id: number } | { type: "upload"; fileIndex: number };
type ProductWrite = {
  name: string;
  description: string | null;
  price: number;
  vehicleTypeId: number | null;
  brandId: number | null;
  modelId: number | null;
  year: number | null;
  sellerName: string | null;
  sellerPhone: string | null;
  sellerLineUrl: string | null;
};

type FieldList = {
  add(field: string): void;
  list(): string[];
};

function fieldList(): FieldList {
  const fields: string[] = [];
  return {
    add(field: string) {
      if (!fields.includes(field)) fields.push(field);
    },
    list() {
      return fields;
    },
  };
}

function failIfInvalid(fields: FieldList): void {
  const invalid = fields.list();
  if (invalid.length > 0) throw new HttpError(400, validationError, invalid);
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function readString(body: Record<string, unknown>, key: string, fields: FieldList): string | undefined {
  if (!Object.prototype.hasOwnProperty.call(body, key)) return undefined;
  const value = body[key];
  if (typeof value !== "string") {
    fields.add(key);
    return undefined;
  }
  return value;
}

function emptyToNull(value: string | undefined): string | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function parseRequiredPrice(raw: string | undefined, fields: FieldList): number {
  if (raw === undefined || !/^-?\d+$/.test(raw.trim())) {
    fields.add("price");
    return 0;
  }
  const price = Number(raw.trim());
  if (!Number.isSafeInteger(price) || price < 0 || price > MAX_PRICE) {
    fields.add("price");
    return 0;
  }
  return price;
}

function parseOptionalId(raw: string | undefined, field: string, fields: FieldList): number | null {
  if (raw === undefined || raw.trim() === "") return null;
  if (!/^[1-9]\d*$/.test(raw.trim())) {
    fields.add(field);
    return null;
  }
  const value = Number(raw.trim());
  if (!Number.isSafeInteger(value)) {
    fields.add(field);
    return null;
  }
  return value;
}

function parseOptionalYear(raw: string | undefined, fields: FieldList): number | null {
  if (raw === undefined || raw.trim() === "") return null;
  if (!/^-?\d+$/.test(raw.trim())) {
    fields.add("year");
    return null;
  }
  const value = Number(raw.trim());
  if (!Number.isSafeInteger(value)) {
    fields.add("year");
    return null;
  }
  return value;
}

function parseCoverIndex(raw: string | undefined, fields: FieldList): void {
  if (raw === undefined || raw.trim() !== "0") fields.add("coverIndex");
}

function parseCreateImageOrder(raw: string | undefined, fileCount: number, fields: FieldList): number[] | null {
  if (fileCount < 1 || fileCount > 4) fields.add("images");
  if (raw === undefined || raw.trim() === "") {
    fields.add("imageOrder");
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    fields.add("imageOrder");
    return null;
  }
  if (
    !Array.isArray(parsed) ||
    parsed.length !== fileCount ||
    parsed.some((item) => typeof item !== "number" || !Number.isInteger(item))
  ) {
    fields.add("imageOrder");
    return null;
  }
  const indexes = parsed as number[];
  const seen = new Set(indexes);
  if (seen.size !== fileCount) {
    fields.add("imageOrder");
    return null;
  }
  for (let index = 0; index < fileCount; index += 1) {
    if (!seen.has(index)) {
      fields.add("imageOrder");
      return null;
    }
  }
  return indexes;
}

function parseUpdateImageOrder(raw: string | undefined, fileCount: number, fields: FieldList): ImageRef[] | null {
  if (fileCount > 4) fields.add("images");
  if (raw === undefined || raw.trim() === "") {
    fields.add("imageOrder");
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    fields.add("imageOrder");
    return null;
  }
  if (!Array.isArray(parsed) || parsed.length < 1 || parsed.length > 4) {
    fields.add("imageOrder");
    if (Array.isArray(parsed) && parsed.length < 1) fields.add("images");
    return null;
  }

  const refs: ImageRef[] = [];
  const ids = new Set<number>();
  const fileIndexes = new Set<number>();
  for (const item of parsed) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      fields.add("imageOrder");
      return null;
    }
    const record = item as Record<string, unknown>;
    const hasId = Object.prototype.hasOwnProperty.call(record, "id");
    const hasFile = Object.prototype.hasOwnProperty.call(record, "fileIndex");
    if (hasId === hasFile) {
      fields.add("imageOrder");
      return null;
    }
    if (hasId) {
      if (typeof record.id !== "number" || !Number.isInteger(record.id) || record.id < 1 || ids.has(record.id)) {
        fields.add("imageOrder");
        return null;
      }
      ids.add(record.id);
      refs.push({ type: "existing", id: record.id });
      continue;
    }
    if (
      typeof record.fileIndex !== "number" ||
      !Number.isInteger(record.fileIndex) ||
      record.fileIndex < 0 ||
      fileIndexes.has(record.fileIndex)
    ) {
      fields.add("imageOrder");
      return null;
    }
    fileIndexes.add(record.fileIndex);
    refs.push({ type: "upload", fileIndex: record.fileIndex });
  }

  if (fileIndexes.size !== fileCount) {
    fields.add("imageOrder");
    return null;
  }
  for (let index = 0; index < fileCount; index += 1) {
    if (!fileIndexes.has(index)) {
      fields.add("imageOrder");
      return null;
    }
  }
  return refs;
}

function validateRelations(
  input: Pick<ProductWrite, "vehicleTypeId" | "brandId" | "modelId">,
  fields: FieldList,
): void {
  if (input.vehicleTypeId != null) {
    const vehicleType = getDb()
      .select({ id: vehicleTypes.id })
      .from(vehicleTypes)
      .where(eq(vehicleTypes.id, input.vehicleTypeId))
      .get();
    if (!vehicleType) fields.add("vehicleTypeId");
  }
  if (input.brandId != null) {
    const brand = getDb().select({ id: brands.id }).from(brands).where(eq(brands.id, input.brandId)).get();
    if (!brand) fields.add("brandId");
  }
  if (input.modelId != null) {
    const model = getDb()
      .select({ id: models.id, brandId: models.brandId })
      .from(models)
      .where(eq(models.id, input.modelId))
      .get();
    if (!model) fields.add("modelId");
    else if (input.brandId != null && model.brandId !== input.brandId) fields.add("modelId");
    if (input.brandId == null) fields.add("brandId");
  }
}

function readProductWrite(body: unknown, fields: FieldList): ProductWrite {
  const record = asRecord(body);
  const nameRaw = readString(record, "name", fields);
  const name = nameRaw?.trim() ?? "";
  if (name === "") fields.add("name");
  else if (findBlockedTerms(name).length > 0) fields.add("name");

  const description = emptyToNull(readString(record, "description", fields));
  if (description && findBlockedTerms(description).length > 0) fields.add("description");

  const price = parseRequiredPrice(readString(record, "price", fields), fields);
  const vehicleTypeId = parseOptionalId(readString(record, "vehicleTypeId", fields), "vehicleTypeId", fields);
  const brandId = parseOptionalId(readString(record, "brandId", fields), "brandId", fields);
  const modelId = parseOptionalId(readString(record, "modelId", fields), "modelId", fields);
  const year = parseOptionalYear(readString(record, "year", fields), fields);
  validateRelations({ vehicleTypeId, brandId, modelId }, fields);

  return {
    name,
    description,
    price,
    vehicleTypeId,
    brandId,
    modelId,
    year,
    sellerName: emptyToNull(readString(record, "sellerName", fields)),
    sellerPhone: emptyToNull(readString(record, "sellerPhone", fields)),
    sellerLineUrl: emptyToNull(readString(record, "sellerLineUrl", fields)),
  };
}

function resolveAvatar(
  body: unknown,
  avatar: UploadedFile | null,
  current: string | null,
  fields: FieldList,
): { next: string | null; remove: string | null } {
  if (avatar) return { next: toStoredPath(avatar.path), remove: current };
  const record = asRecord(body);
  if (!Object.prototype.hasOwnProperty.call(record, "sellerAvatar")) {
    return { next: current, remove: null };
  }
  const value = record.sellerAvatar;
  if (value === "" || value === null || (typeof value === "string" && value.trim() === "")) {
    return { next: null, remove: current };
  }
  fields.add("sellerAvatar");
  return { next: current, remove: null };
}

function assertUniqueName(name: string, currentId?: number): void {
  const existing = getDb().select({ id: products.id }).from(products).where(eq(products.name, name)).get();
  if (existing && existing.id !== currentId) {
    throw new HttpError(409, duplicateNameError, ["name"]);
  }
}

function isUniqueNameError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error) || !("message" in error)) return false;
  const sqliteError = error as { code: unknown; message: unknown };
  return (
    sqliteError.code === "SQLITE_CONSTRAINT_UNIQUE" &&
    typeof sqliteError.message === "string" &&
    sqliteError.message.includes("products.name")
  );
}

function rethrowWriteError(error: unknown): never {
  if (isUniqueNameError(error)) throw new HttpError(409, duplicateNameError, ["name"]);
  throw error;
}

function serializeProducts(rows: ProductRow[]): ApiProduct[] {
  if (rows.length === 0) return [];
  const ids = rows.map((row) => row.id);
  const typeIds = [...new Set(rows.flatMap((row) => (row.vehicleTypeId == null ? [] : [row.vehicleTypeId])))];
  const brandIds = [...new Set(rows.flatMap((row) => (row.brandId == null ? [] : [row.brandId])))];
  const modelIds = [...new Set(rows.flatMap((row) => (row.modelId == null ? [] : [row.modelId])))];

  const typeRows = typeIds.length
    ? getDb().select().from(vehicleTypes).where(inArray(vehicleTypes.id, typeIds)).all()
    : [];
  const brandRows = brandIds.length ? getDb().select().from(brands).where(inArray(brands.id, brandIds)).all() : [];
  const modelRows = modelIds.length ? getDb().select().from(models).where(inArray(models.id, modelIds)).all() : [];
  const imageRows = getDb().select().from(productImages).where(inArray(productImages.productId, ids)).all();
  imageRows.sort((left, right) => left.sortOrder - right.sortOrder || left.id - right.id);

  const typesById = new Map(typeRows.map((row) => [row.id, { id: row.id, name: row.name }]));
  const brandsById = new Map(brandRows.map((row) => [row.id, { id: row.id, name: row.name }]));
  const modelsById = new Map(
    modelRows.map((row) => [row.id, { id: row.id, brandId: row.brandId, name: row.name }]),
  );
  const imagesByProduct = new Map<number, ApiProductImage[]>();
  for (const image of imageRows) {
    const list = imagesByProduct.get(image.productId) ?? [];
    const url = toPublicUrl(image.filePath);
    if (!url) continue;
    list.push({ id: image.id, url, sortOrder: image.sortOrder });
    imagesByProduct.set(image.productId, list);
  }

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    year: row.year,
    vehicleType: row.vehicleTypeId == null ? null : (typesById.get(row.vehicleTypeId) ?? null),
    brand: row.brandId == null ? null : (brandsById.get(row.brandId) ?? null),
    model: row.modelId == null ? null : (modelsById.get(row.modelId) ?? null),
    sellerName: row.sellerName,
    sellerPhone: row.sellerPhone,
    sellerLineUrl: row.sellerLineUrl,
    sellerAvatar: toPublicUrl(row.sellerAvatar),
    viewCount: row.viewCount,
    createdAt: row.createdAt,
    images: imagesByProduct.get(row.id) ?? [],
  }));
}

function loadProduct(id: number): ApiProduct {
  const row = getDb().select().from(products).where(eq(products.id, id)).get();
  if (!row) throw new HttpError(404, productNotFoundError, []);
  const product = serializeProducts([row])[0];
  if (!product) throw new HttpError(404, productNotFoundError, []);
  return product;
}

function readQuery(query: Record<string, unknown>, key: string, fields: FieldList): string | undefined {
  if (!Object.prototype.hasOwnProperty.call(query, key)) return undefined;
  const value = query[key];
  if (typeof value !== "string") {
    fields.add(key);
    return undefined;
  }
  return value;
}

function parsePageParam(raw: string | undefined, field: string, fallback: number, fields: FieldList): number {
  if (raw === undefined) return fallback;
  if (!/^[1-9]\d*$/.test(raw.trim())) {
    fields.add(field);
    return fallback;
  }
  const value = Number(raw.trim());
  if (!Number.isSafeInteger(value)) {
    fields.add(field);
    return fallback;
  }
  return value;
}

function parseQueryInt(raw: string | undefined, field: string, fields: FieldList): number | undefined {
  if (raw === undefined) return undefined;
  if (!/^-?\d+$/.test(raw.trim())) {
    fields.add(field);
    return undefined;
  }
  const value = Number(raw.trim());
  if (!Number.isSafeInteger(value)) {
    fields.add(field);
    return undefined;
  }
  return value;
}

function parseQueryId(raw: string | undefined, field: string, fields: FieldList): number | undefined {
  if (raw === undefined) return undefined;
  if (raw.trim() === "") {
    fields.add(field);
    return undefined;
  }
  const value = parseOptionalId(raw, field, fields);
  return value == null ? undefined : value;
}

function isProductSort(value: string): value is ProductSort {
  return (PRODUCT_SORTS as readonly string[]).includes(value);
}

function sortOrder(sort: ProductSort) {
  const highestId = desc(products.id);
  switch (sort) {
    case "oldest":
      return [asc(products.createdAt), highestId] as const;
    case "views":
      return [desc(products.viewCount), highestId] as const;
    case "price":
      return [asc(products.price), highestId] as const;
    case "price_desc":
      return [desc(products.price), highestId] as const;
    case "newest":
      return [desc(products.createdAt), highestId] as const;
  }
}

export function listProducts(query: Record<string, unknown>) {
  const fields = fieldList();
  const page = parsePageParam(readQuery(query, "page", fields), "page", 1, fields);
  const pageSize = parsePageParam(readQuery(query, "pageSize", fields), "pageSize", 10, fields);
  const sortRaw = readQuery(query, "sort", fields);
  let sort: ProductSort = "newest";
  if (sortRaw !== undefined) {
    const normalized = sortRaw.trim();
    if (!isProductSort(normalized)) fields.add("sort");
    else sort = normalized;
  }

  const vehicleTypeId = parseQueryId(readQuery(query, "vehicleTypeId", fields), "vehicleTypeId", fields);
  const brandId = parseQueryId(readQuery(query, "brandId", fields), "brandId", fields);
  const modelId = parseQueryId(readQuery(query, "modelId", fields), "modelId", fields);
  const minPrice = parseQueryInt(readQuery(query, "minPrice", fields), "minPrice", fields);
  const maxPrice = parseQueryInt(readQuery(query, "maxPrice", fields), "maxPrice", fields);
  const minYear = parseQueryInt(readQuery(query, "minYear", fields), "minYear", fields);
  const maxYear = parseQueryInt(readQuery(query, "maxYear", fields), "maxYear", fields);
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    fields.add("minPrice");
    fields.add("maxPrice");
  }
  if (minYear !== undefined && maxYear !== undefined && minYear > maxYear) {
    fields.add("minYear");
    fields.add("maxYear");
  }
  failIfInvalid(fields);

  const conditions: SQL[] = [];
  if (vehicleTypeId !== undefined) conditions.push(eq(products.vehicleTypeId, vehicleTypeId));
  if (brandId !== undefined) conditions.push(eq(products.brandId, brandId));
  if (modelId !== undefined) conditions.push(eq(products.modelId, modelId));
  if (minPrice !== undefined) conditions.push(gte(products.price, minPrice));
  if (maxPrice !== undefined) conditions.push(lte(products.price, maxPrice));
  if (minYear !== undefined) conditions.push(gte(products.year, minYear));
  if (maxYear !== undefined) conditions.push(lte(products.year, maxYear));
  const condition = conditions.length > 0 ? and(...conditions) : undefined;

  const filtered = getDb().select().from(products);
  const rows = (condition ? filtered.where(condition) : filtered)
    .orderBy(...sortOrder(sort))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
    .all();
  const counted = getDb().select({ total: count() }).from(products);
  const total = (condition ? counted.where(condition) : counted).get()?.total ?? 0;

  return {
    data: serializeProducts(rows),
    meta: { page, pageSize, total },
  };
}

export function getProduct(id: number): ApiProduct {
  const updated = getDb().transaction((tx) => {
    const current = tx.select().from(products).where(eq(products.id, id)).get();
    if (!current) return null;
    tx.update(products)
      .set({ viewCount: sql`${products.viewCount} + 1` })
      .where(eq(products.id, id))
      .run();
    return tx.select().from(products).where(eq(products.id, id)).get() ?? null;
  });
  if (!updated) throw new HttpError(404, productNotFoundError, []);
  const product = serializeProducts([updated])[0];
  if (!product) throw new HttpError(404, productNotFoundError, []);
  return product;
}

export function createProduct(body: unknown, files: ProductFiles): ApiProduct {
  const fields = fieldList();
  const input = readProductWrite(body, fields);
  const record = asRecord(body);
  parseCoverIndex(readString(record, "coverIndex", fields), fields);
  const imageOrder = parseCreateImageOrder(readString(record, "imageOrder", fields), files.images.length, fields);
  const avatar = resolveAvatar(body, files.avatar, null, fields);
  failIfInvalid(fields);
  if (!imageOrder) throw new HttpError(400, validationError, ["imageOrder"]);
  assertUniqueName(input.name);

  try {
    const productId = getDb().transaction((tx) => {
      const inserted = tx
        .insert(products)
        .values({
          name: input.name,
          description: input.description,
          price: input.price,
          vehicleTypeId: input.vehicleTypeId,
          brandId: input.brandId,
          modelId: input.modelId,
          year: input.year,
          sellerName: input.sellerName,
          sellerPhone: input.sellerPhone,
          sellerLineUrl: input.sellerLineUrl,
          sellerAvatar: avatar.next,
          viewCount: 0,
          createdAt: new Date().toISOString(),
        })
        .returning()
        .all()[0];
      if (!inserted) throw new Error("Failed to insert product");
      imageOrder.forEach((fileIndex, sortOrder) => {
        const file = files.images[fileIndex];
        if (!file) throw new HttpError(400, validationError, ["imageOrder"]);
        tx.insert(productImages)
          .values({
            productId: inserted.id,
            filePath: toStoredPath(file.path),
            sortOrder,
          })
          .run();
      });
      return inserted.id;
    });
    return loadProduct(productId);
  } catch (error) {
    rethrowWriteError(error);
  }
}

export function updateProduct(
  id: number,
  body: unknown,
  files: ProductFiles,
): { product: ApiProduct; removedPaths: string[] } {
  const current = getDb().select().from(products).where(eq(products.id, id)).get();
  if (!current) throw new HttpError(404, productNotFoundError, []);

  const fields = fieldList();
  const input = readProductWrite(body, fields);
  const record = asRecord(body);
  parseCoverIndex(readString(record, "coverIndex", fields), fields);
  const imageOrder = parseUpdateImageOrder(readString(record, "imageOrder", fields), files.images.length, fields);
  const existingImages = getDb().select().from(productImages).where(eq(productImages.productId, id)).all();
  const existingById = new Map(existingImages.map((image) => [image.id, image]));
  if (imageOrder) {
    for (const ref of imageOrder) {
      if (ref.type === "existing" && !existingById.has(ref.id)) {
        fields.add("imageOrder");
        break;
      }
    }
  }
  const avatar = resolveAvatar(body, files.avatar, current.sellerAvatar, fields);
  failIfInvalid(fields);
  if (!imageOrder) throw new HttpError(400, validationError, ["imageOrder"]);
  assertUniqueName(input.name, id);

  const keptIds = new Set(imageOrder.flatMap((ref) => (ref.type === "existing" ? [ref.id] : [])));
  const removedPaths = existingImages.filter((image) => !keptIds.has(image.id)).map((image) => image.filePath);
  if (avatar.remove && avatar.remove !== avatar.next) removedPaths.push(avatar.remove);

  try {
    getDb().transaction((tx) => {
      tx.update(products)
        .set({
          name: input.name,
          description: input.description,
          price: input.price,
          vehicleTypeId: input.vehicleTypeId,
          brandId: input.brandId,
          modelId: input.modelId,
          year: input.year,
          sellerName: input.sellerName,
          sellerPhone: input.sellerPhone,
          sellerLineUrl: input.sellerLineUrl,
          sellerAvatar: avatar.next,
        })
        .where(eq(products.id, id))
        .run();

      tx.delete(productImages).where(eq(productImages.productId, id)).run();
      for (const [sortOrder, ref] of imageOrder.entries()) {
        if (ref.type === "existing") {
          const previous = existingById.get(ref.id) as ImageRow;
          tx.insert(productImages)
            .values({
              id: previous.id,
              productId: id,
              filePath: previous.filePath,
              sortOrder,
            })
            .run();
          continue;
        }
        const file = files.images[ref.fileIndex];
        if (!file) throw new HttpError(400, validationError, ["imageOrder"]);
        tx.insert(productImages)
          .values({
            productId: id,
            filePath: toStoredPath(file.path),
            sortOrder,
          })
          .run();
      }
    });
  } catch (error) {
    rethrowWriteError(error);
  }

  return { product: loadProduct(id), removedPaths };
}

export function deleteProduct(id: number): string[] {
  const current = getDb().select().from(products).where(eq(products.id, id)).get();
  if (!current) throw new HttpError(404, productNotFoundError, []);
  const images = getDb().select().from(productImages).where(eq(productImages.productId, id)).all();
  getDb().delete(products).where(eq(products.id, id)).run();
  return [...images.map((image) => image.filePath), current.sellerAvatar].filter((filePath): filePath is string =>
    Boolean(filePath),
  );
}
