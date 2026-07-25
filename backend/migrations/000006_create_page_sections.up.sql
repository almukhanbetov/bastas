-- Генеративная модель контента: одна таблица описывает текстовые/фото-блоки
-- главной, "о компании", "преимуществ" и "контактов". Каждая секция —
-- title/subtitle/body/image_url (одиночные поля) + items (JSONB-массив
-- повторяющихся элементов: карточки, шаги, статистика, контактные строки).
-- Это даёт add/edit/delete на уровне items без отдельной таблицы под каждый тип блока.
CREATE TABLE page_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page TEXT NOT NULL,
    section_key TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    title TEXT,
    subtitle TEXT,
    body TEXT,
    image_url TEXT,
    items JSONB NOT NULL DEFAULT '[]',
    extra JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (page, section_key)
);

CREATE INDEX idx_page_sections_page ON page_sections(page);

-- Сид переносит РОВНО текущий текст/фото со страниц (см. app/page.js,
-- app/about/page.js, app/advantages/page.js, app/contacts/page.js) —
-- визуально на сайте ничего не меняется, редактировать можно сразу из админки.
INSERT INTO page_sections (page, section_key, sort_order, title, subtitle, body, image_url, items, extra) VALUES

('home', 'hero', 1,
 'Камень, который становится частью архитектуры.',
 'BAS TAS · Алматы · Казахстан',
 'Мрамор, гранит, травертин и оникс для частных интерьеров, фасадов и коммерческих пространств.',
 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85',
 '[{"title":"15 лет","body":"работаем с камнем"},{"title":"240+","body":"оттенков в наличии"},{"title":"Под ключ","body":"от подбора до монтажа"}]',
 '{"heroLabelEyebrow":"Материалы","heroLabelTitle":"Мрамор. Гранит. Оникс."}'),

('home', 'intro', 2,
 'Мы не просто продаём камень. Мы создаём поверхности, которые работают десятилетиями.',
 'О BAS TAS',
 'Собственное производство, опытные мастера и контроль на каждом этапе позволяют реализовывать сложные проекты с точностью до деталей. От выбора слэба до профессионального монтажа — всё в одной команде.',
 NULL, '[]', '{}'),

('home', 'numbers', 3, NULL, NULL, NULL, NULL,
 '[{"title":"15","body":"лет опыта"},{"title":"500+","body":"реализованных проектов"},{"title":"240+","body":"оттенков камня"},{"title":"9","body":"этапов контроля"}]',
 '{}'),

('home', 'catalog_teaser', 4,
 'Характер каждого пространства начинается с материала.',
 'Каталог камня',
 NULL, NULL,
 '[{"title":"Мрамор","subtitle":"Классика","image_url":"https://images.unsplash.com/photo-1550053808-52a75a05955d?auto=format&fit=crop&w=1200&q=85"},{"title":"Гранит","subtitle":"Надёжность","image_url":"https://images.unsplash.com/photo-1733085097233-66441dedba94?auto=format&fit=crop&w=800&q=85"},{"title":"Травертин","subtitle":"Тепло","image_url":"https://images.unsplash.com/photo-1669577130208-a0a7cce8584f?auto=format&fit=crop&w=800&q=85"}]',
 '{}'),

('home', 'feature', 5,
 'Точный результат — без лишних согласований.',
 'Работа под ключ',
 NULL,
 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1100&q=85',
 '[{"title":"Подбор камня","body":"Покажем слэбы, предложим материал под стиль, задачу и бюджет проекта."},{"title":"Изготовление","body":"Резка, обработка кромок и деталей на собственном производстве."},{"title":"Монтаж","body":"Аккуратная установка с соблюдением технологии, сроков и проекта."}]',
 '{}'),

('home', 'products_teaser', 6,
 'Камень для интерьера, экстерьера и деталей, которые задают уровень.',
 'Виды изделий',
 NULL, NULL,
 '[{"title":"Столешницы","body":"Кухни, ванные, барные зоны","image_url":"https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=850&q=85"},{"title":"Лестницы","body":"Ступени, подступёнки, площадки","image_url":"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=850&q=85"},{"title":"Фасады","body":"Облицовка и архитектурные элементы","image_url":"https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=850&q=85"}]',
 '{}'),

('home', 'cta', 7,
 'Подберём натуральный камень под ваш проект.',
 NULL,
 'Оставьте заявку — подготовим предварительный расчёт и предложим материалы.',
 NULL, '[]', '{}'),

('about', 'page_hero', 1,
 E'Профессиональный подход\nк натуральному камню.',
 NULL,
 'Команда BAS TAS объединяет подбор, производство и монтаж, чтобы результат выглядел целостно и служил долго.',
 NULL, '[]', '{}'),

('about', 'intro', 2,
 'У камня нет случайных деталей.',
 'Наша философия',
 NULL,
 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1100&q=85',
 '[{"body":"Натуральный камень отличается рисунком, плотностью и характером. Поэтому мы начинаем каждый проект не с шаблона, а с задачи клиента и особенностей пространства."},{"body":"Мы работаем с частными интерьерами, общественными объектами, фасадами и архитектурными элементами. Берём на себя все этапы — от консультации до сдачи готовой работы."}]',
 '{}'),

('about', 'numbers', 3, NULL, NULL, NULL, NULL,
 '[{"title":"15","body":"лет опыта"},{"title":"28","body":"стран-поставщиков"},{"title":"20 000","body":"м² камня в наличии"},{"title":"1","body":"команда на проект"}]',
 '{}'),

('advantages', 'page_hero', 1,
 E'Внимание к материалу.\nОтветственность за результат.',
 NULL,
 'Делаем процесс понятным, а качество — предсказуемым на каждом этапе.',
 NULL, '[]', '{}'),

('advantages', 'features', 2, NULL, NULL, NULL, NULL,
 '[{"title":"Собственное производство","body":"Контролируем резку, обработку и качество каждой детали, а не передаём работу третьим лицам."},{"title":"Редкие материалы","body":"Подбираем мрамор, гранит, травертин и оникс от проверенных поставщиков."},{"title":"Комплексный подход","body":"От замера и выбора материала до доставки и монтажа одной командой."},{"title":"Техническая точность","body":"Учитываем нагрузки, раскладку, швы, обработку кромок и особенности эксплуатации."}]',
 '{}'),

('contacts', 'page_hero', 1,
 'Расскажите о вашем проекте.',
 NULL,
 'Покажем материалы, подготовим ориентировочный расчёт и подскажем оптимальное решение.',
 NULL, '[]', '{}'),

('contacts', 'info', 2,
 E'Связаться\nс BAS TAS',
 NULL, NULL,
 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=85',
 '[{"title":"Телефон","body":"+7 (701) 465 70 70","link_url":"tel:+77014657070"},{"title":"Email","body":"info@bastas.kz","link_url":"mailto:info@bastas.kz"},{"title":"Адрес","body":"Алматы, Казахстан"},{"title":"Время работы","body":"Пн–Пт, 10:00–19:00\nСб–Вс, 11:00–18:00"}]',
 '{"whatsappText":"Написать в WhatsApp","whatsappLink":"https://wa.me/77014657070"}'),

('contacts', 'map', 3, NULL, NULL, 'Карта расположения шоурума', NULL, '[]', '{}');
