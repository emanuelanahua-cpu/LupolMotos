export const backupTables = [
  "configuracion",
  "motos",
  "repuestos",
  "usuarios",
  "solicitudes",
  "imagenes",
  "clientes",
  "pedidos",
  "pedido_items",
  "ventas",
  "inventario_movimientos",
];
export async function snapshot(pool) {
  const c = await pool.getConnection();
  try {
    await c.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ");
    await c.query("START TRANSACTION WITH CONSISTENT SNAPSHOT");
    const tablas = {};
    for (const table of backupTables) {
      const [rows] = await c.query(`SELECT * FROM ${table}`);
      tablas[table] = rows.map((row) =>
        Object.fromEntries(
          Object.entries(row).map(([k, v]) => [
            k,
            Buffer.isBuffer(v) ? { base64: v.toString("base64") } : v,
          ]),
        ),
      );
    }
    await c.commit();
    return {
      formato: "lupol-backup",
      version: 1,
      creado: new Date().toISOString(),
      tablas,
    };
  } catch (e) {
    await c.rollback();
    throw e;
  } finally {
    c.release();
  }
}
