-- Значения синхронизированы с frontend/lib/pricing.js на момент миграции backend на БД.
INSERT INTO materials (slug, name, category, price_usd_per_m2, sort_order) VALUES
    ('marble', 'Мрамор', 'natural', 100, 1),
    ('granite', 'Гранит', 'natural', 120, 2),
    ('quartzite', 'Кварцит', 'natural', 150, 3),
    ('quartz_agglomerate', 'Кварцевый агломерат', 'engineered', 90, 4);

INSERT INTO thickness_options (value_mm, factor, sort_order) VALUES
    (20, 1.0, 1),
    (30, 1.2, 2);

INSERT INTO edge_types (slug, name, price_per_meter, sort_order) VALUES
    ('none', 'Без обработки', 0, 1),
    ('straight', 'Прямая фаска', 8000, 2),
    ('polished', 'Фаска с полировкой', 15500, 3),
    ('profile', 'Сложный профиль', 22000, 4);

INSERT INTO service_prices (slug, name, price) VALUES
    ('sink_cutout', 'Вырез под мойку', 15000),
    ('hob_cutout', 'Вырез под варочную панель', 15000),
    ('hole', 'Отверстие', 3000),
    ('installation', 'Монтаж', 20000),
    ('delivery', 'Доставка', 15000);

INSERT INTO settings (key, value) VALUES
    ('usd_rate', '550'),
    ('markup', '1.3');

INSERT INTO stone_catalog (slug, name, tag, image_url, sort_order) VALUES
    ('marble', 'Мрамор', 'Элегантность', 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1000&q=85', 1),
    ('granite', 'Гранит', 'Прочность', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=85', 2),
    ('travertine', 'Травертин', 'Природная фактура', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85', 3),
    ('onyx', 'Оникс', 'Свет и глубина', 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1000&q=85', 4),
    ('quartzite', 'Кварцит', 'Выразительность', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85', 5),
    ('slabs', 'Слэбы', 'Для особых проектов', 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1000&q=85', 6);

INSERT INTO product_types (slug, name, description, image_url, sort_order) VALUES
    ('countertops', 'Столешницы', 'Кухонные и ванные поверхности', 'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=850&q=85', 1),
    ('stairs', 'Лестницы', 'Ступени и лестничные марши', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=850&q=85', 2),
    ('cladding', 'Облицовка стен', 'Интерьеры, холлы, санузлы', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=850&q=85', 3),
    ('facade', 'Фасады', 'Архитектурная облицовка', 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=850&q=85', 4),
    ('windowsills', 'Подоконники', 'Практичные детали интерьера', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=850&q=85', 5),
    ('mosaic', 'Панно и мозаика', 'Акцентные поверхности', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=850&q=85', 6);
