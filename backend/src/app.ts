import cors from "cors";
import express from "express";
import multer from "multer";
import swaggerUi from "swagger-ui-express";
import { corsOrigin, getUploadsDir } from "./config.js";
import { getSqlite } from "./db.js";
import { HttpError, validationError } from "./errors.js";
import { ensureUploadDirs } from "./files.js";
import { openApiSpec } from "./openapi.js";
import { catalogRouter } from "./routes/catalog.js";
import { productsRouter } from "./routes/products.js";

export function createApp() {
  ensureUploadDirs();
  const app = express();

  app.use(cors({ origin: corsOrigin }));
  app.use(express.json());
  app.use("/uploads", express.static(getUploadsDir()));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec, { customSiteTitle: "Truck2Hand API" }));

  app.get("/health", (_req, res) => {
    const journalMode = getSqlite().pragma("journal_mode", { simple: true });
    res.json({ ok: true, journalMode });
  });

  app.use("/api", catalogRouter);
  app.use("/api/products", productsRouter);

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (res.headersSent) return;
    if (error instanceof HttpError) {
      res.status(error.status).json({ error: error.message, fields: error.fields });
      return;
    }
    if (error instanceof multer.MulterError) {
      const field = error.field === "sellerAvatar" ? "sellerAvatar" : "images";
      res.status(400).json({ error: validationError, fields: [field] });
      return;
    }
    console.error(error);
    res.status(500).json({ error: "Internal server error", fields: [] });
  });

  return app;
}
