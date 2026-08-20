import Script from 'next/script';
import { Manrope } from 'next/font/google';
import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { CartProvider } from './context/CartContext';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

const SITE_URL = 'https://www.bastas.kz';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'BAS TAS — Натуральный камень',
  description: 'Натуральный камень для интерьеров и фасадов. Продажа, производство, монтаж.',
};

// Только подтверждённые данные (см. lib/staticContent.js: contacts.info) —
// без адреса/координат/рейтингов, которых нет в проекте.
const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'BAS TAS',
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/logo.png`,
  telephone: '+77014657070',
  email: 'info@bastas.kz',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Алматы',
    addressCountry: 'KZ',
  },
};

// Устанавливает data-theme до гидрации, чтобы избежать мигания темы при загрузке.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('bastas-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={manrope.variable} suppressHydrationWarning>
      <head>
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-P3M5VW6W');`}
        </Script>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <script
          id="organization-jsonld"
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-P3M5VW6W"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
