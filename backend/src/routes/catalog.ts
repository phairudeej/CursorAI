import { Router } from "express";
import { listBrands, listModels, listVehicleTypes } from "../catalog.js";

export const catalogRouter = Router();

catalogRouter.get("/vehicle-types", (_req, res) => {
  res.json({ data: listVehicleTypes() });
});

catalogRouter.get("/brands", (_req, res) => {
  res.json({ data: listBrands() });
});

catalogRouter.get("/models", (req, res, next) => {
  try {
    res.json({ data: listModels(req.query.brandId) });
  } catch (error) {
    next(error);
  }
});
