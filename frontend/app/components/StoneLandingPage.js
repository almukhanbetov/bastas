import Link from 'next/link';
import CatalogSpotlight from './CatalogSpotlight';
import CatalogGrid from './CatalogGrid';
import {
  WHATSAPP_HREF,
  WHATSAPP_TEXT,
  CALCULATOR_HREF,
  CATALOG_HREF,
  CONTACTS_HREF,
  PRICE_NOTE,
  PRODUCTION_STEPS,
  ORDER_STEPS,
} from '@/lib/landingPages';

const SITE_URL = 'https://www.bastas.kz';

function BreadcrumbJsonLd({ label, path }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: label, item: `${SITE_URL}${path}` },
    ],
  };
  return (
    // eslint-disable-next-line react/no-danger
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

function FaqJsonLd({ faq }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
  return (
    // eslint-disable-next-line react/no-danger
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export default function StoneLandingPage({ data }) {
  const {
    slug,
    breadcrumbLabel,
    h1,
    heroEyebrow,
    heroBody,
    spotlight,
    productsHeading,
    productsIntro,
    productsItems,
    materialLinks,
    faq,
  } = data;
  const path = `/${slug}/`;

  return (
    <>
      <BreadcrumbJsonLd label={breadcrumbLabel} path={path} />
      <FaqJsonLd faq={faq} />

      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">Главная / {breadcrumbLabel}</div>
          <div className="eyebrow">{heroEyebrow}</div>
          <h1>{h1}</h1>
          <p>{heroBody}</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href={CALCULATOR_HREF}>Получить расчёт</Link>
            <a className="btn btn-line" href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">{WHATSAPP_TEXT}</a>
          </div>
          <Link className="text-link" href={CATALOG_HREF}>Посмотреть каталог →</Link>
        </div>
      </section>

      <section className="section">
        <div className="container feature-layout">
          <CatalogSpotlight
            kicker={breadcrumbLabel}
            heading={spotlight.heading}
            kind={spotlight.catalogRef.kind}
            slug={spotlight.catalogRef.slug}
            body={spotlight.body}
            href={spotlight.href}
            linkText={spotlight.linkText}
          />
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="section-head">
            <div className="section-kicker">Расчёт стоимости</div>
            <h2>Стоимость {breadcrumbLabel.toLowerCase()}</h2>
          </div>
          <div className="note-box">
            <p>{PRICE_NOTE}</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href={CALCULATOR_HREF}>Получить расчёт</Link>
              <a className="btn btn-line" href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">{WHATSAPP_TEXT}</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="section-kicker">Изделия</div>
            <h2>{productsHeading}</h2>
            <p>{productsIntro}</p>
          </div>
          <CatalogGrid items={productsItems} />
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="section-head">
            <div className="section-kicker">Как мы работаем</div>
            <h2>Собственное производство BAS TAS</h2>
            <p>Подбор камня, распил, обработка, доставка и монтаж — всё в одной команде, без передачи работы подрядчикам.</p>
          </div>
          <div className="feature-list">
            {PRODUCTION_STEPS.map((item, i) => (
              <div className="feature-item" key={item.title}>
                <b>{String(i + 1).padStart(2, '0')}</b>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="section-kicker">Порядок работы</div>
            <h2>Как заказать</h2>
          </div>
          <div className="feature-list">
            {ORDER_STEPS.map((item, i) => (
              <div className="feature-item" key={item.title}>
                <b>{String(i + 1).padStart(2, '0')}</b>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="section-head">
            <div className="section-kicker">Вопросы и ответы</div>
            <h2>Часто задаваемые вопросы</h2>
          </div>
          <div className="faq-list">
            {faq.map((item) => (
              <details className="faq-item" key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="section-kicker">Натуральный камень</div>
            <h2>Другие материалы</h2>
          </div>
          <div className="tag-links">
            {materialLinks.map((m) => (
              <Link className="tag-link" href={m.href} key={m.href}>{m.name}</Link>
            ))}
            <Link className="tag-link" href={CATALOG_HREF}>Весь каталог</Link>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <div>
            <h2>Подберём {breadcrumbLabel.toLowerCase()} под ваш проект</h2>
            <p>Оставьте заявку — подготовим предварительный расчёт и покажем варианты камня.</p>
          </div>
          <Link className="btn btn-light" href={CONTACTS_HREF}>Обсудить проект</Link>
        </div>
      </section>
    </>
  );
}
