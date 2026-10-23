export function insertarImagen(db, parametros = []) {
  return db.execute('INSERT INTO imagenes (id, mime, contenido) VALUES (?, ?, ?)', parametros);
}
export function obtenerImagen(db, parametros) {
  return db.execute('SELECT mime, contenido FROM imagenes WHERE id = ?', parametros);
}
