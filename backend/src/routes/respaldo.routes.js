import { Router } from "express";
import { snapshot } from "../repositories/respaldo.repository.js";
export function createRoutes(pool, env, { session, requestLimit }) {
  const r = Router();
  r.get(
    "/api/admin/respaldo",
    session.required,
    session.roles("superadmin"),
    requestLimit,
    async (req, res) => {
      const data = await snapshot(pool);
      res.set(
        "Content-Disposition",
        `attachment; filename="lupol-respaldo-${data.creado.slice(0, 10)}.json"`,
      );
      res.json(data);
    },
  );
  return r;
}
