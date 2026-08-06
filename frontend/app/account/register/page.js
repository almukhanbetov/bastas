'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { setCustomerToken } from '@/lib/customerAuth';
import PasswordField from '../../components/PasswordField';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/account/';
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || 'Не удалось зарегистрироваться');
      }
      setCustomerToken(data.token);
      router.push(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="calc-form admin-login-form" onSubmit={handleSubmit}>
      <label className="calc-field">
        <span>Имя</span>
        <input value={form.name} onChange={(e) => update('name')(e.target.value)} required autoFocus />
      </label>
      <label className="calc-field">
        <span>Телефон</span>
        <input
          type="tel"
          placeholder="+7 XXX XXX XX XX"
          value={form.phone}
          onChange={(e) => update('phone')(e.target.value)}
          required
        />
      </label>
      <label className="calc-field">
        <span>Email</span>
        <input type="email" value={form.email} onChange={(e) => update('email')(e.target.value)} />
      </label>
      <PasswordField
        label="Пароль (минимум 6 символов)"
        value={form.password}
        onChange={update('password')}
        required
      />
      {error && <p className="calc-hint calc-hint-warning">{error}</p>}
      <button type="submit" className="btn btn-primary calc-cta" disabled={submitting}>
        {submitting ? 'Регистрация…' : 'Зарегистрироваться'}
      </button>
      <p className="calc-hint">
        Уже есть аккаунт? <Link href={`/account/login/?next=${encodeURIComponent(next)}`}>Войти</Link>
      </p>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <>
      <section className="page-hero page-hero-compact">
        <div className="container">
          <div className="breadcrumb">Главная / Регистрация</div>
          <h1>Регистрация.</h1>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <Suspense fallback={<p className="calc-hint">Загрузка…</p>}>
            <RegisterForm />
          </Suspense>
        </div>
      </section>
    </>
  );
}
