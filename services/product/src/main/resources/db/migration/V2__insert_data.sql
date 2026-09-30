INSERT INTO category (id, description, name) VALUES (nextval('category_seq'), 'Computer Keyboards', 'Keyboards');
INSERT INTO category (id, description, name) VALUES (nextval('category_seq'), 'Computer Monitors', 'Monitors');
INSERT INTO category (id, description, name) VALUES (nextval('category_seq'), 'Display Screens', 'Screens');
INSERT INTO category (id, description, name) VALUES (nextval('category_seq'), 'Computer Mice', 'Mice');
INSERT INTO category (id, description, name) VALUES (nextval('category_seq'), 'Computer Accessories', 'Accessories');


-- Assuming you already have a sequence named 'product_seq'

-- Insert products for the 'Keyboards' category
INSERT INTO public.product
(id, available_quantity, description, name, price, category_id)
VALUES

(nextval('product_seq'), 20,
 'Advanced wireless illuminated keyboard with low-profile keys, smart backlighting and multi-device support',
 'Logitech MX Keys S',
 10999.00,
 (SELECT id FROM category WHERE name = 'Keyboards')),

(nextval('product_seq'), 15,
 'Compact 75 percent mechanical keyboard with hot-swappable switches, Bluetooth and USB-C connectivity',
 'Keychron K2 Pro',
 8999.00,
 (SELECT id FROM category WHERE name = 'Keyboards')),

(nextval('product_seq'), 12,
 'Wireless mechanical gaming keyboard with LIGHTSPEED connectivity, programmable keys and RGB lighting',
 'Logitech G915 TKL',
 17999.00,
 (SELECT id FROM category WHERE name = 'Keyboards')),

(nextval('product_seq'), 18,
 'Mechanical gaming keyboard featuring customizable RGB lighting and durable switches',
 'Razer BlackWidow V4',
 13999.00,
 (SELECT id FROM category WHERE name = 'Keyboards')),

(nextval('product_seq'), 25,
 'Wireless keyboard with full-size layout, quiet keys and reliable 2.4GHz connectivity',
 'Logitech Signature K650',
 4999.00,
 (SELECT id FROM category WHERE name = 'Keyboards'));
 
-- Insert products for the 'Monitors' category
INSERT INTO public.product
(id, available_quantity, description, name, price, category_id)
VALUES

(nextval('product_seq'), 10,
 '27-inch 4K UHD IPS Black monitor with USB-C hub, DisplayPort and up to 90W power delivery',
 'Dell UltraSharp U2723QE',
 54999.00,
 (SELECT id FROM category WHERE name = 'Monitors')),

(nextval('product_seq'), 12,
 '27-inch QHD Nano IPS gaming monitor with high refresh rate, fast response time and adaptive sync',
 'LG UltraGear 27GP850-B',
 32999.00,
 (SELECT id FROM category WHERE name = 'Monitors')),

(nextval('product_seq'), 15,
 '27-inch QHD gaming monitor with curved display, high refresh rate and AMD FreeSync support',
 'Samsung Odyssey G5 27',
 24999.00,
 (SELECT id FROM category WHERE name = 'Monitors')),

(nextval('product_seq'), 14,
 '27-inch QHD professional monitor with IPS panel, wide color coverage and ergonomic stand',
 'ASUS ProArt Display PA278QV',
 29999.00,
 (SELECT id FROM category WHERE name = 'Monitors')),

(nextval('product_seq'), 20,
 '27-inch QHD gaming monitor with high refresh rate, fast response time and HDR support',
 'Acer Nitro XV272U',
 27999.00,
 (SELECT id FROM category WHERE name = 'Monitors'));

-- Insert products for the 'Screens' category
INSERT INTO public.product
(id, available_quantity, description, name, price, category_id)
VALUES

(nextval('product_seq'), 8,
 '42-inch 4K OLED display with self-lit pixels, HDR support and gaming-focused features',
 'LG OLED C4 42',
 104999.00,
 (SELECT id FROM category WHERE name = 'Screens')),

(nextval('product_seq'), 10,
 '43-inch 4K QLED smart display with HDR support and high-quality color reproduction',
 'Samsung QN90D 43',
 89999.00,
 (SELECT id FROM category WHERE name = 'Screens')),

(nextval('product_seq'), 7,
 '48-inch 4K OLED display designed for gaming and entertainment with HDR support',
 'LG OLED C4 48',
 124999.00,
 (SELECT id FROM category WHERE name = 'Screens')),

(nextval('product_seq'), 12,
 '32-inch 4K UHD display with HDR support and smart connectivity for work and entertainment',
 'Samsung Smart Monitor M8 32',
 54999.00,
 (SELECT id FROM category WHERE name = 'Screens')),

(nextval('product_seq'), 10,
 '55-inch 4K OLED smart television with HDR support and advanced picture processing',
 'Sony BRAVIA 8 55',
 149999.00,
 (SELECT id FROM category WHERE name = 'Screens'));

-- Insert products for the 'Mice' category
INSERT INTO public.product
(id, available_quantity, description, name, price, category_id)
VALUES

(nextval('product_seq'), 20,
 'Wireless gaming mouse with HERO 25K sensor, LIGHTFORCE switches and programmable controls',
 'Logitech G502 X LIGHTSPEED',
 13999.00,
 (SELECT id FROM category WHERE name = 'Mice')),

(nextval('product_seq'), 25,
 'Ergonomic wireless mouse with high-precision tracking and Bluetooth multi-device connectivity',
 'Logitech MX Master 3S',
 8999.00,
 (SELECT id FROM category WHERE name = 'Mice')),

(nextval('product_seq'), 18,
 'Wireless gaming mouse with Focus Pro sensor, optical switches and customizable RGB lighting',
 'Razer DeathAdder V3 Pro',
 12999.00,
 (SELECT id FROM category WHERE name = 'Mice')),

(nextval('product_seq'), 22,
 'Lightweight wireless gaming mouse with high-precision sensor and low-latency wireless connection',
 'Razer Viper V3 Pro',
 15999.00,
 (SELECT id FROM category WHERE name = 'Mice')),

(nextval('product_seq'), 30,
 'Compact wireless mouse designed for travel and everyday productivity with silent clicking',
 'Logitech Pebble Mouse 2 M350s',
 2499.00,
 (SELECT id FROM category WHERE name = 'Mice'));

-- Insert products for the 'Accessories' category
INSERT INTO public.product
(id, available_quantity, description, name, price, category_id)
VALUES

(nextval('product_seq'), 20,
 'USB-C multiport adapter with HDMI, USB ports, SD card support and pass-through charging',
 'Anker 555 USB-C Hub',
 5999.00,
 (SELECT id FROM category WHERE name = 'Accessories')),

(nextval('product_seq'), 25,
 'USB-C docking station designed for laptops with multiple display, USB and networking connections',
 'Dell WD19S USB-C Dock',
 18999.00,
 (SELECT id FROM category WHERE name = 'Accessories')),

(nextval('product_seq'), 30,
 '1080p USB webcam with autofocus, stereo microphones and privacy shutter',
 'Logitech C920s HD Pro Webcam',
 6999.00,
 (SELECT id FROM category WHERE name = 'Accessories')),

(nextval('product_seq'), 18,
 'Wireless gaming headset with surround sound, detachable microphone and low-latency wireless connectivity',
 'Logitech G733 LIGHTSPEED',
 11999.00,
 (SELECT id FROM category WHERE name = 'Accessories')),

(nextval('product_seq'), 25,
 'External portable SSD with USB-C connectivity and high-speed data transfer for laptops and desktops',
 'Samsung T7 Portable SSD 1TB',
 9999.00,
 (SELECT id FROM category WHERE name = 'Accessories'));