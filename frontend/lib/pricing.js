// Централизованная конфигурация цен калькулятора.
// Пока нет backend/БД — это единственный источник правды по ценам.
// Значения без явного подтверждения в ТЗ помечены как плейсхолдеры — поправить здесь.
export const pricing = {
  usdRate: 550,
  markup: 1.3,

  // id: null — офлайн-конфиг не знает реального UUID материала в БД.
  // Пока backend недоступен, калькулятор им пользуется только для превью расчёта;
  // добавить такую позицию в корзину/заказ нельзя (см. проверку в StoneCalculator).
  materials: {
    marble: { id: null, label: 'Мрамор', priceUSD: 100, category: 'natural' },
    granite: { id: null, label: 'Гранит', priceUSD: 120, category: 'natural' }, // плейсхолдер
    quartzite: { id: null, label: 'Кварцит', priceUSD: 150, category: 'natural' }, // плейсхолдер
    quartz_agglomerate: { id: null, label: 'Кварцевый агломерат', priceUSD: 90, category: 'engineered' }, // плейсхолдер
  },

  thickness: {
    20: { label: '20 мм', factor: 1 },
    30: { label: '30 мм', factor: 1.2 },
  },

  cuttingPerM2: 12000,

  edgeTypes: {
    none: { label: 'Без обработки', pricePerMeter: 0 },
    straight: { label: 'Прямая фаска', pricePerMeter: 8000 }, // плейсхолдер
    polished: { label: 'Фаска с полировкой', pricePerMeter: 15500 },
    profile: { label: 'Сложный профиль', pricePerMeter: 22000 }, // плейсхолдер
  },

  services: {
    sinkCutout: 15000, // плейсхолдер, за 1 вырез
    hobCutout: 15000, // плейсхолдер, за 1 вырез
    hole: 3000, // плейсхолдер, за 1 отверстие
    installation: 20000, // плейсхолдер, фикс. за монтаж
    delivery: 15000, // плейсхолдер, фикс. за доставку
  },
};
