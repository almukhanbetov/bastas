'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { pricing as staticPricing } from '@/lib/pricing';
import { fetchPricingConfig } from '@/lib/fetchPricing';
import { calculateStonePrice } from '@/lib/calculateStonePrice';
import { formatTenge } from '@/lib/formatCurrency';
import { useCart } from '@/app/context/CartContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const staticMaterialEntries = Object.entries(staticPricing.materials);
const staticThicknessEntries = Object.entries(staticPricing.thickness);

const initialState = {
  material: staticMaterialEntries[0][0],
  thickness: staticThicknessEntries[0][0],
  area: '',
  edgeLength: '',
  edgeType: 'none',
  sinkCutouts: '0',
  hobCutouts: '0',
  holes: '0',
  installation: false,
  delivery: false,
  usdRate: String(staticPricing.usdRate),
};

function NumberField({ label, value, onChange, min = 0, step = 1, required = false, suffix }) {
  return (
    <label className="calc-field">
      <span>
        {label}
        {required && <span className="calc-required"> *</span>}
      </span>
      <div className="calc-input-wrap">
        <input
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && <span className="calc-suffix">{suffix}</span>}
      </div>
    </label>
  );
}

export default function StoneCalculator() {
  const router = useRouter();
  const { addItem } = useCart();
  const [form, setForm] = useState(initialState);
  const [pricing, setPricing] = useState(staticPricing);

  useEffect(() => {
    if (API_URL === undefined) return;
    let cancelled = false;

    fetchPricingConfig(API_URL)
      .then((config) => {
        if (!cancelled) setPricing(config);
      })
      .catch(() => {
        // backend недоступен — остаёмся на статическом конфиге, калькулятор продолжает работать
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const materialEntries = useMemo(() => Object.entries(pricing.materials), [pricing]);
  const thicknessEntries = useMemo(() => Object.entries(pricing.thickness), [pricing]);
  const edgeEntries = useMemo(() => Object.entries(pricing.edgeTypes), [pricing]);

  const update = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }));
  const toggle = (field) => () => setForm((prev) => ({ ...prev, [field]: !prev[field] }));

  const result = useMemo(() => calculateStonePrice(form, pricing), [form, pricing]);

  const areaMissing = form.area === '' || Number(form.area) <= 0;

  const selectedMaterial = pricing.materials[form.material];
  const selectedEdge = pricing.edgeTypes[form.edgeType] || pricing.edgeTypes.none;
  // material.id есть только когда конфиг реально пришёл с backend — на статическом
  // офлайн-фоллбэке добавить позицию в заказ нельзя (backend не сможет её найти).
  const canAddToCart = !areaMissing && result.valid && Boolean(selectedMaterial?.id);

  const handleAddToCart = () => {
    if (!canAddToCart) return;

    addItem({
      materialId: selectedMaterial.id,
      materialName: selectedMaterial.label,
      stoneType: selectedMaterial.category,
      thickness: Number(form.thickness),
      area: Number(form.area),
      edgeType: form.edgeType,
      edgeTypeName: selectedEdge.label,
      edgeLength: Number(form.edgeLength) || 0,
      cuttingPricePerM2: pricing.cuttingPerM2,
      sinkCutoutCount: Number(form.sinkCutouts) || 0,
      hobCutoutCount: Number(form.hobCutouts) || 0,
      holesCount: Number(form.holes) || 0,
      installation: form.installation,
      delivery: form.delivery,
      materialPriceUSD: selectedMaterial.priceUSD,
      usdRate: Number(form.usdRate) || pricing.usdRate,
      markup: pricing.markup,
      materialCost: result.breakdown.materialCost,
      cuttingCost: result.breakdown.cuttingCost,
      edgeCost: result.breakdown.edgeCost,
      servicesCost:
        result.breakdown.otherServicesCost +
        result.breakdown.installationCost +
        result.breakdown.deliveryCost,
      totalPrice: result.total,
      quantity: 1,
    });

    router.push('/cart/');
  };

  return (
    <div className="calc-layout">
      <form className="calc-form" onSubmit={(e) => e.preventDefault()}>
        <div className="calc-row">
          <label className="calc-field">
            <span>Вид камня</span>
            <select value={form.material} onChange={(e) => update('material')(e.target.value)}>
              {materialEntries.map(([key, m]) => (
                <option key={key} value={key}>
                  {m.label} — от {m.priceUSD} $/м²
                </option>
              ))}
            </select>
          </label>

          <label className="calc-field">
            <span>Толщина</span>
            <select value={form.thickness} onChange={(e) => update('thickness')(e.target.value)}>
              {thicknessEntries.map(([key, t]) => (
                <option key={key} value={key}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="calc-row">
          <NumberField
            label="Площадь изделия, м²"
            value={form.area}
            onChange={update('area')}
            min={0.01}
            step={0.01}
            required
          />
          <NumberField
            label="Длина фаски, пог.м"
            value={form.edgeLength}
            onChange={update('edgeLength')}
            min={0}
            step={0.1}
          />
        </div>

        <div className="calc-row">
          <label className="calc-field">
            <span>Тип обработки торца</span>
            <select value={form.edgeType} onChange={(e) => update('edgeType')(e.target.value)}>
              {edgeEntries.map(([key, e]) => (
                <option key={key} value={key}>
                  {e.label}
                </option>
              ))}
            </select>
          </label>

          <NumberField
            label="Курс доллара"
            value={form.usdRate}
            onChange={update('usdRate')}
            min={1}
            step={1}
            suffix="₸"
          />
        </div>

        <div className="calc-row">
          <NumberField
            label="Вырез под мойку, шт."
            value={form.sinkCutouts}
            onChange={update('sinkCutouts')}
            min={0}
            step={1}
          />
          <NumberField
            label="Вырез под варочную панель, шт."
            value={form.hobCutouts}
            onChange={update('hobCutouts')}
            min={0}
            step={1}
          />
        </div>

        <div className="calc-row">
          <NumberField
            label="Отверстия, шт."
            value={form.holes}
            onChange={update('holes')}
            min={0}
            step={1}
          />
          <div className="calc-field calc-checkboxes">
            <label className="calc-checkbox">
              <input type="checkbox" checked={form.installation} onChange={toggle('installation')} />
              Монтаж
            </label>
            <label className="calc-checkbox">
              <input type="checkbox" checked={form.delivery} onChange={toggle('delivery')} />
              Доставка
            </label>
          </div>
        </div>
      </form>

      <aside className="calc-summary">
        <h3>Предварительный расчёт</h3>

        {areaMissing ? (
          <p className="calc-hint">Укажите площадь изделия, чтобы увидеть расчёт.</p>
        ) : (
          <>
            <div className="calc-summary-lines">
              <div className="calc-line">
                <span>Материал</span>
                <b>{formatTenge(result.breakdown.materialCost)}</b>
              </div>
              <div className="calc-line">
                <span>Распил</span>
                <b>{formatTenge(result.breakdown.cuttingCost)}</b>
              </div>
              <div className="calc-line">
                <span>Обработка торца</span>
                <b>{formatTenge(result.breakdown.edgeCost)}</b>
              </div>
              <div className="calc-line">
                <span>Доп. работы</span>
                <b>{formatTenge(result.breakdown.otherServicesCost)}</b>
              </div>
              <div className="calc-line">
                <span>Монтаж</span>
                <b>{formatTenge(result.breakdown.installationCost)}</b>
              </div>
              <div className="calc-line">
                <span>Доставка</span>
                <b>{formatTenge(result.breakdown.deliveryCost)}</b>
              </div>
            </div>

            <div className="calc-total">
              <span>ИТОГО</span>
              <strong>{formatTenge(result.total)}</strong>
            </div>
          </>
        )}

        <p className="calc-disclaimer">
          Расчёт является предварительным. Финальная стоимость определяется после замера и
          согласования материала.
        </p>

        <button
          type="button"
          className="btn btn-light calc-cta"
          onClick={handleAddToCart}
          disabled={!canAddToCart}
        >
          Добавить в корзину
        </button>

        {!areaMissing && !selectedMaterial?.id && (
          <p className="calc-hint calc-hint-warning">
            Не удалось загрузить актуальные цены с сервера. Обновите страницу, чтобы добавить в
            корзину.
          </p>
        )}

        <Link className="btn btn-outline-light calc-cta" href="/contacts/">
          Получить точный расчёт
        </Link>
      </aside>
    </div>
  );
}
