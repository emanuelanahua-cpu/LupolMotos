export function listarUsuarios(db, parametros = []) {
  return db.query('SELECT * FROM usuarios ORDER BY creado', parametros);
}
export function insertarUsuario(db, parametros = []) {
  return db.execute('INSERT INTO usuarios (id, usuario, sal, hash, rol, creado) VALUES (?, ?, ?, ?, ?, ?)', parametros);
}
export function eliminarUsuario(db, parametros = []) {
  return db.execute('DELETE FROM usuarios WHERE id = ?', parametros);
}
export function findById(db, parameters) {
  return db.execute('SELECT * FROM usuarios WHERE id = ?', parameters);
}
export function findByName(db, parameters) {
  return db.execute('SELECT * FROM usuarios WHERE usuario = ?', parameters);
}
export function countSuperadmins(db) {
  return db.query("SELECT COUNT(*) AS n FROM usuarios WHERE rol = 'superadmin'");
}
