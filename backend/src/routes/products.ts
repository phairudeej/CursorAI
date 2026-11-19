import { Router } from "express";
import { HttpError, productNotFoundError } from "../errors.js";
import { removeAbsoluteFiles, removeStoredPaths } from "../files.js";
import { createProduct, deleteProduct, getProduct, listProducts, updateProduct } from "../products.js";
import { collectUploaded, readProductFiles, receiveProductForm } from "../upload.js";

export const productsRouter = Router();

function routeId(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !/^[1-9]\d*$/.test(raw)) return null;
  const id = Number(raw);
  if (!Number.isSafeInteger(id)) return null;
  return id;
}

productsRouter.get("/", (req, res, next) => {
  try {
    res.json(listProducts(req.query as Record<string, unknown>));
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:id", (req, res, next) => {
  try {
    const id = routeId(req.params.id);
    if (id == null) throw new HttpError(404, productNotFoundError, []);
    res.json(getProduct(id));
  } catch (error) {
    next(error);
  }
});

productsRouter.post("/", async (req, res, next) => {
  let uploaded: Express.Multer.File[] = [];
  try {
    await receiveProductForm(req, res);
    uploaded = collectUploaded(req);
    const product = createProduct(req.body, readProductFiles(req));
    res.status(201).json(product);
  } catch (error) {
    removeAbsoluteFiles(uploaded.map((file) => file.path));
    next(error);
  }
});

productsRouter.put("/:id", async (req, res, next) => {
  let uploaded: Express.Multer.File[] = [];
  let committed = false;
  try {
    const id = routeId(req.params.id);
    if (id == null) throw new HttpError(404, productNotFoundError, []);
    await receiveProductForm(req, res);
    uploaded = collectUploaded(req);
    const result = updateProduct(id, req.body, readProductFiles(req));
    committed = true;
    removeStoredPaths(result.removedPaths);
    res.json(result.product);
  } catch (error) {
    if (!committed) removeAbsoluteFiles(uploaded.map((file) => file.path));
    next(error);
  }
});

productsRouter.delete("/:id", (req, res, next) => {
  try {
    const id = routeId(req.params.id);
    if (id == null) throw new HttpError(404, productNotFoundError, []);
    const removedPaths = deleteProduct(id);
    removeStoredPaths(removedPaths);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
