export function formatTenge(value) {
  const rounded = Math.round(Number.isFinite(value) ? value : 0);
  return `${rounded.toLocaleString('ru-RU')} ₸`;
}
