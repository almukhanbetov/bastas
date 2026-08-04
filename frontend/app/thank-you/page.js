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
    <main>
      <h1>Спасибо! Заявка отправлена</h1>

      <p>
        Наш специалист свяжется с вами для уточнения деталей заказа.
      </p>

      <Link href="/">Вернуться на главную</Link>
    </main>
  );
}