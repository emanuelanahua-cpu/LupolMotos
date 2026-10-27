export const pedidoPorClave = (db, clave) =>
  db.execute("SELECT * FROM pedidos WHERE clave = ?", [clave]);
export const bloquearPedido = (db, id) =>
  db.execute("SELECT * FROM pedidos WHERE id = ? FOR UPDATE", [id]);
export const itemsPedido = (db, id) =>
  db.execute(
    "SELECT * FROM pedido_items WHERE pedido_id = ? ORDER BY moto_id",
    [id],
  );
export async function clienteId(db, d) {
  const [r] = await db.execute(
    "INSERT INTO clientes(nombre,telefono,email,direccion) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)",
    [d.nombre, d.telefono, d.email, d.direccion],
  );
  return r.insertId;
}
export const insertarPedido = (db, d) =>
  db.execute(
    "INSERT INTO pedidos(clave,huella,cliente_id,cliente_datos,total_centimos,notas) VALUES(?,?,?,?,?,?)",
    d,
  );
export const insertarItem = (db, d) =>
  db.execute(
    "INSERT INTO pedido_items(pedido_id,moto_id,nombre,cantidad,precio_centimos) VALUES(?,?,?,?,?)",
    d,
  );
export const cambiarEstado = (db, id, estado) =>
  db.execute("UPDATE pedidos SET estado=? WHERE id=?", [estado, id]);
export const registrarVenta = (db, d) =>
  db.execute(
    "INSERT INTO ventas(pedido_id,total_centimos,metodo,referencia,actor) VALUES(?,?,?,?,?)",
    d,
  );
export const movimiento = (db, d) =>
  db.execute(
    "INSERT INTO inventario_movimientos(moto_id,pedido_id,tipo,cantidad,stock_resultante,motivo,actor) VALUES(?,?,?,?,?,?,?)",
    d,
  );
export const listarPedidos = (db) =>
  db.query("SELECT * FROM pedidos ORDER BY id DESC LIMIT 300");
export const listarItems = (db) =>
  db.query(
    "SELECT i.* FROM pedido_items i JOIN (SELECT id FROM pedidos ORDER BY id DESC LIMIT 300) p ON p.id=i.pedido_id ORDER BY i.moto_id",
  );
export const listarClientes = (db) =>
  db.query(
    "SELECT c.*, (SELECT COUNT(*) FROM pedidos p WHERE p.cliente_id=c.id) AS pedidos FROM clientes c ORDER BY c.id DESC LIMIT 500",
  );
export const editarCliente = (db, id, d) =>
  db.execute(
    "UPDATE clientes SET nombre=?,telefono=?,email=?,direccion=? WHERE id=?",
    [d.nombre, d.telefono, d.email, d.direccion, id],
  );
export const listarVentas = (db) =>
  db.query(
    "SELECT v.*,p.cliente_datos FROM ventas v JOIN pedidos p ON p.id=v.pedido_id ORDER BY v.id DESC LIMIT 300",
  );
export const resumenVentas = (db) =>
  db.query(
    "SELECT COUNT(*) AS cantidad, COALESCE(SUM(total_centimos),0) AS total_centimos FROM ventas",
  );
export const listarMovimientos = (db) =>
  db.query("SELECT * FROM inventario_movimientos ORDER BY id DESC LIMIT 300");
export const tieneHistorial = (db, id) =>
  db.execute(
    "SELECT moto_id FROM pedido_items WHERE moto_id=? UNION SELECT moto_id FROM inventario_movimientos WHERE moto_id=? LIMIT 1",
    [id, id],
  );
