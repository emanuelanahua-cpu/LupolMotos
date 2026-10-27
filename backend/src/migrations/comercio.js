// Migración aditiva: conserva catálogo, usuarios y solicitudes existentes.
export async function migrateCommerce(pool) {
  for (const sql of [
    `CREATE TABLE IF NOT EXISTS clientes (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(120) NOT NULL,
      telefono VARCHAR(20) NOT NULL UNIQUE, email VARCHAR(180) NOT NULL DEFAULT '',
      direccion VARCHAR(400) NOT NULL DEFAULT '', creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS pedidos (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, clave VARCHAR(36) NOT NULL UNIQUE,
      huella CHAR(64) NOT NULL, cliente_id BIGINT UNSIGNED NOT NULL,
      cliente_datos LONGTEXT NOT NULL, estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
      total_centimos BIGINT UNSIGNED NOT NULL, notas VARCHAR(800) NOT NULL DEFAULT '',
      creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP, actualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id), INDEX pedidos_estado (estado, id))`,
    `CREATE TABLE IF NOT EXISTS pedido_items (
      pedido_id BIGINT UNSIGNED NOT NULL, moto_id INT UNSIGNED NOT NULL,
      nombre VARCHAR(200) NOT NULL, cantidad INT UNSIGNED NOT NULL,
      precio_centimos BIGINT UNSIGNED NOT NULL, PRIMARY KEY(pedido_id, moto_id),
      FOREIGN KEY(pedido_id) REFERENCES pedidos(id), FOREIGN KEY(moto_id) REFERENCES motos(id))`,
    `CREATE TABLE IF NOT EXISTS ventas (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, pedido_id BIGINT UNSIGNED NOT NULL UNIQUE,
      total_centimos BIGINT UNSIGNED NOT NULL, metodo VARCHAR(30) NOT NULL,
      referencia VARCHAR(120) NOT NULL DEFAULT '', actor VARCHAR(40) NOT NULL,
      creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(pedido_id) REFERENCES pedidos(id))`,
    `CREATE TABLE IF NOT EXISTS inventario_movimientos (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, moto_id INT UNSIGNED NOT NULL,
      pedido_id BIGINT UNSIGNED NULL, tipo VARCHAR(30) NOT NULL, cantidad INT NOT NULL,
      stock_resultante INT UNSIGNED NOT NULL, motivo VARCHAR(300) NOT NULL, actor VARCHAR(40) NOT NULL,
      creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(moto_id) REFERENCES motos(id),
      FOREIGN KEY(pedido_id) REFERENCES pedidos(id), INDEX movimientos_moto (moto_id,id))`,
  ])
    await pool.query(sql);
}
