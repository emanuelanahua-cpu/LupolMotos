/**
 * Formatea montos en Soles peruanos (PEN)
 */
export function formatearSoles(monto) {
  if (typeof monto !== 'number') return 'S/. 0.00';
  return `S/. ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
