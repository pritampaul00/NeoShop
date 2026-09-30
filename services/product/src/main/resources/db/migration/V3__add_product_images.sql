CREATE TABLE product_images (
    product_id INTEGER NOT NULL,
    image_url VARCHAR(500) NOT NULL,

    CONSTRAINT fk_product_images_product
        FOREIGN KEY (product_id)
        REFERENCES product(id)
        ON DELETE CASCADE
);