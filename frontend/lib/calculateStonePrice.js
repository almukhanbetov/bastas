import { pricing as defaultPricing } from './pricing';

function toNumber(value) {
  const n = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toPositive(value) {
  const n = toNumber(value);
  return n > 0 ? n : 0;
}

function toNonNegative(value) {
  const n = toNumber(value);
  return n >= 0 ? n : 0;
}

// Толщина влияет на объём материала — коэффициент применяется к стоимости материала.
export function calculateStonePrice(input, config = defaultPricing) {
  const area = toPositive(input.area);

  if (!area) {
    return { valid: false, area: 0, breakdown: null, total: 0 };
  }

  const material = config.materials[input.material] || Object.values(config.materials)[0];
  const thickness = config.thickness[input.thickness] || { factor: 1 };
  const edge = config.edgeTypes[input.edgeType] || config.edgeTypes.none;

  const edgeLength = toNonNegative(input.edgeLength);
  const sinkCutouts = toNonNegative(input.sinkCutouts);
  const hobCutouts = toNonNegative(input.hobCutouts);
  const holes = toNonNegative(input.holes);
  const usdRate = toPositive(input.usdRate) || config.usdRate;
  const markup = config.markup;

  const materialCost = area * material.priceUSD * usdRate * markup * thickness.factor;
  const cuttingCost = area * config.cuttingPerM2;
  const edgeCost = edgeLength * edge.pricePerMeter;

  const sinkCutoutCost = sinkCutouts * config.services.sinkCutout;
  const hobCutoutCost = hobCutouts * config.services.hobCutout;
  const holesCost = holes * config.services.hole;
  const otherServicesCost = sinkCutoutCost + hobCutoutCost + holesCost;

  const installationCost = input.installation ? config.services.installation : 0;
  const deliveryCost = input.delivery ? config.services.delivery : 0;

  const total =
    materialCost +
    cuttingCost +
    edgeCost +
    otherServicesCost +
    installationCost +
    deliveryCost;

  return {
    valid: true,
    area,
    breakdown: {
      materialCost,
      cuttingCost,
      edgeCost,
      sinkCutoutCost,
      hobCutoutCost,
      holesCost,
      otherServicesCost,
      installationCost,
      deliveryCost,
    },
    total,
  };
}
