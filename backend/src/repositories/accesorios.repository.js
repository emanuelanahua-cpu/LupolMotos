export function listarAccesorios(db) {
  return db.query('SELECT id, datos FROM accesorios ORDER BY id');
}
export function insertarAccesorio(db, parametros = []) {
  return db.execute('INSERT INTO accesorios (datos) VALUES (?)', parametros);
}
export function guardarAccesorio(db, parametros = []) {
  return db.execute('UPDATE accesorios SET datos = ? WHERE id = ?', parametros);
}
export function bloquearAccesorio(db, parametros = []) {
  return db.execute('SELECT datos FROM accesorios WHERE id = ? FOR UPDATE', parametros);
}
export function eliminarAccesorio(db, parametros = []) {
  return db.execute('DELETE FROM accesorios WHERE id = ?', parametros);
}
