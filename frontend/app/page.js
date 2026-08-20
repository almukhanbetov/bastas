'use client';

import Link from 'next/link';
import { usePageContent } from './hooks/usePageContent';

export default function HomePage() {
  const content = usePageContent('home');
  const { hero, intro, numbers, catalog_teaser: catalogTeaser, feature, products_teaser: productsTeaser, cta } = content;

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">{hero.subtitle}</div>
          <h1>{hero.title}</h1>
          <p>{hero.body}</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/calculator/">Получить расчёт</Link>
            <Link className="btn btn-line" href="/catalog/">Смотреть каталог</Link>
          </div>
          <div className="hero-note">
            {(hero.items || []).map((item, i) => (
              <span key={i}>
                <b>{item.title}</b>
                <br />
                {item.body}
              </span>
            ))}
          </div>
        </div>
        <div className="hero-media">
          <img src={hero.imageUrl} alt={hero.extra?.heroLabelTitle || ''} />
          <div className="hero-label">
            <span>{hero.extra?.heroLabelEyebrow}</span>
            <strong>{hero.extra?.heroLabelTitle}</strong>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="intro-grid">
            <div>
              <div className="section-kicker">{intro.subtitle}</div>
              <div className="intro-quote">{intro.title}</div>
            </div>
            <div className="intro-text">{intro.body}</div>
          </div>
          <div className="numbers">
            {(numbers.items || []).map((item, i) => (
              <div className="number" key={i}>
                <b>{item.title}</b>
                <span>{item.body}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="section-head">
            <div className="section-kicker">{catalogTeaser.subtitle}</div>
            <h2>{catalogTeaser.title}</h2>
          </div>
          <div className="stone-grid">
            {(catalogTeaser.items || []).map((item, i) => (
              <Link
                className={i === 0 ? 'stone-card large' : 'stone-card small'}
                href="/catalog/"
                key={item.title}
              >
                <img src={item.image_url} alt={item.title} />
                <div className="stone-info">
                  <span>{item.subtitle}</span>
                  <h3>{item.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="section-kicker">Натуральный камень</div>
            <h2>Материалы для вашего проекта в Алматы</h2>
          </div>
          <div className="tag-links">
            <Link className="tag-link" href="/mramor-almaty/">Мрамор</Link>
            <Link className="tag-link" href="/granit-almaty/">Гранит</Link>
            <Link className="tag-link" href="/travertin-almaty/">Травертин</Link>
            <Link className="tag-link" href="/oniks-almaty/">Оникс</Link>
          </div>
          <div className="tag-links" style={{ marginTop: 14 }}>
            <Link className="tag-link" href="/stoleshnitsy-iz-mramora/">Столешницы из мрамора</Link>
            <Link className="tag-link" href="/lestnitsy-iz-mramora/">Лестницы из мрамора</Link>
            <Link className="tag-link" href="/podokonniki-iz-mramora/">Подоконники из мрамора</Link>
            <Link className="tag-link" href="/slaby-mramora/">Слэбы мрамора</Link>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container feature-layout">
          <div className="feature-image">
            <img src={feature.imageUrl} alt={feature.title} />
          </div>
          <div>
            <div className="section-head">
              <div className="section-kicker">{feature.subtitle}</div>
              <h2>{feature.title}</h2>
            </div>
            <div className="feature-list">
              {(feature.items || []).map((item, i) => (
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
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head center">
            <div className="section-kicker">{productsTeaser.subtitle}</div>
            <h2>{productsTeaser.title}</h2>
          </div>
          <div className="projects">
            {(productsTeaser.items || []).map((item) => (
              <Link className="project-card" href="/products/" key={item.title}>
                <img src={item.image_url} alt={item.title} />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <div>
            <h2>{cta.title}</h2>
            <p>{cta.body}</p>
          </div>
          <Link className="btn btn-light" href="/contacts/">Обсудить проект</Link>
        </div>
      </section>
    </>
  );
}
