export function listarSolicitudes(db, tipo, parametros) {
  return db.query(`SELECT id, tipo, datos, creado FROM solicitudes WHERE id < ? ${tipo ? 'AND tipo = ?' : ''} ORDER BY id DESC LIMIT ?`, parametros);
}
export function insertarSolicitud(db, parametros = []) {
  return db.execute('INSERT INTO solicitudes (tipo, datos) VALUES (?, ?)', parametros);
}
