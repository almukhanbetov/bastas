import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Link className="brand" href="/">
              <img src="/logo.png" alt="BAS TAS" />
            </Link>
            <p>Натуральный камень для фасадов, интерьеров и архитектурных решений.</p>
          </div>
          <div>
            <h4>Навигация</h4>
            <div className="footer-links">
              <Link href="/about/">О компании</Link>
              <Link href="/catalog/">Каталог камня</Link>
              <Link href="/products/">Виды изделий</Link>
              <Link href="/advantages/">Преимущества</Link>
            </div>
          </div>
          <div>
            <h4>Натуральный камень</h4>
            <div className="footer-links">
              <Link href="/mramor-almaty/">Мрамор в Алматы</Link>
              <Link href="/granit-almaty/">Гранит в Алматы</Link>
              <Link href="/travertin-almaty/">Травертин в Алматы</Link>
              <Link href="/oniks-almaty/">Оникс в Алматы</Link>
            </div>
          </div>
          <div>
            <h4>Контакты</h4>
            <div className="footer-links">
              <a href="tel:+77014657070">+7 (701) 465 70 70</a>
              <a href="tel:+77024369056">+7 (702) 436 90 56</a>
              <a href="mailto:info@bastas.kz">info@bastas.kz</a>
              <span>Алматы, Казахстан</span>
              <Link href="/contacts/">Все контакты →</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 BAS TAS. Все права защищены.</span>
          <span>bastas.kz</span>
        </div>
      </div>
    </footer>
  );
}
