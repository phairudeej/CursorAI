import { asc, eq } from "drizzle-orm";
import { getDb } from "./db.js";
import { HttpError, validationError } from "./errors.js";
import { brands, models, vehicleTypes } from "./schema.js";

export function listVehicleTypes() {
  return getDb()
    .select({ id: vehicleTypes.id, name: vehicleTypes.name })
    .from(vehicleTypes)
    .orderBy(asc(vehicleTypes.name))
    .all();
}

export function listBrands() {
  return getDb()
    .select({ id: brands.id, name: brands.name })
    .from(brands)
    .orderBy(asc(brands.name))
    .all();
}

export function listModels(brandIdRaw: unknown) {
  if (typeof brandIdRaw !== "string" || !/^[1-9]\d*$/.test(brandIdRaw.trim())) {
    throw new HttpError(400, validationError, ["brandId"]);
  }
  const brandId = Number(brandIdRaw.trim());
  if (!Number.isSafeInteger(brandId)) {
    throw new HttpError(400, validationError, ["brandId"]);
  }

  return getDb()
    .select({ id: models.id, brandId: models.brandId, name: models.name })
    .from(models)
    .where(eq(models.brandId, brandId))
    .orderBy(asc(models.name))
    .all();
}
