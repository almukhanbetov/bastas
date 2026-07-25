// Переводит ответ backend API (массивы объектов) в ту же форму, что и
// статический конфиг lib/pricing.js, чтобы calculateStonePrice.js не менять.
const SERVICE_SLUG_TO_KEY = {
  sink_cutout: 'sinkCutout',
  hob_cutout: 'hobCutout',
  hole: 'hole',
  installation: 'installation',
  delivery: 'delivery',
};

export async function fetchPricingConfig(apiUrl) {
  const res = await fetch(`${apiUrl}/api/v1/pricing`);
  if (!res.ok) {
    throw new Error(`pricing request failed: ${res.status}`);
  }
  const data = await res.json();

  return {
    usdRate: data.usdRate,
    markup: data.markup,
    cuttingPerM2: data.cuttingPerM2,
    materials: Object.fromEntries(
      data.materials.map((m) => [m.slug, { id: m.id, label: m.name, priceUSD: m.priceUsdPerM2, category: m.category }])
    ),
    thickness: Object.fromEntries(
      data.thickness.map((t) => [String(t.valueMm), { label: `${t.valueMm} мм`, factor: t.factor }])
    ),
    edgeTypes: Object.fromEntries(
      data.edgeTypes.map((e) => [e.slug, { label: e.name, pricePerMeter: e.pricePerMeter }])
    ),
    services: Object.fromEntries(
      data.services
        .filter((s) => SERVICE_SLUG_TO_KEY[s.slug])
        .map((s) => [SERVICE_SLUG_TO_KEY[s.slug], s.price])
    ),
  };
}
