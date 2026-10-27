import fs from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { root } from "../src/config/db.js";
const destination = path.join(root, ".env.local");
const secret = () => randomBytes(32).toString("hex");
try {
  await fs.writeFile(
    destination,
    `HOST=127.0.0.1\nPORT=8000\nDB_HOST=127.0.0.1\nDB_PORT=33317\nDB_NAME=lupol_local\nDB_USER=lupol_local\nDB_PASSWORD=${secret()}\nLOCAL_DB_ROOT_PASSWORD=${secret()}\nLUPOL_SECRET=${secret()}\nLUPOL_INITIAL_USERS=\nLUPOL_HTTPS=false\nALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000,http://127.0.0.1:8000\nVITE_PORT=3000\nVITE_BACKEND_URL=http://localhost:8000\nWHATSAPP_NUMERO=51980687475\n`,
    { flag: "wx", mode: 0o600 },
  );
  console.log("Configuración local creada en .env.local (privada).");
} catch (e) {
  if (e.code !== "EEXIST") throw e;
  console.log("Conservando la configuración local existente.");
}
const r = spawnSync(
  "docker",
  [
    "compose",
    "--env-file",
    destination,
    "-f",
    "compose.local.yml",
    "up",
    "-d",
    "--wait",
  ],
  { cwd: root, stdio: "inherit" },
);
if (r.error) throw r.error;
process.exitCode = r.status ?? 1;
