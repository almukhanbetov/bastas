'use client';

import { useState } from 'react';
import { adminUpload } from '@/lib/adminApi';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ImageUploadField({ value, onChange, label = 'Фото (URL)' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // чтобы можно было выбрать тот же файл повторно
    if (!file) return;

    setError('');
    setUploading(true);
    try {
      const data = await adminUpload(API_URL, '/api/v1/admin/uploads', file);
      onChange(`${API_URL}${data.url}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className="calc-field">
      <span>{label}</span>
      <input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="https://..." />
      <div className="admin-upload-row">
        <span className="btn btn-line admin-upload-btn">
          {uploading ? 'Загрузка…' : 'Загрузить файл'}
          <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} />
        </span>
        {value && <img src={value} alt="" className="admin-upload-preview" />}
      </div>
      {error && <span className="admin-upload-error">{error}</span>}
    </label>
  );
}
