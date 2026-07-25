'use client';

import { usePageContent } from '../hooks/usePageContent';
import Multiline from '../components/Multiline';

export default function AdvantagesContent() {
  const content = usePageContent('advantages');
  const { page_hero: pageHero, features } = content;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">Главная / Преимущества</div>
          <h1><Multiline text={pageHero.title} /></h1>
          <p>{pageHero.body}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="feature-list">
            {(features.items || []).map((item, i) => (
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
    </>
  );
}
