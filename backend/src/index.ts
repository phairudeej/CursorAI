import { createApp } from "./app.js";
import { dbPath, port } from "./config.js";
import { openDatabase } from "./db.js";

openDatabase(dbPath);
const app = createApp();

app.listen(port, () => {
  console.log(`Truck2Hand API listening on http://127.0.0.1:${port}`);
});
