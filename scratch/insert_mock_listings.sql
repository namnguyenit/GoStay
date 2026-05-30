-- Mock listings cho "Vườn quốc gia Ba Vì" (lon 29, lat 3)
INSERT INTO listings (id, title, description, category, status, province, longitude, latitude, location, base_price, average_rating, thumbnail_url, created_at, updated_at) 
VALUES 
(gen_random_uuid(), 'Melia Bavi Mountain Retreat (Demo STAY)', 'Khu nghỉ dưỡng 5 sao giữa rừng quốc gia.', 'STAY', 'ACTIVE', 'Hà Nội', 29.01, 3.01, ST_SetSRID(ST_MakePoint(29.01, 3.01), 4326), 2500000, 4.8, 'https://res.cloudinary.com/df9vssnt8/image/upload/v1727783307/z6214371900115_c8f2ba57161b96277d337d10e6f77cc6_v2zrcj.jpg', now(), now()),

(gen_random_uuid(), 'Tour cắm trại đồi thông (Demo EXP)', 'Trải nghiệm cắm trại đêm.', 'EXP', 'ACTIVE', 'Hà Nội', 29.02, 3.02, ST_SetSRID(ST_MakePoint(29.02, 3.02), 4326), 500000, 4.5, 'https://res.cloudinary.com/df9vssnt8/image/upload/v1727783307/z6214371900115_c8f2ba57161b96277d337d10e6f77cc6_v2zrcj.jpg', now(), now()),

(gen_random_uuid(), 'Nhà hàng lá cọ (Demo SVC)', 'Đặc sản núi rừng Ba Vì.', 'SVC', 'ACTIVE', 'Hà Nội', 29.005, 3.005, ST_SetSRID(ST_MakePoint(29.005, 3.005), 4326), 200000, 4.2, 'https://res.cloudinary.com/df9vssnt8/image/upload/v1727783307/z6214371900115_c8f2ba57161b96277d337d10e6f77cc6_v2zrcj.jpg', now(), now());

-- Mock listings cho "Hạ Long" (lon 109.8, lat 21.9)
INSERT INTO listings (id, title, description, category, status, province, longitude, latitude, location, base_price, average_rating, thumbnail_url, created_at, updated_at) 
VALUES 
(gen_random_uuid(), 'Khách sạn Mường Thanh Hạ Long (Demo STAY)', 'Khách sạn view biển tuyệt đẹp.', 'STAY', 'ACTIVE', 'Quảng Ninh', 109.81, 21.91, ST_SetSRID(ST_MakePoint(109.81, 21.91), 4326), 1500000, 4.9, 'https://res.cloudinary.com/df9vssnt8/image/upload/v1727783307/z6214371900115_c8f2ba57161b96277d337d10e6f77cc6_v2zrcj.jpg', now(), now()),

(gen_random_uuid(), 'Du thuyền 5 sao vịnh Hạ Long (Demo EXP)', 'Trải nghiệm ngủ đêm trên du thuyền sang trọng.', 'EXP', 'ACTIVE', 'Quảng Ninh', 109.82, 21.92, ST_SetSRID(ST_MakePoint(109.82, 21.92), 4326), 3500000, 4.7, 'https://res.cloudinary.com/df9vssnt8/image/upload/v1727783307/z6214371900115_c8f2ba57161b96277d337d10e6f77cc6_v2zrcj.jpg', now(), now()),

(gen_random_uuid(), 'Quán ăn hải sản Hồng Hạnh (Demo SVC)', 'Nhà hàng hải sản tươi sống.', 'SVC', 'ACTIVE', 'Quảng Ninh', 109.79, 21.89, ST_SetSRID(ST_MakePoint(109.79, 21.89), 4326), 500000, 4.6, 'https://res.cloudinary.com/df9vssnt8/image/upload/v1727783307/z6214371900115_c8f2ba57161b96277d337d10e6f77cc6_v2zrcj.jpg', now(), now());

