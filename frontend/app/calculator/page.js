import StoneCalculator from '../components/StoneCalculator';

export const metadata = {
  title: 'Калькулятор стоимости — BAS TAS',
  description: 'Рассчитайте предварительную стоимость изделия из натурального или искусственного камня онлайн.',
};

export default function CalculatorPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">Главная / Калькулятор</div>
          <h1>Предварительный расчёт<br />стоимости изделия.</h1>
          <p>Укажите параметры изделия — площадь, толщину, обработку торца и дополнительные работы — и получите ориентировочную стоимость сразу.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <StoneCalculator />
        </div>
      </section>
    </>
  );
}
