// SEO/editorial данные для лендингов по камню (/mramor-almaty и т.д.).
//
// Разделение источников:
// - Заголовки, описания, вступительные тексты, FAQ, подписи навигации и CTA —
//   редакционный SEO-контент, которому место во фронтенде (ничего не меняется
//   без деплоя, это тексты страниц, а не бизнес-данные).
// - Название камня/изделия, фото, тег/описание — реальные записи каталога из
//   PostgreSQL (таблицы stone_catalog / product_types). Здесь они НЕ дублируются
//   статически — только ссылка на запись (catalogRef: kind + slug), по которой
//   компонент CatalogSpotlight/CatalogGrid запрашивает актуальные данные у
//   GET /api/v1/catalog/stones?slug=... и GET /api/v1/catalog/products?slug=...
//   (см. app/components/CatalogSpotlight.js, CatalogGrid.js, lib/fetchCatalog.js).

export const WHATSAPP_HREF = 'https://wa.me/77014657070';
export const WHATSAPP_TEXT = 'Написать в WhatsApp';
export const CALCULATOR_HREF = '/calculator/';
export const CATALOG_HREF = '/catalog/';
export const CONTACTS_HREF = '/contacts/';
export const PRODUCTS_HREF = '/products/';

// Цены калькулятора (lib/pricing.js) в значительной части помечены в коде как
// плейсхолдеры без подтверждённого источника — поэтому на лендингах не
// публикуются конкретные цифры, только формулировка + ссылка на расчёт.
export const PRICE_NOTE =
  'Стоимость зависит от выбранного камня, размеров, толщины, обработки кромки и монтажа. Получите расчёт по вашему проекту — это бесплатно и ни к чему не обязывает.';

// Подтверждённая последовательность работ — собрана из home.feature
// ("Подбор камня" / "Изготовление" / "Монтаж"), контактов ("замер" — см.
// calc-disclaimer в StoneCalculator.js) и advantages ("доставка и монтаж
// одной командой").
export const PRODUCTION_STEPS = [
  { title: 'Выбор камня', body: 'Показываем слэбы и подбираем материал под стиль, задачу и бюджет проекта.' },
  { title: 'Замер', body: 'Уточняем размеры и техническое задание — от них зависит точность расчёта.' },
  { title: 'Производство', body: 'Резка и обработка деталей на собственном производстве BAS TAS.' },
  { title: 'Обработка кромок', body: 'Полировка, фаска или сложный профиль — в зависимости от изделия.' },
  { title: 'Доставка', body: 'Доставляем готовое изделие по Алматы.' },
  { title: 'Монтаж', body: 'Устанавливаем изделие с соблюдением технологии и сроков.' },
];

export const ORDER_STEPS = [
  { title: 'Оставьте заявку', body: 'Через калькулятор, звонок или WhatsApp — расскажите о задаче.' },
  { title: 'Получите расчёт', body: 'Уточним материал, размеры и обработку, подготовим предварительную стоимость.' },
  { title: 'Согласуйте материал', body: 'Покажем слэбы и варианты камня перед началом работ.' },
  { title: 'Производство и монтаж', body: 'Изготовим изделие и установим его силами BAS TAS.' },
];

const faqPriceQuestion = (subject) => ({
  q: `Сколько стоит ${subject} в Алматы?`,
  a: 'Цена зависит от вида камня, площади, толщины и обработки. Воспользуйтесь калькулятором на сайте или оставьте заявку — подготовим предварительный расчёт под ваш проект.',
});

const faqShowroom = (subject) => ({
  q: `Можно ли посмотреть ${subject} перед заказом?`,
  a: 'Да, материалы можно посмотреть при обращении в BAS TAS — свяжитесь по телефону или в WhatsApp, чтобы согласовать удобное время.',
});

const faqInstallation = {
  q: 'Выполняете ли вы замер и монтаж?',
  a: 'Да, замер и монтаж — часть комплексной работы BAS TAS, наравне с подбором материала, производством и доставкой.',
};

const faqTimeline = {
  q: 'Сколько занимает изготовление?',
  a: 'Срок зависит от сложности изделия и объёма работ. Точные сроки сообщим после согласования проекта и материала.',
};

const materialLandingLinks = [
  { name: 'Мрамор', href: '/mramor-almaty/' },
  { name: 'Гранит', href: '/granit-almaty/' },
  { name: 'Травертин', href: '/travertin-almaty/' },
  { name: 'Оникс', href: '/oniks-almaty/' },
];

// Карточки изделий из мрамора — ведут на собственные SEO-страницы этих изделий.
// label — фиксированная подпись навигации к уже существующей странице (не
// описание товара), поэтому остаётся в HTML сразу, без ожидания ответа API.
// Реальные фото/описание каждой позиции подтягивает CatalogGrid по catalogRef.
const marbleProductLinks = [
  { label: 'Столешницы', href: '/stoleshnitsy-iz-mramora/', catalogRef: { kind: 'product', slug: 'countertops' } },
  { label: 'Лестницы и ступени', href: '/lestnitsy-iz-mramora/', catalogRef: { kind: 'product', slug: 'stairs' } },
  { label: 'Подоконники', href: '/podokonniki-iz-mramora/', catalogRef: { kind: 'product', slug: 'windowsills' } },
  { label: 'Слэбы', href: '/slaby-mramora/', catalogRef: { kind: 'stone', slug: 'slabs' } },
];

// Те же виды изделий, но для страниц гранита/травертина/оникса — для них нет
// отдельных SEO-страниц по изделию, поэтому все карточки ведут в общий каталог.
const genericProductLinks = marbleProductLinks.map((item) => ({ ...item, href: PRODUCTS_HREF }));

function stoneCategoryPage({ slug, materialSlug, materialName, title, description, h1, heroBody, intro, isMarble }) {
  return {
    slug,
    kind: 'material',
    metaTitle: title,
    metaDescription: description,
    breadcrumbLabel: materialName,
    h1,
    heroEyebrow: `BAS TAS · ${materialName} · Алматы`,
    heroBody,
    spotlight: {
      heading: `${materialName} в наличии`,
      body: intro,
      catalogRef: { kind: 'stone', slug: materialSlug },
      href: CATALOG_HREF,
      linkText: 'Смотреть каталог →',
    },
    productsHeading: `Изделия из ${materialName.toLowerCase()}`,
    productsIntro: isMarble
      ? 'Изготавливаем изделия из мрамора на собственном производстве — с обработкой кромок и монтажом.'
      : `Из ${materialName.toLowerCase()}а изготавливаем те же виды изделий, что и из других материалов каталога — состав работ уточняем на расчёте.`,
    productsItems: isMarble ? marbleProductLinks : genericProductLinks,
    materialLinks: materialLandingLinks.filter((m) => m.href !== `/${slug}/`),
    faq: [
      faqPriceQuestion(materialName.toLowerCase()),
      faqShowroom(materialName.toLowerCase()),
      { q: `Изготавливаете ли вы изделия из ${materialName.toLowerCase()}а?`, a: `Да, из ${materialName.toLowerCase()}а BAS TAS изготавливает столешницы, ступени, подоконники и другие изделия на собственном производстве.` },
      faqInstallation,
      faqTimeline,
    ],
  };
}

function marbleProductPage({ slug, productName, catalogRef, title, description, h1, heroBody, intro }) {
  return {
    slug,
    kind: 'product',
    metaTitle: title,
    metaDescription: description,
    breadcrumbLabel: productName,
    h1,
    heroEyebrow: 'BAS TAS · Мрамор · Алматы',
    heroBody,
    spotlight: {
      heading: productName,
      body: intro,
      catalogRef,
      href: '/mramor-almaty/',
      linkText: 'Все виды мрамора →',
    },
    productsHeading: 'Другие изделия из мрамора',
    productsIntro: 'Изготавливаем и другие изделия из мрамора на собственном производстве BAS TAS.',
    productsItems: marbleProductLinks.filter((p) => p.catalogRef.slug !== catalogRef.slug),
    materialLinks: materialLandingLinks,
    faq: [
      faqPriceQuestion(productName.toLowerCase()),
      faqShowroom('мрамор'),
      { q: `Изготавливаете ли вы ${productName.toLowerCase()} из мрамора?`, a: 'Да, это одно из основных изделий, которые BAS TAS изготавливает из мрамора на собственном производстве в Алматы.' },
      faqInstallation,
      faqTimeline,
    ],
  };
}

export const LANDING_PAGES = {
  'mramor-almaty': stoneCategoryPage({
    slug: 'mramor-almaty',
    materialSlug: 'marble',
    materialName: 'Мрамор',
    isMarble: true,
    title: 'Купить мрамор в Алматы — слэбы и изделия | BAS TAS',
    description:
      'Мрамор в Алматы от BAS TAS: натуральный камень, слэбы, изготовление столешниц, ступеней, подоконников и других изделий. Собственное производство и монтаж.',
    h1: 'Мрамор в Алматы — слэбы и изделия из натурального камня',
    heroBody:
      'Натуральный мрамор для интерьеров и архитектурных решений: подбор камня, распил, обработка кромок и монтаж силами BAS TAS в Алматы.',
    intro:
      'Мрамор — метаморфическая порода с характерным рисунком и благородной фактурой. В BAS TAS его используют для столешниц, лестниц, подоконников, облицовки и других изделий под интерьер и архитектуру.',
  }),
  'granit-almaty': stoneCategoryPage({
    slug: 'granit-almaty',
    materialSlug: 'granite',
    materialName: 'Гранит',
    isMarble: false,
    title: 'Купить гранит в Алматы — слэбы и изделия | BAS TAS',
    description:
      'Гранит в Алматы от BAS TAS: выбор натурального камня, обработка, изготовление изделий и монтаж. Получите расчёт стоимости проекта.',
    h1: 'Гранит в Алматы — продажа, изготовление и монтаж',
    heroBody:
      'Гранит для столешниц, лестниц, подоконников и облицовки — с обработкой кромок и монтажом на собственном производстве BAS TAS в Алматы.',
    intro:
      'Гранит — прочная магматическая порода, устойчивая к нагрузкам и интенсивной эксплуатации. Подходит для кухонных столешниц, лестниц, полов и фасадных решений.',
  }),
  'travertin-almaty': stoneCategoryPage({
    slug: 'travertin-almaty',
    materialSlug: 'travertine',
    materialName: 'Травертин',
    isMarble: false,
    title: 'Травертин в Алматы — купить натуральный камень | BAS TAS',
    description:
      'Травертин в Алматы от BAS TAS: натуральный камень с тёплой фактурой, изготовление изделий и монтаж. Получите расчёт стоимости проекта.',
    h1: 'Травертин в Алматы',
    heroBody:
      'Травертин с тёплой природной фактурой — для интерьеров, облицовки и архитектурных элементов. Подбор камня, обработка и монтаж силами BAS TAS.',
    intro:
      'Травертин — осадочная порода с пористой структурой и мягким, тёплым рисунком. Часто используется в интерьерах и для облицовки, где важна природная фактура камня.',
  }),
  'oniks-almaty': stoneCategoryPage({
    slug: 'oniks-almaty',
    materialSlug: 'onyx',
    materialName: 'Оникс',
    isMarble: false,
    title: 'Оникс в Алматы — слэбы и изделия из оникса | BAS TAS',
    description:
      'Оникс в Алматы от BAS TAS: слэбы и изделия из натурального оникса, изготовление и монтаж. Получите расчёт стоимости проекта.',
    h1: 'Оникс в Алматы',
    heroBody:
      'Полупрозрачный оникс с выразительным рисунком — для акцентных изделий и интерьерных решений. Подбор камня, изготовление и монтаж силами BAS TAS.',
    intro:
      'Оникс отличается полупрозрачной структурой и глубоким рисунком — на просвет камень раскрывается по-новому. Материал часто выбирают для акцентных изделий и деталей интерьера.',
  }),

  'stoleshnitsy-iz-mramora': marbleProductPage({
    slug: 'stoleshnitsy-iz-mramora',
    productName: 'Столешницы',
    catalogRef: { kind: 'product', slug: 'countertops' },
    title: 'Мраморные столешницы в Алматы на заказ | BAS TAS',
    description:
      'Столешницы из мрамора в Алматы от BAS TAS: изготовление по размерам, обработка кромки и монтаж. Получите расчёт стоимости проекта.',
    h1: 'Мраморные столешницы в Алматы',
    heroBody:
      'Столешницы из натурального мрамора для кухни, ванной и барной зоны — изготовление по вашим размерам, обработка кромки и монтаж.',
    intro:
      'Столешницы — одно из самых частых изделий из мрамора: кухонные и ванные поверхности, барные стойки. Изготавливаются по индивидуальным размерам с вырезами под мойку и варочную панель.',
  }),
  'lestnitsy-iz-mramora': marbleProductPage({
    slug: 'lestnitsy-iz-mramora',
    productName: 'Лестницы и ступени',
    catalogRef: { kind: 'product', slug: 'stairs' },
    title: 'Мраморные лестницы и ступени в Алматы | BAS TAS',
    description:
      'Лестницы и ступени из мрамора в Алматы от BAS TAS: изготовление, обработка кромки и монтаж. Получите расчёт стоимости проекта.',
    h1: 'Мраморные лестницы и ступени в Алматы',
    heroBody:
      'Ступени, подступёнки и лестничные марши из натурального мрамора — изготовление на собственном производстве и монтаж BAS TAS.',
    intro:
      'Мраморные ступени и лестничные марши изготавливаются по проекту объекта — с подбором рисунка камня и обработкой кромок под безопасную и аккуратную эксплуатацию.',
  }),
  'podokonniki-iz-mramora': marbleProductPage({
    slug: 'podokonniki-iz-mramora',
    productName: 'Подоконники',
    catalogRef: { kind: 'product', slug: 'windowsills' },
    title: 'Подоконники из мрамора в Алматы | BAS TAS',
    description:
      'Подоконники из мрамора в Алматы от BAS TAS: изготовление по размерам проёма, обработка кромки и монтаж.',
    h1: 'Подоконники из мрамора в Алматы',
    heroBody: 'Подоконники из натурального мрамора — практичная и долговечная деталь интерьера, изготовление по размерам проёма.',
    intro:
      'Подоконники из мрамора изготавливаются по точным размерам оконного проёма с обработкой видимых кромок — практичное и эстетичное решение для интерьера.',
  }),
  'slaby-mramora': marbleProductPage({
    slug: 'slaby-mramora',
    productName: 'Слэбы',
    catalogRef: { kind: 'stone', slug: 'slabs' },
    title: 'Мраморные слэбы в Алматы — выбор натурального камня | BAS TAS',
    description:
      'Слэбы мрамора в Алматы от BAS TAS: цельные плиты натурального камня для столешниц, облицовки и крупных изделий. Получите расчёт стоимости проекта.',
    h1: 'Мраморные слэбы в Алматы',
    heroBody:
      'Слэбы мрамора — цельные плиты натурального камня для столешниц, облицовки и архитектурных решений. Подбор, распил и обработка на производстве BAS TAS.',
    intro:
      'Слэб — цельная плита камня, из которой вырезают столешницы, ступени и элементы облицовки. Подбор слэба по рисунку и цвету — первый шаг перед изготовлением изделия.',
  }),
};

export const LANDING_SLUGS = Object.keys(LANDING_PAGES);
