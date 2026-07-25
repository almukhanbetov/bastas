'use client';

import { usePageContent } from '../hooks/usePageContent';
import Multiline from '../components/Multiline';

export default function AboutContent() {
  const content = usePageContent('about');
  const { page_hero: pageHero, intro, numbers } = content;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">Главная / О компании</div>
          <h1><Multiline text={pageHero.title} /></h1>
          <p>{pageHero.body}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="feature-layout">
            <div className="feature-image">
              <img src={intro.imageUrl} alt="BAS TAS" />
            </div>
            <div>
              <div className="section-head">
                <div className="section-kicker">{intro.subtitle}</div>
                <h2>{intro.title}</h2>
              </div>
              <div className="text-columns">
                {(intro.items || []).map((item, i) => (
                  <p key={i}>{item.body}</p>
                ))}
              </div>
            </div>
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
    </>
  );
}
