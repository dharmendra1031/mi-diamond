/* Michael Jewellery - SQL Server schema
   Run this once in SSMS against the target database.
   Safe to re-run: tables are created only when missing and catalogue seed uses MERGE. */

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID(N'dbo.users', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.users (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_users PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(320) NOT NULL,
    password_hash NVARCHAR(300) NOT NULL,
    created_at DATETIME2(3) NOT NULL CONSTRAINT DF_users_created DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2(3) NOT NULL CONSTRAINT DF_users_updated DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_users_email UNIQUE (email)
  );
END;

IF OBJECT_ID(N'dbo.profiles', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.profiles (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_profiles PRIMARY KEY,
    full_name NVARCHAR(200) NULL,
    phone NVARCHAR(50) NULL,
    is_admin BIT NOT NULL CONSTRAINT DF_profiles_admin DEFAULT 0,
    created_at DATETIME2(3) NOT NULL CONSTRAINT DF_profiles_created DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2(3) NOT NULL CONSTRAINT DF_profiles_updated DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_profiles_users FOREIGN KEY (id) REFERENCES dbo.users(id) ON DELETE CASCADE
  );
END;

IF OBJECT_ID(N'dbo.sessions', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.sessions (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_sessions PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    token_hash CHAR(64) NOT NULL,
    expires_at DATETIME2(3) NOT NULL,
    created_at DATETIME2(3) NOT NULL CONSTRAINT DF_sessions_created DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_sessions_token UNIQUE (token_hash),
    CONSTRAINT FK_sessions_users FOREIGN KEY (user_id) REFERENCES dbo.users(id) ON DELETE CASCADE
  );
  CREATE INDEX IX_sessions_user ON dbo.sessions(user_id);
  CREATE INDEX IX_sessions_expiry ON dbo.sessions(expires_at);
END;

IF OBJECT_ID(N'dbo.categories', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.categories (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_categories PRIMARY KEY DEFAULT NEWID(),
    slug NVARCHAR(180) NOT NULL,
    name NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX) NULL,
    sort_order INT NOT NULL CONSTRAINT DF_categories_sort DEFAULT 0,
    created_at DATETIME2(3) NOT NULL CONSTRAINT DF_categories_created DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_categories_slug UNIQUE (slug)
  );
END;

IF OBJECT_ID(N'dbo.products', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.products (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_products PRIMARY KEY DEFAULT NEWID(),
    slug NVARCHAR(220) NOT NULL,
    name NVARCHAR(250) NOT NULL,
    description NVARCHAR(MAX) NULL,
    category_id UNIQUEIDENTIFIER NULL,
    price DECIMAL(12,3) NOT NULL CONSTRAINT DF_products_price DEFAULT 0,
    old_price DECIMAL(12,3) NULL,
    currency NVARCHAR(10) NOT NULL CONSTRAINT DF_products_currency DEFAULT N'KWD',
    images NVARCHAR(MAX) NOT NULL CONSTRAINT DF_products_images DEFAULT N'[]',
    metal NVARCHAR(120) NULL,
    stone NVARCHAR(120) NULL,
    carat NVARCHAR(120) NULL,
    ring_size NVARCHAR(120) NULL,
    is_published BIT NOT NULL CONSTRAINT DF_products_published DEFAULT 1,
    is_featured BIT NOT NULL CONSTRAINT DF_products_featured DEFAULT 0,
    stock_status NVARCHAR(30) NOT NULL CONSTRAINT DF_products_stock_status DEFAULT N'available',
    sku NVARCHAR(100) NULL,
    stock INT NULL,
    weight_grams DECIMAL(10,3) NULL,
    created_at DATETIME2(3) NOT NULL CONSTRAINT DF_products_created DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2(3) NOT NULL CONSTRAINT DF_products_updated DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_products_slug UNIQUE (slug),
    CONSTRAINT FK_products_categories FOREIGN KEY (category_id) REFERENCES dbo.categories(id) ON DELETE SET NULL,
    CONSTRAINT CK_products_price CHECK (price >= 0),
    CONSTRAINT CK_products_old_price CHECK (old_price IS NULL OR old_price > price),
    CONSTRAINT CK_products_stock_status CHECK (stock_status IN (N'available', N'sold_out', N'on_request')),
    CONSTRAINT CK_products_images_json CHECK (ISJSON(images) = 1)
  );
  CREATE INDEX IX_products_category ON dbo.products(category_id);
  CREATE INDEX IX_products_published ON dbo.products(is_published);
  CREATE INDEX IX_products_featured ON dbo.products(is_featured);
  CREATE INDEX IX_products_created ON dbo.products(created_at DESC);
END;

IF OBJECT_ID(N'dbo.site_assets', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.site_assets (
    [key] NVARCHAR(50) NOT NULL CONSTRAINT PK_site_assets PRIMARY KEY,
    label NVARCHAR(150) NOT NULL,
    image_url NVARCHAR(1000) NULL,
    storage_path NVARCHAR(700) NULL,
    created_at DATETIME2(3) NOT NULL CONSTRAINT DF_site_assets_created DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2(3) NOT NULL CONSTRAINT DF_site_assets_updated DEFAULT SYSUTCDATETIME()
  );
END;

IF OBJECT_ID(N'dbo.newsletter_subscribers', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.newsletter_subscribers (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_newsletter PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(320) NOT NULL,
    is_active BIT NOT NULL CONSTRAINT DF_newsletter_active DEFAULT 1,
    source NVARCHAR(100) NULL,
    created_at DATETIME2(3) NOT NULL CONSTRAINT DF_newsletter_created DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_newsletter_email UNIQUE (email)
  );
END;

IF OBJECT_ID(N'dbo.orders', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.orders (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_orders PRIMARY KEY DEFAULT NEWID(),
    order_number NVARCHAR(100) NOT NULL,
    user_id UNIQUEIDENTIFIER NULL,
    customer_name NVARCHAR(200) NOT NULL,
    customer_phone NVARCHAR(80) NOT NULL,
    customer_email NVARCHAR(320) NULL,
    address_line NVARCHAR(500) NULL,
    city NVARCHAR(120) NULL,
    district NVARCHAR(120) NULL,
    postal_code NVARCHAR(40) NULL,
    items NVARCHAR(MAX) NOT NULL CONSTRAINT DF_orders_items DEFAULT N'[]',
    subtotal DECIMAL(12,3) NOT NULL CONSTRAINT DF_orders_subtotal DEFAULT 0,
    total DECIMAL(12,3) NOT NULL CONSTRAINT DF_orders_total DEFAULT 0,
    currency NVARCHAR(10) NOT NULL CONSTRAINT DF_orders_currency DEFAULT N'KWD',
    customer_note NVARCHAR(MAX) NULL,
    admin_note NVARCHAR(MAX) NULL,
    status NVARCHAR(30) NOT NULL CONSTRAINT DF_orders_status DEFAULT N'new',
    payment_status NVARCHAR(30) NOT NULL CONSTRAINT DF_orders_payment_status DEFAULT N'not_required',
    payment_method NVARCHAR(100) NULL,
    payment_id NVARCHAR(200) NULL,
    created_at DATETIME2(3) NOT NULL CONSTRAINT DF_orders_created DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2(3) NOT NULL CONSTRAINT DF_orders_updated DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_orders_number UNIQUE (order_number),
    CONSTRAINT FK_orders_users FOREIGN KEY (user_id) REFERENCES dbo.users(id) ON DELETE SET NULL,
    CONSTRAINT CK_orders_items_json CHECK (ISJSON(items) = 1)
  );
  CREATE INDEX IX_orders_user ON dbo.orders(user_id);
  CREATE INDEX IX_orders_status ON dbo.orders(status);
  CREATE INDEX IX_orders_created ON dbo.orders(created_at DESC);
END;

/* Categories */
MERGE dbo.categories AS target
USING (VALUES
  (CAST('cce015ae-18b5-42e2-ba47-2551928b4082' AS UNIQUEIDENTIFIER), N'gold-sets', N'Gold Sets', 10),
  (CAST('4a021a30-dcd9-41d4-971c-e04f40c2fe4c' AS UNIQUEIDENTIFIER), N'necklaces', N'Necklaces', 20),
  (CAST('95138237-ab2d-4c64-8878-4c4eb6308d4d' AS UNIQUEIDENTIFIER), N'rings', N'Rings', 30),
  (CAST('9be68958-b9a4-4d25-a559-e577120aa306' AS UNIQUEIDENTIFIER), N'bracelets', N'Bracelets', 40),
  (CAST('5762755e-fd8d-468c-8e42-55c1747144bd' AS UNIQUEIDENTIFIER), N'earrings', N'Earrings', 50),
  (CAST('2ce5eee4-9d0c-4e41-8988-a2f56765e7a5' AS UNIQUEIDENTIFIER), N'diamonds', N'Diamonds', 60)
) AS source(id, slug, name, sort_order)
ON target.id = source.id
WHEN MATCHED THEN UPDATE SET slug = source.slug, name = source.name, sort_order = source.sort_order
WHEN NOT MATCHED THEN INSERT (id, slug, name, sort_order) VALUES (source.id, source.slug, source.name, source.sort_order);

/* Current catalogue migrated from Supabase. Product image values point to local VPS files. */
MERGE dbo.products AS target
USING (VALUES
  (CAST('cc952a3b-3537-4062-9aee-deffd43ccdde' AS UNIQUEIDENTIFIER), N'signature-18k-gold-jewellery-set', N'Signature 18K Gold Jewellery Set', N'A coordinated Michael Jewellery gold set featuring necklace, bracelet, ring and earrings in a polished statement design. Contact the store for current price and availability.', CAST('cce015ae-18b5-42e2-ba47-2551928b4082' AS UNIQUEIDENTIFIER), CAST(0 AS DECIMAL(12,3)), N'KWD', N'["/uploads/products/catalog/signature-18k-gold-jewellery-set-1.jpg","/uploads/products/catalog/signature-18k-gold-jewellery-set-2.jpg"]', N'18K Yellow Gold', NULL, N'Approx. 37 g', NULL, 1, 1, N'available', NULL),
  (CAST('8adf60bf-d6fc-4f93-aa1b-78772754f981' AS UNIQUEIDENTIFIER), N'21k-gold-long-necklace', N'21K Gold Long Necklace', N'An ornate long gold necklace with circular filigree motifs and a statement pendant, presented in Michael Jewellery signature styling. Contact the store for current price and availability.', CAST('4a021a30-dcd9-41d4-971c-e04f40c2fe4c' AS UNIQUEIDENTIFIER), CAST(0 AS DECIMAL(12,3)), N'KWD', N'["/uploads/products/catalog/21k-gold-long-necklace-1.jpg","/uploads/products/catalog/21k-gold-long-necklace-2.jpg"]', N'21K Yellow Gold', NULL, NULL, NULL, 1, 1, N'available', NULL),
  (CAST('80f6b002-bf0c-4a1d-a500-937ac59fedbc' AS UNIQUEIDENTIFIER), N'floral-gold-necklace-set', N'Floral Gold Necklace & Earring Set', N'A delicate floral necklace and matching earring set with refined gold detailing for elegant everyday and occasion wear. Contact the store for current price and availability.', CAST('4a021a30-dcd9-41d4-971c-e04f40c2fe4c' AS UNIQUEIDENTIFIER), CAST(0 AS DECIMAL(12,3)), N'KWD', N'["/uploads/products/catalog/floral-gold-necklace-set-1.jpg","/uploads/products/catalog/floral-gold-necklace-set-2.jpg"]', N'Yellow Gold', NULL, NULL, NULL, 1, 1, N'available', NULL),
  (CAST('ac3aa7f9-4b65-44dd-b326-a6ade8c97127' AS UNIQUEIDENTIFIER), N'classic-gold-diamond-ring', N'Classic Gold Diamond Ring', N'A refined gold ring with a brilliant diamond-inspired centre, selected for elegant everyday wear and gifting.', CAST('95138237-ab2d-4c64-8878-4c4eb6308d4d' AS UNIQUEIDENTIFIER), CAST(0 AS DECIMAL(12,3)), N'KWD', N'["/uploads/products/catalog/classic-gold-diamond-ring-1.jpg","/uploads/products/catalog/classic-gold-diamond-ring-2.jpg"]', N'Yellow Gold', N'Diamond', NULL, NULL, 1, 1, N'available', N'MJ-RING-001'),
  (CAST('9a9dedfc-458d-4acf-bdc1-0abb2bec3455' AS UNIQUEIDENTIFIER), N'elegant-gold-bangle-bracelet', N'Elegant Gold Bangle Bracelet', N'A polished gold bracelet with a timeless bangle silhouette, designed to complement both occasion and everyday jewellery.', CAST('9be68958-b9a4-4d25-a559-e577120aa306' AS UNIQUEIDENTIFIER), CAST(0 AS DECIMAL(12,3)), N'KWD', N'["/uploads/products/catalog/elegant-gold-bangle-bracelet-1.jpg","/uploads/products/catalog/elegant-gold-bangle-bracelet-2.jpg"]', N'Yellow Gold', NULL, NULL, NULL, 1, 1, N'available', N'MJ-BRACELET-001'),
  (CAST('b23b1888-3f2a-4ad9-a3da-aa8ade1e4044' AS UNIQUEIDENTIFIER), N'gold-drop-earrings', N'Gold Drop Earrings', N'Elegant gold drop earrings with a refined jewellery finish, selected for celebrations, gifting, and evening wear.', CAST('5762755e-fd8d-468c-8e42-55c1747144bd' AS UNIQUEIDENTIFIER), CAST(0 AS DECIMAL(12,3)), N'KWD', N'["/uploads/products/catalog/gold-drop-earrings-1.jpg","/uploads/products/catalog/gold-drop-earrings-2.jpg"]', N'Yellow Gold', N'Diamond', NULL, NULL, 1, 1, N'available', N'MJ-EARRING-001'),
  (CAST('ee336a2b-82d2-4d32-b199-f286ada7314f' AS UNIQUEIDENTIFIER), N'diamond-drop-necklace-set', N'Diamond Drop Necklace Set', N'A refined necklace set with bright drop accents, matching earrings, ring and bracelet for a complete coordinated look. Contact the store for current price and availability.', CAST('2ce5eee4-9d0c-4e41-8988-a2f56765e7a5' AS UNIQUEIDENTIFIER), CAST(0 AS DECIMAL(12,3)), N'KWD', N'["/uploads/products/catalog/diamond-drop-necklace-set-1.jpg","/uploads/products/catalog/diamond-drop-necklace-set-2.jpg"]', N'Yellow Gold', N'Diamond', NULL, NULL, 1, 1, N'available', NULL)
) AS source(id, slug, name, description, category_id, price, currency, images, metal, stone, carat, ring_size, is_published, is_featured, stock_status, sku)
ON target.id = source.id
WHEN MATCHED THEN UPDATE SET
  slug = source.slug, name = source.name, description = source.description, category_id = source.category_id,
  price = source.price, currency = source.currency, images = source.images, metal = source.metal, stone = source.stone,
  carat = source.carat, ring_size = source.ring_size, is_published = source.is_published,
  is_featured = source.is_featured, stock_status = source.stock_status, sku = source.sku, updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT
  (id, slug, name, description, category_id, price, currency, images, metal, stone, carat, ring_size, is_published, is_featured, stock_status, sku)
  VALUES
  (source.id, source.slug, source.name, source.description, source.category_id, source.price, source.currency, source.images, source.metal, source.stone, source.carat, source.ring_size, source.is_published, source.is_featured, source.stock_status, source.sku);

MERGE dbo.site_assets AS target
USING (VALUES
  (N'logo', N'Site Logo', N'/uploads/site-assets/logo/logo.png', N'logo/logo.png'),
  (N'home_hero', N'Home Hero Image', N'/uploads/site-assets/home_hero/home-hero.jpg', N'home_hero/home-hero.jpg'),
  (N'about_image', N'About Page Image', N'/uploads/site-assets/about_image/about.jpg', N'about_image/about.jpg')
) AS source([key], label, image_url, storage_path)
ON target.[key] = source.[key]
WHEN MATCHED THEN UPDATE SET label = source.label, image_url = source.image_url, storage_path = source.storage_path, updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT ([key], label, image_url, storage_path)
VALUES (source.[key], source.label, source.image_url, source.storage_path);

PRINT 'Michael Jewellery MSSQL schema and catalogue seed completed.';
