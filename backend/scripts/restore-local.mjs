import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import { createPool, root, transaction } from "../src/config/db.js";
import { initialize } from "../src/migrations/initialize.js";
import { backupTables } from "../src/repositories/respaldo.repository.js";
const filename = process.argv[2];
if (!filename)
  throw new Error(
    "Uso: npm run db:restore -- ruta/al/respaldo.json [--replace-local]",
  );
const env = dotenv.parse(await fs.readFile(path.join(root, ".env.local")));
if (
  env.DB_HOST !== "127.0.0.1" ||
  env.DB_NAME !== "lupol_local" ||
  env.DB_PORT !== "33317"
)
  throw new Error(
    "Restauración permitida solo en lupol_local, 127.0.0.1:33317",
  );
const data = JSON.parse(await fs.readFile(filename, "utf8"));
if (
  data.formato !== "lupol-backup" ||
  data.version !== 1 ||
  !backupTables.every((t) => Array.isArray(data.tablas?.[t]))
)
  throw new Error("Respaldo inválido o incompleto");
const pool = createPool(env);
try {
  const [tables] = await pool.query("SHOW TABLES");
  if (tables.length && !process.argv.includes("--replace-local"))
    throw new Error(
      "La base local ya existe. Usa --replace-local solo si deseas reemplazar sus datos.",
    );
  await initialize(pool);
  await transaction(pool, async (c) => {
    for (const t of [...backupTables].reverse())
      await c.query(`DELETE FROM ${t}`);
    for (const t of backupTables) {
      const [columns] = await c.query(`SHOW COLUMNS FROM ${t}`);
      const allowed = new Set(columns.map((c) => c.Field));
      for (const row of data.tablas[t]) {
        const keys = Object.keys(row);
        if (!keys.length || !keys.every((k) => allowed.has(k)))
          throw new Error(`Columnas inválidas en ${t}`);
        const values = keys.map((k) => {
          const v = row[k];
          if (v && typeof v === "object" && typeof v.base64 === "string")
            return Buffer.from(v.base64, "base64");
          if (
            typeof v === "string" &&
            ["creado", "actualizado"].includes(k) &&
            /^\d{4}-.*Z$/.test(v) &&
            t !== "usuarios"
          )
            return new Date(v);
          return v;
        });
        await c.execute(
          `INSERT INTO ${t} (${keys.map((k) => "`" + k + "`").join(",")}) VALUES (${keys.map(() => "?").join(",")})`,
          values,
        );
      }
    }
  });
  for (const t of backupTables) {
    const [[n]] = await pool.query(`SELECT COUNT(*) AS n FROM ${t}`);
    console.log(`${t}: ${n.n}`);
  }
  console.log("Restauración local completa. Producción no se ha modificado.");
} finally {
  await pool.end();
}
