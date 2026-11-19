import path from "node:path";
import { fileURLToPath } from "node:url";

export const backendRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export const port = 3001;
export const corsOrigin = ["http://127.0.0.1:5173", "http://localhost:5173"];
export const dataDir = path.join(backendRoot, "data");
export const dbPath = path.join(dataDir, "truck2hand.db");

let activeStorageRoot = backendRoot;
let activeUploadsDir = path.join(backendRoot, "uploads");

export function getStorageRoot(): string {
  return activeStorageRoot;
}

export function getUploadsDir(): string {
  return activeUploadsDir;
}

export function setStorageRoot(root: string): void {
  activeStorageRoot = root;
  activeUploadsDir = path.join(root, "uploads");
}
