'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAdminGuard } from '../../useAdminGuard';
import AdminNav from '../../AdminNav';
import ImageUploadField from '../../ImageUploadField';
import { adminFetch } from '@/lib/adminApi';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const emptyItem = { title: '', subtitle: '', body: '', image_url: '', link_url: '' };

function ContentEditContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const ready = useAdminGuard();

  const [section, setSection] = useState(null);
  const [form, setForm] = useState(null);
  const [items, setItems] = useState([]);
  const [extraText, setExtraText] = useState('{}');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ready || !id) return;
    adminFetch(API_URL, `/api/v1/admin/content/${id}`)
      .then((s) => {
        setSection(s);
        setForm({
          title: s.title || '',
          subtitle: s.subtitle || '',
          body: s.body || '',
          imageUrl: s.imageUrl || '',
          sortOrder: s.sortOrder,
        });
        setItems(Array.isArray(s.items) ? s.items : []);
        setExtraText(JSON.stringify(s.extra || {}, null, 2));
      })
      .catch((err) => setError(err.message));
  }, [ready, id]);

  if (!ready) return null;
  if (!id) return <p className="calc-hint calc-hint-warning">Не указана секция.</p>;
  if (error && !section) return <p className="calc-hint calc-hint-warning">{error}</p>;
  if (!form) return <p className="calc-hint">Загрузка…</p>;

  const updateItem = (idx, field, value) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  };
  const addItem = () => setItems((prev) => [...prev, { ...emptyItem }]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let extra;
    try {
      extra = JSON.parse(extraText || '{}');
    } catch {
      setError('Поле «Доп. поля (JSON)» содержит некорректный JSON.');
      return;
    }

    // пустые поля в items не отправляем как пустые строки — убираем, чтобы не засорять JSON
    const cleanedItems = items.map((it) => {
      const cleaned = {};
      Object.entries(it).forEach(([k, v]) => {
        if (v !== '') cleaned[k] = v;
      });
      return cleaned;
    });

    setSaving(true);
    try {
      await adminFetch(API_URL, `/api/v1/admin/content/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          page: section.page,
          sectionKey: section.sectionKey,
          sortOrder: Number(form.sortOrder) || 0,
          title: form.title,
          subtitle: form.subtitle,
          body: form.body,
          imageUrl: form.imageUrl,
          items: cleanedItems,
          extra,
        }),
      });
      router.push('/admin/content/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <p className="calc-hint">
        {section.page} / {section.sectionKey}
      </p>

      <form className="calc-form admin-edit-form" onSubmit={handleSubmit}>
        <div className="calc-row">
          <label className="calc-field">
            <span>Заголовок</span>
            <textarea rows={2} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label className="calc-field">
            <span>Подзаголовок / kicker</span>
            <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          </label>
        </div>

        <label className="calc-field">
          <span>Текст</span>
          <textarea rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </label>

        <div className="calc-row">
          <ImageUploadField
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
          />
          <label className="calc-field">
            <span>Порядок сортировки</span>
            <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
          </label>
        </div>

        <div className="admin-order-section">
          <h3>Элементы ({items.length})</h3>
          {items.map((item, idx) => (
            <div className="admin-item-row" key={idx}>
              <div className="calc-row">
                <label className="calc-field">
                  <span>Заголовок</span>
                  <input value={item.title || ''} onChange={(e) => updateItem(idx, 'title', e.target.value)} />
                </label>
                <label className="calc-field">
                  <span>Подзаголовок / тег</span>
                  <input value={item.subtitle || ''} onChange={(e) => updateItem(idx, 'subtitle', e.target.value)} />
                </label>
              </div>
              <label className="calc-field">
                <span>Текст</span>
                <textarea rows={2} value={item.body || ''} onChange={(e) => updateItem(idx, 'body', e.target.value)} />
              </label>
              <div className="calc-row">
                <ImageUploadField
                  value={item.image_url}
                  onChange={(url) => updateItem(idx, 'image_url', url)}
                />
                <label className="calc-field">
                  <span>Ссылка (для контактов: tel:/mailto:)</span>
                  <input value={item.link_url || ''} onChange={(e) => updateItem(idx, 'link_url', e.target.value)} />
                </label>
              </div>
              <button type="button" className="cart-item-remove" onClick={() => removeItem(idx)}>
                Удалить элемент
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-line" onClick={addItem}>
            + Добавить элемент
          </button>
        </div>

        <label className="calc-field">
          <span>Доп. поля (JSON, необязательно)</span>
          <textarea rows={3} value={extraText} onChange={(e) => setExtraText(e.target.value)} />
        </label>

        {error && <p className="calc-hint calc-hint-warning">{error}</p>}

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      </form>
    </>
  );
}

export default function AdminContentEditPage() {
  return (
    <>
      <section className="page-hero page-hero-compact">
        <div className="container">
          <div className="breadcrumb">Админ-панель / Контент страниц / Редактирование</div>
          <h1>Редактирование секции.</h1>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <AdminNav />
          <Suspense fallback={<p className="calc-hint">Загрузка…</p>}>
            <ContentEditContent />
          </Suspense>
        </div>
      </section>
    </>
  );
}
