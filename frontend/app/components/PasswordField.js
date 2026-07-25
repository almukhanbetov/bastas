'use client';

import { useState } from 'react';

export default function PasswordField({ label, value, onChange, required, autoFocus }) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="calc-field">
      <span>{label}</span>
      <div className="calc-input-wrap">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          autoFocus={autoFocus}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
          tabIndex={-1}
        >
          {visible ? '🙈' : '👁'}
        </button>
      </div>
    </label>
  );
}
