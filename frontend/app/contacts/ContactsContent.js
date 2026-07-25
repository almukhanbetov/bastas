'use client';

import { usePageContent } from '../hooks/usePageContent';
import Multiline from '../components/Multiline';

export default function ContactsContent() {
  const content = usePageContent('contacts');
  const { page_hero: pageHero, info, map } = content;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">Главная / Контакты</div>
          <h1>{pageHero.title}</h1>
          <p>{pageHero.body}</p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-layout">
          <div className="contact-panel">
            <h2><Multiline text={info.title} /></h2>
            {(info.items || []).map((item, i) => (
              <div className="contact-detail" key={i}>
                <span>{item.title}</span>
                {item.link_url ? (
                  <a href={item.link_url}>{item.body}</a>
                ) : (
                  <b><Multiline text={item.body} /></b>
                )}
              </div>
            ))}
            {info.extra?.whatsappLink && (
              <a
                className="btn btn-light"
                href={info.extra.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginTop: 27 }}
              >
                {info.extra.whatsappText}
              </a>
            )}
          </div>
          <div className="contact-photo">
            <img src={info.imageUrl} alt="Шоурум BAS TAS" />
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="map-placeholder">{map.body}</div>
        </div>
      </section>
    </>
  );
}
