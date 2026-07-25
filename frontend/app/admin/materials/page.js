'use client';

import { useEffect, useState } from 'react';
import { useAdminGuard } from '../useAdminGuard';
import AdminNav from '../AdminNav';
import ImageUploadField from '../ImageUploadField';
import { adminFetch } from '@/lib/adminApi';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const emptyForm = { slug: '', name: '', category: 'natural', priceUsdPerM2: '', description: '', imageUrl: '', sortOrder: 0 };

export default function AdminMaterialsPage() {
  const ready = useAdminGuard();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminFetch(API_URL, '/api/v1/admin/materials')
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (ready) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      slug: item.slug,
      name: item.name,
      category: item.category,
      priceUsdPerM2: String(item.priceUsdPerM2),
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      sortOrder: item.sortOrder,
    });
  };

  const startNew = () => {
    setEditingId('new');
    setForm(emptyForm);
  };

  const cancel = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      slug: form.slug.trim(),
      name: form.name.trim(),
      category: form.category,
      priceUsdPerM2: Number(form.priceUsdPerM2),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      sortOrder: Number(form.sortOrder) || 0,
    };
    try {
      if (editingId && editingId !== 'new') {
        await adminFetch(API_URL, `/api/v1/admin/materials/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await adminFetch(API_URL, '/api/v1/admin/materials', { method: 'POST', body: JSON.stringify(payload) });
      }
      cancel();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить материал?')) return;
    setError('');
    try {
      await adminFetch(API_URL, `/api/v1/admin/materials/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!ready) return null;

  return (
    <>
      <section className="page-hero page-hero-compact">
        <div className="container">
          <div className="breadcrumb">Админ-панель / Материалы</div>
          <h1>Материалы.</h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <AdminNav />

          {error && <p className="calc-hint calc-hint-warning">{error}</p>}

          {editingId ? (
            <form className="calc-form admin-edit-form" onSubmit={handleSubmit}>
              <div className="calc-row">
                <label className="calc-field">
                  <span>Slug</span>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
                </label>
                <label className="calc-field">
                  <span>Название</span>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </label>
              </div>
              <div className="calc-row">
                <label className="calc-field">
                  <span>Категория</span>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="natural">natural</option>
                    <option value="engineered">engineered</option>
                  </select>
                </label>
                <label className="calc-field">
                  <span>Цена, $/м²</span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.priceUsdPerM2}
                    onChange={(e) => setForm({ ...form, priceUsdPerM2: e.target.value })}
                    required
                  />
                </label>
              </div>
              <ImageUploadField
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
              />
              <label className="calc-field">
                <span>Описание</span>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>
              <label className="calc-field">
                <span>Порядок сортировки</span>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                />
              </label>
              <div className="admin-form-actions">
                <button type="submit" className="btn btn-primary">Сохранить</button>
                <button type="button" className="btn btn-line" onClick={cancel}>Отмена</button>
              </div>
            </form>
          ) : (
            <button type="button" className="btn btn-primary" onClick={startNew}>
              + Добавить материал
            </button>
          )}

          {loading ? (
            <p className="calc-hint">Загрузка…</p>
          ) : (
            <div className="admin-table-wrap" style={{ marginTop: 24 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Slug</th>
                    <th>Название</th>
                    <th>Категория</th>
                    <th>Цена, $/м²</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.slug}</td>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.priceUsdPerM2}</td>
                      <td className="admin-row-actions">
                        <button type="button" className="cart-item-remove" onClick={() => startEdit(item)}>
                          Изменить
                        </button>
                        <button type="button" className="cart-item-remove" onClick={() => handleDelete(item.id)}>
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
