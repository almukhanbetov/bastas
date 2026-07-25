-- Заменяет общие интерьерные фото на реальные фото каждого камня (проверены вручную).
UPDATE stone_catalog SET image_url = 'https://images.unsplash.com/photo-1550053808-52a75a05955d?auto=format&fit=crop&w=1000&q=85' WHERE slug = 'marble';
UPDATE stone_catalog SET image_url = 'https://images.unsplash.com/photo-1733085097233-66441dedba94?auto=format&fit=crop&w=1000&q=85' WHERE slug = 'granite';
UPDATE stone_catalog SET image_url = 'https://images.unsplash.com/photo-1669577130208-a0a7cce8584f?auto=format&fit=crop&w=1000&q=85' WHERE slug = 'travertine';
UPDATE stone_catalog SET image_url = 'https://images.unsplash.com/photo-1701251786408-d0320ecaad8d?auto=format&fit=crop&w=1000&q=85' WHERE slug = 'onyx';
UPDATE stone_catalog SET image_url = 'https://images.unsplash.com/photo-1525468568166-6f2cd17c7ec9?auto=format&fit=crop&w=1000&q=85' WHERE slug = 'quartzite';
UPDATE stone_catalog SET image_url = 'https://images.unsplash.com/photo-1566041510394-cf7c8fe21800?auto=format&fit=crop&w=1000&q=85' WHERE slug = 'slabs';
