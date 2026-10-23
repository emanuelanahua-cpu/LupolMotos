export function insertarMoto(db, parametros = []) {
  return db.execute('INSERT INTO motos (datos) VALUES (?)', parametros);
}
export function guardarMoto(db, parametros = []) {
  return db.execute('UPDATE motos SET datos = ? WHERE id = ?', parametros);
}
export function bloquearMoto(db, parametros = []) {
  return db.execute('SELECT datos FROM motos WHERE id = ? FOR UPDATE', parametros);
}
export function eliminarMoto(db, parametros = []) {
  return db.execute('DELETE FROM motos WHERE id = ?', parametros);
}
