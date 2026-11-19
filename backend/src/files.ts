import fs from "node:fs";
import path from "node:path";
import { getStorageRoot, getUploadsDir } from "./config.js";

export function ensureUploadDirs(): void {
  const uploadsDir = getUploadsDir();
  fs.mkdirSync(path.join(uploadsDir, "products"), { recursive: true });
  fs.mkdirSync(path.join(uploadsDir, "avatars"), { recursive: true });
}

export function toStoredPath(absolutePath: string): string {
  const relative = path.relative(getStorageRoot(), absolutePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Upload path is outside the backend directory");
  }
  return relative.split(path.sep).join("/");
}

export function toPublicUrl(storedPath: string | null): string | null {
  if (!storedPath) return null;
  return `/${storedPath.replace(/^\/+/, "")}`;
}

export function removeAbsoluteFiles(filePaths: string[]): void {
  const root = path.resolve(getUploadsDir());
  for (const filePath of filePaths) {
    const absolute = path.resolve(filePath);
    if (absolute !== root && !absolute.startsWith(`${root}${path.sep}`)) continue;
    try {
      fs.rmSync(absolute, { force: true });
    } catch {
      // The database update has already succeeded; a missing file should not fail the request.
    }
  }
}

export function removeStoredPaths(storedPaths: Array<string | null | undefined>): void {
  const absolutePaths: string[] = [];
  for (const storedPath of storedPaths) {
    if (!storedPath) continue;
    absolutePaths.push(path.resolve(getStorageRoot(), storedPath));
  }
  removeAbsoluteFiles(absolutePaths);
}
