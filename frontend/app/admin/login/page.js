'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAdminToken } from '@/lib/adminAuth';
import PasswordField from '../../components/PasswordField';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || 'Не удалось войти');
      }
      setAdminToken(data.token);
      router.push('/admin/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="page-hero page-hero-compact">
        <div className="container">
          <div className="breadcrumb">Админ-панель</div>
          <h1>Вход в админ-панель.</h1>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <form className="calc-form admin-login-form" onSubmit={handleSubmit}>
            <label className="calc-field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </label>
            <PasswordField label="Пароль" value={password} onChange={setPassword} required />
            {error && <p className="calc-hint calc-hint-warning">{error}</p>}
            <button type="submit" className="btn btn-primary calc-cta" disabled={submitting}>
              {submitting ? 'Вход…' : 'Войти'}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
