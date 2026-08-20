// Загрузка одной реальной позиции из каталога (камень или вид изделия) по slug —
// используется SEO-лендингами, чтобы не дублировать данные каталога статически.
// Тот же контракт, что и у lib/fetchContent.js / lib/fetchPricing.js: бросает при
// не-2xx, вызывающий код сам решает, что показать при ошибке.

export async function fetchStoneBySlug(apiUrl, slug) {
  const res = await fetch(`${apiUrl}/api/v1/catalog/stones?slug=${encodeURIComponent(slug)}`);
  if (!res.ok) {
    throw new Error(`stone request failed: ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data[0] : undefined;
}

export async function fetchProductBySlug(apiUrl, slug) {
  const res = await fetch(`${apiUrl}/api/v1/catalog/products?slug=${encodeURIComponent(slug)}`);
  if (!res.ok) {
    throw new Error(`product request failed: ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data[0] : undefined;
}

export function fetchCatalogItemBySlug(apiUrl, kind, slug) {
  return kind === 'stone' ? fetchStoneBySlug(apiUrl, slug) : fetchProductBySlug(apiUrl, slug);
}
