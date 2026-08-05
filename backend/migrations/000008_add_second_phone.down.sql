UPDATE page_sections
SET items = '[{"title":"Телефон","body":"+7 (701) 465 70 70","link_url":"tel:+77014657070"},{"title":"Email","body":"info@bastas.kz","link_url":"mailto:info@bastas.kz"},{"title":"Адрес","body":"Алматы, Казахстан"},{"title":"Время работы","body":"Пн–Пт, 10:00–19:00\nСб–Вс, 11:00–18:00"}]'::jsonb
WHERE page = 'contacts' AND section_key = 'info';
