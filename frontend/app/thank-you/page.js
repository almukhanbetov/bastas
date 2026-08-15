import Link from "next/link";

export const metadata = {
  title: "Заявка отправлена",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouPage() {
  return (
    <section className="thank-you-section">
      <div className="container">
        <div className="cart-empty">
          <h1>Спасибо! Заявка отправлена</h1>

          <p>
            Наш специалист свяжется с вами для уточнения деталей заказа.
          </p>

          <Link className="btn btn-primary" href="/">
            Вернуться на главную
          </Link>
        </div>
      </div>
    </section>
  );
}
