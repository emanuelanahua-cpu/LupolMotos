export function listarSolicitudes(db, tipo, parametros) {
  return db.query(`SELECT id, tipo, datos, creado FROM solicitudes WHERE id < ? AND oculto_en IS NULL ${tipo ? 'AND tipo = ?' : ''} ORDER BY id DESC LIMIT ?`, parametros);
}
export function insertarSolicitud(db, parametros = []) {
  return db.execute('INSERT INTO solicitudes (tipo, datos) VALUES (?, ?)', parametros);
}
export function ocultarSolicitud(db, id) {
  return db.execute('UPDATE solicitudes SET oculto_en=CURRENT_TIMESTAMP WHERE id=? AND oculto_en IS NULL', [id]);
}
