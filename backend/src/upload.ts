import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Request, Response } from "express";
import multer from "multer";
import { getUploadsDir } from "./config.js";
import { HttpError, validationError } from "./errors.js";
import { removeAbsoluteFiles } from "./files.js";

const allowedExtensions = new Set([".png", ".jpg"]);

function imageFileFilter(
  _req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback,
) {
  const extension = path.extname(file.originalname).toLowerCase();
  const field = file.fieldname === "sellerAvatar" ? "sellerAvatar" : "images";
  const mimeMatches =
    (extension === ".png" && (file.mimetype === "image/png" || file.mimetype === "application/octet-stream")) ||
    (extension === ".jpg" &&
      (file.mimetype === "image/jpeg" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "application/octet-stream"));

  if (!allowedExtensions.has(extension) || !mimeMatches) {
    callback(new HttpError(400, validationError, [field]));
    return;
  }
  callback(null, true);
}

const storage = multer.diskStorage({
  destination: (_req, file, callback) => {
    const subdirectory = file.fieldname === "sellerAvatar" ? "avatars" : "products";
    const destination = path.join(getUploadsDir(), subdirectory);
    fs.mkdirSync(destination, { recursive: true });
    callback(null, destination);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeExtension = extension === ".png" || extension === ".jpg" ? extension : "";
    callback(null, `${Date.now()}-${randomBytes(6).toString("hex")}${safeExtension}`);
  },
});

const productFormUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { files: 5 },
}).fields([
  { name: "images", maxCount: 4 },
  { name: "sellerAvatar", maxCount: 1 },
]);

type ProductFileMap = {
  images?: Express.Multer.File[];
  sellerAvatar?: Express.Multer.File[];
};

export function collectUploaded(req: Request): Express.Multer.File[] {
  const files = req.files as ProductFileMap | Express.Multer.File[] | undefined;
  if (!files) return [];
  if (Array.isArray(files)) return files;
  return [...(files.images ?? []), ...(files.sellerAvatar ?? [])];
}

export function readProductFiles(req: Request): {
  images: Express.Multer.File[];
  avatar: Express.Multer.File | null;
} {
  const files = req.files as ProductFileMap | undefined;
  return {
    images: files?.images ?? [],
    avatar: files?.sellerAvatar?.[0] ?? null,
  };
}

export function receiveProductForm(req: Request, res: Response): Promise<void> {
  return new Promise((resolve, reject) => {
    productFormUpload(req, res, (error) => {
      if (error) {
        removeAbsoluteFiles(collectUploaded(req).map((file) => file.path));
        reject(error);
        return;
      }
      resolve();
    });
  });
}
