CREATE DATABASE IF NOT EXISTS project_3 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE project_3;

CREATE TABLE IF NOT EXISTS Users (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    PasswordHash LONGTEXT NOT NULL,
    FullName VARCHAR(100) NULL,
    CreatedAt DATETIME(6) NOT NULL,
    UpdatedAt DATETIME(6) NULL,
    IsActive TINYINT(1) NOT NULL DEFAULT 1,
    Role INT NOT NULL DEFAULT 2,
    UNIQUE INDEX IX_Users_Username (Username),
    UNIQUE INDEX IX_Users_Email (Email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS RefreshTokens (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Token VARCHAR(255) NOT NULL,
    UserId INT NOT NULL,
    ExpiresAt DATETIME(6) NOT NULL,
    RevokedAt DATETIME(6) NULL,
    CreatedAt DATETIME(6) NOT NULL,
    UNIQUE INDEX IX_RefreshTokens_Token (Token),
    INDEX IX_RefreshTokens_UserId (UserId),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS PasswordResetTokens (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Token VARCHAR(255) NOT NULL,
    UserId INT NOT NULL,
    ExpiresAt DATETIME(6) NOT NULL,
    IsUsed TINYINT(1) NOT NULL DEFAULT 0,
    CreatedAt DATETIME(6) NOT NULL,
    UNIQUE INDEX IX_PasswordResetTokens_Token (Token),
    INDEX IX_PasswordResetTokens_UserId (UserId),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS EmailVerificationTokens (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Token VARCHAR(255) NOT NULL,
    UserId INT NOT NULL,
    ExpiresAt DATETIME(6) NOT NULL,
    IsUsed TINYINT(1) NOT NULL DEFAULT 0,
    CreatedAt DATETIME(6) NOT NULL,
    UNIQUE INDEX IX_EmailVerificationTokens_Token (Token),
    INDEX IX_EmailVerificationTokens_UserId (UserId),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Stories (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    Author VARCHAR(100) NOT NULL,
    Description VARCHAR(1000) NULL,
    ImageUrl VARCHAR(500) NOT NULL,
    Category VARCHAR(50) NULL,
    Views INT NOT NULL DEFAULT 0,
    Likes INT NOT NULL DEFAULT 0,
    IsFeatured TINYINT(1) NOT NULL DEFAULT 0,
    CreatedAt DATETIME(6) NOT NULL,
    UpdatedAt DATETIME(6) NULL,
    INDEX IX_Stories_IsFeatured (IsFeatured),
    INDEX IX_Stories_Category (Category),
    INDEX IX_Stories_CreatedAt (CreatedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Categories (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Description VARCHAR(500) NULL,
    ParentCategoryId INT NULL,
    CreatedAt DATETIME(6) NOT NULL,
    UpdatedAt DATETIME(6) NULL,
    INDEX IX_Categories_Name (Name),
    INDEX IX_Categories_ParentCategoryId (ParentCategoryId),
    FOREIGN KEY (ParentCategoryId) REFERENCES Categories(Id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Materials (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(50) NOT NULL,
    Description VARCHAR(255) NULL,
    UNIQUE INDEX IX_Materials_Name (Name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MetalColors (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(50) NOT NULL,
    HexCode VARCHAR(20) NULL,
    UNIQUE INDEX IX_MetalColors_Name (Name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Products (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(200) NOT NULL,
    Designer VARCHAR(100) NULL,
    StyleCode VARCHAR(50) NOT NULL,
    ProductType VARCHAR(50) NOT NULL,
    Brand VARCHAR(50) NOT NULL,
    GoldCarat VARCHAR(20) NOT NULL,
    GoldWeight DECIMAL(10,3) NOT NULL DEFAULT 0,
    DiamondCarat DECIMAL(10,2) NOT NULL DEFAULT 0,
    DiamondQuality VARCHAR(50) NULL,
    StoneType VARCHAR(50) NULL,
    StoneCarat DECIMAL(10,2) NOT NULL DEFAULT 0,
    Quantity INT NOT NULL DEFAULT 0,
    MakingCharges DECIMAL(10,2) NOT NULL DEFAULT 0,
    MRP DECIMAL(10,2) NOT NULL DEFAULT 0,
    OriginalPrice DECIMAL(10,2) NOT NULL DEFAULT 0,
    Description VARCHAR(1000) NULL,
    ImageUrl VARCHAR(500) NOT NULL,
    Views INT NOT NULL DEFAULT 0,
    Likes INT NOT NULL DEFAULT 0,
    CategoryId INT NULL,
    MaterialId INT NULL,
    MetalColorId INT NULL,
    IsFeatured TINYINT(1) NOT NULL DEFAULT 0,
    CreatedAt DATETIME(6) NOT NULL,
    UpdatedAt DATETIME(6) NULL,
    INDEX IX_Products_IsFeatured (IsFeatured),
    INDEX IX_Products_IsFeatured_CreatedAt (IsFeatured, CreatedAt),
    INDEX IX_Products_CategoryId (CategoryId),
    INDEX IX_Products_MaterialId (MaterialId),
    INDEX IX_Products_MetalColorId (MetalColorId),
    INDEX IX_Products_CategoryId_CreatedAt (CategoryId, CreatedAt),
    INDEX IX_Products_StyleCode (StyleCode),
    INDEX IX_Products_CreatedAt (CreatedAt),
    INDEX IX_Products_Views_Likes (Views, Likes),
    FOREIGN KEY (CategoryId) REFERENCES Categories(Id) ON DELETE SET NULL,
    FOREIGN KEY (MaterialId) REFERENCES Materials(Id) ON DELETE SET NULL,
    FOREIGN KEY (MetalColorId) REFERENCES MetalColors(Id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ProductImages (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    ProductId INT NOT NULL,
    ImageUrl VARCHAR(500) NOT NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    INDEX IX_ProductImages_ProductId (ProductId),
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS CartItems (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    ProductId INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    CreatedAt DATETIME(6) NOT NULL,
    UpdatedAt DATETIME(6) NULL,
    UNIQUE INDEX IX_CartItems_UserId_ProductId (UserId, ProductId),
    INDEX IX_CartItems_UserId (UserId),
    INDEX IX_CartItems_ProductId (ProductId),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Favorites (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    ProductId INT NOT NULL,
    CreatedAt DATETIME(6) NOT NULL,
    UNIQUE INDEX IX_Favorites_UserId_ProductId (UserId, ProductId),
    INDEX IX_Favorites_UserId (UserId),
    INDEX IX_Favorites_ProductId (ProductId),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Sizes (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(50) NOT NULL,
    Description VARCHAR(255) NULL,
    UNIQUE INDEX IX_Sizes_Name (Name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ProductSizes (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    ProductId INT NOT NULL,
    SizeId INT NOT NULL,
    UNIQUE INDEX IX_ProductSizes_ProductId_SizeId (ProductId, SizeId),
    INDEX IX_ProductSizes_ProductId (ProductId),
    INDEX IX_ProductSizes_SizeId (SizeId),
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE,
    FOREIGN KEY (SizeId) REFERENCES Sizes(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Reviews (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    ProductId INT NOT NULL,
    Rating INT NOT NULL,
    Comment VARCHAR(1000) NULL,
    CreatedAt DATETIME(6) NOT NULL,
    UNIQUE INDEX IX_Reviews_UserId_ProductId (UserId, ProductId),
    INDEX IX_Reviews_ProductId (ProductId),
    INDEX IX_Reviews_UserId (UserId),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Orders (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    Status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    Subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    Total DECIMAL(10,2) NOT NULL DEFAULT 0,
    ShippingAddress VARCHAR(255) NULL,
    PaymentMethod VARCHAR(100) NULL,
    CreatedAt DATETIME(6) NOT NULL,
    UpdatedAt DATETIME(6) NULL,
    INDEX IX_Orders_UserId (UserId),
    INDEX IX_Orders_Status (Status),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS OrderItems (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    OrderId INT NOT NULL,
    ProductId INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    UnitPrice DECIMAL(10,2) NOT NULL DEFAULT 0,
    TotalPrice DECIMAL(10,2) NOT NULL DEFAULT 0,
    UNIQUE INDEX IX_OrderItems_OrderId_ProductId (OrderId, ProductId),
    INDEX IX_OrderItems_OrderId (OrderId),
    INDEX IX_OrderItems_ProductId (ProductId),
    FOREIGN KEY (OrderId) REFERENCES Orders(Id) ON DELETE CASCADE,
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Payments (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    OrderId INT NOT NULL,
    UserId INT NOT NULL,
    Amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    Currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    Status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    Provider VARCHAR(100) NULL,
    Method VARCHAR(100) NULL,
    Reference VARCHAR(255) NULL,
    PaidAt DATETIME(6) NULL,
    CreatedAt DATETIME(6) NOT NULL,
    UpdatedAt DATETIME(6) NULL,
    INDEX IX_Payments_OrderId (OrderId),
    INDEX IX_Payments_UserId (UserId),
    INDEX IX_Payments_Status (Status),
    INDEX IX_Payments_Reference (Reference),
    FOREIGN KEY (OrderId) REFERENCES Orders(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO Categories (Name, Description, ParentCategoryId, CreatedAt) VALUES
('Rings', 'Engagement, wedding, and statement rings', NULL, NOW()),
('Necklaces', 'Gold and diamond necklaces for every occasion', NULL, NOW()),
('Earrings', 'Studs, hoops, and chandelier designs', NULL, NOW()),
('Bracelets', 'Timeless gold and diamond bracelets', NULL, NOW()),
('Bangles', 'Elegant bangles with modern craftsmanship', NULL, NOW()),
('Pendants', 'Signature pendants with precious stones', NULL, NOW()),
('Bridal Sets', 'Curated bridal jewelry collections', NULL, NOW()),
('Heritage', 'Classic designs inspired by Indian heritage', NULL, NOW())
ON DUPLICATE KEY UPDATE Name=Name;

INSERT INTO Categories (Name, Description, ParentCategoryId, CreatedAt)
SELECT 'Gold Rings', 'Gold ring designs and collections', c.Id, NOW()
FROM Categories c
WHERE c.Name = 'Rings'
ON DUPLICATE KEY UPDATE
  Categories.Name = VALUES(Name),
  Categories.Description = VALUES(Description),
  Categories.ParentCategoryId = VALUES(ParentCategoryId);

INSERT INTO Categories (Name, Description, ParentCategoryId, CreatedAt)
SELECT 'Diamond Rings', 'Diamond ring designs and collections', c.Id, NOW()
FROM Categories c
WHERE c.Name = 'Rings'
ON DUPLICATE KEY UPDATE
  Categories.Name = VALUES(Name),
  Categories.Description = VALUES(Description),
  Categories.ParentCategoryId = VALUES(ParentCategoryId);

INSERT INTO Categories (Name, Description, ParentCategoryId, CreatedAt)
SELECT 'Gold Necklaces', 'Gold necklace designs and collections', c.Id, NOW()
FROM Categories c
WHERE c.Name = 'Necklaces'
ON DUPLICATE KEY UPDATE
  Categories.Name = VALUES(Name),
  Categories.Description = VALUES(Description),
  Categories.ParentCategoryId = VALUES(ParentCategoryId);

INSERT INTO Categories (Name, Description, ParentCategoryId, CreatedAt)
SELECT 'Diamond Necklaces', 'Diamond necklace designs and collections', c.Id, NOW()
FROM Categories c
WHERE c.Name = 'Necklaces'
ON DUPLICATE KEY UPDATE
  Categories.Name = VALUES(Name),
  Categories.Description = VALUES(Description),
  Categories.ParentCategoryId = VALUES(ParentCategoryId);

INSERT INTO Categories (Name, Description, ParentCategoryId, CreatedAt)
SELECT 'Gold Earrings', 'Gold earring designs and collections', c.Id, NOW()
FROM Categories c
WHERE c.Name = 'Earrings'
ON DUPLICATE KEY UPDATE
  Categories.Name = VALUES(Name),
  Categories.Description = VALUES(Description),
  Categories.ParentCategoryId = VALUES(ParentCategoryId);

INSERT INTO Categories (Name, Description, ParentCategoryId, CreatedAt)
SELECT 'Diamond Earrings', 'Diamond earring designs and collections', c.Id, NOW()
FROM Categories c
WHERE c.Name = 'Earrings'
ON DUPLICATE KEY UPDATE
  Categories.Name = VALUES(Name),
  Categories.Description = VALUES(Description),
  Categories.ParentCategoryId = VALUES(ParentCategoryId);

INSERT INTO Categories (Name, Description, ParentCategoryId, CreatedAt)
SELECT 'Gold Bracelets', 'Gold bracelet designs and collections', c.Id, NOW()
FROM Categories c
WHERE c.Name = 'Bracelets'
ON DUPLICATE KEY UPDATE
  Categories.Name = VALUES(Name),
  Categories.Description = VALUES(Description),
  Categories.ParentCategoryId = VALUES(ParentCategoryId);

INSERT INTO Categories (Name, Description, ParentCategoryId, CreatedAt)
SELECT 'Diamond Bracelets', 'Diamond bracelet designs and collections', c.Id, NOW()
FROM Categories c
WHERE c.Name = 'Bracelets'
ON DUPLICATE KEY UPDATE
  Categories.Name = VALUES(Name),
  Categories.Description = VALUES(Description),
  Categories.ParentCategoryId = VALUES(ParentCategoryId);

INSERT INTO Categories (Name, Description, ParentCategoryId, CreatedAt)
SELECT 'Gold Bangles', 'Gold bangle designs and collections', c.Id, NOW()
FROM Categories c
WHERE c.Name = 'Bangles'
ON DUPLICATE KEY UPDATE
  Categories.Name = VALUES(Name),
  Categories.Description = VALUES(Description),
  Categories.ParentCategoryId = VALUES(ParentCategoryId);

INSERT INTO Categories (Name, Description, ParentCategoryId, CreatedAt)
SELECT 'Diamond Bangles', 'Diamond bangle designs and collections', c.Id, NOW()
FROM Categories c
WHERE c.Name = 'Bangles'
ON DUPLICATE KEY UPDATE
  Categories.Name = VALUES(Name),
  Categories.Description = VALUES(Description),
  Categories.ParentCategoryId = VALUES(ParentCategoryId);

INSERT INTO Categories (Name, Description, ParentCategoryId, CreatedAt)
SELECT 'Gold Pendants', 'Gold pendant designs and collections', c.Id, NOW()
FROM Categories c
WHERE c.Name = 'Pendants'
ON DUPLICATE KEY UPDATE
  Categories.Name = VALUES(Name),
  Categories.Description = VALUES(Description),
  Categories.ParentCategoryId = VALUES(ParentCategoryId);

INSERT INTO Categories (Name, Description, ParentCategoryId, CreatedAt)
SELECT 'Diamond Pendants', 'Diamond pendant designs and collections', c.Id, NOW()
FROM Categories c
WHERE c.Name = 'Pendants'
ON DUPLICATE KEY UPDATE
  Categories.Name = VALUES(Name),
  Categories.Description = VALUES(Description),
  Categories.ParentCategoryId = VALUES(ParentCategoryId);

INSERT INTO Categories (Name, Description, ParentCategoryId, CreatedAt)
SELECT 'Gold Bridal Sets', 'Gold bridal set designs and collections', c.Id, NOW()
FROM Categories c
WHERE c.Name = 'Bridal Sets'
ON DUPLICATE KEY UPDATE
  Categories.Name = VALUES(Name),
  Categories.Description = VALUES(Description),
  Categories.ParentCategoryId = VALUES(ParentCategoryId);

INSERT INTO Categories (Name, Description, ParentCategoryId, CreatedAt)
SELECT 'Diamond Bridal Sets', 'Diamond bridal set designs and collections', c.Id, NOW()
FROM Categories c
WHERE c.Name = 'Bridal Sets'
ON DUPLICATE KEY UPDATE
  Categories.Name = VALUES(Name),
  Categories.Description = VALUES(Description),
  Categories.ParentCategoryId = VALUES(ParentCategoryId);

INSERT INTO Categories (Name, Description, ParentCategoryId, CreatedAt)
SELECT 'Gold Heritage', 'Gold heritage designs and collections', c.Id, NOW()
FROM Categories c
WHERE c.Name = 'Heritage'
ON DUPLICATE KEY UPDATE
  Categories.Name = VALUES(Name),
  Categories.Description = VALUES(Description),
  Categories.ParentCategoryId = VALUES(ParentCategoryId);

INSERT INTO Categories (Name, Description, ParentCategoryId, CreatedAt)
SELECT 'Diamond Heritage', 'Diamond heritage designs and collections', c.Id, NOW()
FROM Categories c
WHERE c.Name = 'Heritage'
ON DUPLICATE KEY UPDATE
  Categories.Name = VALUES(Name),
  Categories.Description = VALUES(Description),
  Categories.ParentCategoryId = VALUES(ParentCategoryId);

INSERT INTO Materials (Name, Description) VALUES
('10K', '10K gold material'),
('14K', '14K gold material'),
('18K', '18K gold material'),
('22K', '22K gold material')
ON DUPLICATE KEY UPDATE
  Materials.Name = VALUES(Name),
  Materials.Description = VALUES(Description);

INSERT INTO MetalColors (Name, HexCode) VALUES
('Yellow Gold', '#d9b37a'),
('Rose Gold', '#e5b3a6'),
('White Gold', '#e7e7e7')
ON DUPLICATE KEY UPDATE
  MetalColors.Name = VALUES(Name),
  MetalColors.HexCode = VALUES(HexCode);

INSERT INTO Sizes (Name, Description) VALUES
('5', 'Ring size 5'),
('6', 'Ring size 6'),
('7', 'Ring size 7'),
('8', 'Ring size 8'),
('9', 'Ring size 9'),
('10', 'Ring size 10'),
('11', 'Ring size 11')
ON DUPLICATE KEY UPDATE
  Sizes.Name = VALUES(Name),
  Sizes.Description = VALUES(Description);

INSERT INTO Products (Name, Designer, StyleCode, ProductType, Brand, GoldCarat, GoldWeight, DiamondCarat, DiamondQuality, StoneType, StoneCarat, Quantity, MakingCharges, MRP, Description, ImageUrl, Views, Likes, CategoryId, MaterialId, MetalColorId, IsFeatured, CreatedAt) VALUES
('Regal Solitaire Ring', 'Aanya Mehta', 'RG-ASM-102', 'Ring', 'Asmi', '18K', 6.250, 0.75, 'VVS', 'Ruby', 0.20, 12, 8500, 185000, 'A regal solitaire ring with diamond brilliance and ruby accents.', 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&h=600&fit=crop&q=80', 15200, 1200, (SELECT Id FROM Categories WHERE Name = 'Diamond Rings' LIMIT 1), (SELECT Id FROM Materials WHERE Name = '18K' LIMIT 1), (SELECT Id FROM MetalColors WHERE Name = 'White Gold' LIMIT 1), 1, NOW()),
('Imperial Halo Necklace', 'Rohan Kapoor', 'NK-DDM-415', 'Necklace', 'Ddamas', '22K', 18.500, 1.25, 'VS', 'Sapphire', 0.40, 5, 14500, 425000, 'An opulent necklace with halo diamonds and a sapphire centerpiece.', 'https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?w=800&h=600&fit=crop&q=80', 9800, 756, (SELECT Id FROM Categories WHERE Name = 'Diamond Necklaces' LIMIT 1), (SELECT Id FROM Materials WHERE Name = '22K' LIMIT 1), (SELECT Id FROM MetalColors WHERE Name = 'Yellow Gold' LIMIT 1), 1, NOW()),
('Celestial Drop Earrings', 'Meera Shah', 'ER-CT-308', 'Earrings', 'Caratlane', '18K', 4.200, 0.60, 'VVS', 'Emerald', 0.15, 20, 6200, 118000, 'Celestial drop earrings with emerald sparkle and fine diamonds.', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', 11200, 890, (SELECT Id FROM Categories WHERE Name = 'Diamond Earrings' LIMIT 1), (SELECT Id FROM Materials WHERE Name = '18K' LIMIT 1), (SELECT Id FROM MetalColors WHERE Name = 'Rose Gold' LIMIT 1), 1, NOW()),
('Royal Charm Bracelet', 'Kabir Rao', 'BR-ASM-220', 'Bracelet', 'Asmi', '18K', 10.800, 0.50, 'VS', 'Topaz', 0.25, 9, 7200, 165000, 'A royal charm bracelet crafted for grand celebrations.', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop&q=80', 8500, 634, (SELECT Id FROM Categories WHERE Name = 'Gold Bracelets' LIMIT 1), (SELECT Id FROM Materials WHERE Name = '18K' LIMIT 1), (SELECT Id FROM MetalColors WHERE Name = 'Yellow Gold' LIMIT 1), 0, NOW()),
('Majestic Heritage Bangle', 'Nisha Verma', 'BG-HR-519', 'Bangle', 'Heritage', '22K', 22.750, 0.40, 'VS', NULL, 0.00, 6, 9800, 355000, 'Classic heritage bangle with detailed gold artistry.', 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=800&h=600&fit=crop&q=80', 13800, 1023, (SELECT Id FROM Categories WHERE Name = 'Gold Bangles' LIMIT 1), (SELECT Id FROM Materials WHERE Name = '22K' LIMIT 1), (SELECT Id FROM MetalColors WHERE Name = 'Yellow Gold' LIMIT 1), 1, NOW()),
('Crown Pendant Set', 'Dev Patel', 'PD-DDM-314', 'Pendant', 'Ddamas', '18K', 8.300, 0.85, 'VVS', 'Pearl', 0.30, 14, 5400, 142000, 'Crown-inspired pendant set with pearl luster.', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=600&fit=crop&q=80', 12400, 912, (SELECT Id FROM Categories WHERE Name = 'Gold Pendants' LIMIT 1), (SELECT Id FROM Materials WHERE Name = '18K' LIMIT 1), (SELECT Id FROM MetalColors WHERE Name = 'White Gold' LIMIT 1), 0, NOW()),
('Bridal Radiance Set', 'Riya Nair', 'BRD-ASM-777', 'Bridal Set', 'Asmi', '22K', 35.500, 2.20, 'VVS', 'Ruby', 0.60, 3, 26000, 925000, 'A grand bridal set with masterful goldwork and ruby accents.', 'https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=800&h=600&fit=crop&q=80', 9800, 756, (SELECT Id FROM Categories WHERE Name = 'Gold Bridal Sets' LIMIT 1), (SELECT Id FROM Materials WHERE Name = '22K' LIMIT 1), (SELECT Id FROM MetalColors WHERE Name = 'Rose Gold' LIMIT 1), 1, NOW()),
('Heritage Kundan Necklace', 'Isha Gupta', 'HN-HR-642', 'Necklace', 'Heritage', '22K', 28.200, 0.30, 'VS', 'Ruby', 0.50, 4, 15200, 585000, 'Traditional kundan necklace with royal aura.', 'https://images.unsplash.com/photo-1503342452485-86b7f54527ef?w=800&h=600&fit=crop&q=80', 11500, 801, (SELECT Id FROM Categories WHERE Name = 'Gold Heritage' LIMIT 1), (SELECT Id FROM Materials WHERE Name = '22K' LIMIT 1), (SELECT Id FROM MetalColors WHERE Name = 'Yellow Gold' LIMIT 1), 0, NOW())
ON DUPLICATE KEY UPDATE Name=Name;

INSERT INTO ProductSizes (ProductId, SizeId)
SELECT p.Id, s.Id
FROM Products p
JOIN Sizes s ON s.Name IN ('5', '6', '7', '8', '9')
WHERE p.StyleCode = 'RG-ASM-102'
ON DUPLICATE KEY UPDATE ProductId = ProductId;

INSERT INTO ProductSizes (ProductId, SizeId)
SELECT p.Id, s.Id
FROM Products p
JOIN Sizes s ON s.Name IN ('6', '7', '8')
WHERE p.StyleCode = 'BR-ASM-220'
ON DUPLICATE KEY UPDATE ProductId = ProductId;

INSERT INTO ProductSizes (ProductId, SizeId)
SELECT p.Id, s.Id
FROM Products p
JOIN Sizes s ON s.Name IN ('7', '8', '9')
WHERE p.StyleCode = 'BG-HR-519'
ON DUPLICATE KEY UPDATE ProductId = ProductId;

INSERT INTO ProductSizes (ProductId, SizeId)
SELECT p.Id, s.Id
FROM Products p
JOIN Sizes s ON s.Name IN ('6', '7', '8')
WHERE p.StyleCode = 'BRD-ASM-777'
ON DUPLICATE KEY UPDATE ProductId = ProductId;

INSERT INTO Stories (Id, Title, Author, Description, ImageUrl, Category, Views, Likes, IsFeatured, CreatedAt) VALUES
(1, 'Royal Gold and Diamond Heritage', 'Yash Gems', 'Experience exquisite craftsmanship and timeless elegance in every piece.', 'https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-TanishqSharedLibrary/default/dw6a7b4efe/homepage/HeroBanner/fod-desktop-7-1-26.jpg', 'Banner', 0, 0, 1, NOW()),
(2, 'Signature Bridal Radiance', 'Yash Gems', 'Curated for grand celebrations and heirloom-worthy sets.', 'https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-TanishqSharedLibrary/default/dw458029d9/homepage/HeroBanner/tanishq-at-pcw-desktop-26.jpg', 'Banner', 0, 0, 1, NOW()),
(3, 'Timeless Gemstone Collection', 'Yash Gems', 'Discover refined insights from our gem experts.', 'https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-TanishqSharedLibrary/default/dw301aba3f/homepage/HeroBanner/sos-25-desktop.jpg', 'Banner', 0, 0, 1, NOW()),
(4, 'Modern Artisan Highlights', 'Yash Gems', 'Explore elegant pieces crafted with modern artistry.', 'https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-TanishqSharedLibrary/default/dw1fc6a80f/homepage/HeroBanner/radiance-in-rhythm-desktop.jpg', 'Banner', 0, 0, 1, NOW()),
(5, 'Radiant Sparkle Moments', 'Yash Gems', 'Celebrate brilliance with iconic designs.', 'https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-TanishqSharedLibrary/default/dw2f04db49/homepage/HeroBanner/wedding-gifting-desktop-vgreen.jpg', 'Banner', 0, 0, 1, NOW()),
(6, 'Radiant Sparkle Moments', 'Yash Gems', 'Celebrate brilliance with iconic designs.', 'https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-TanishqSharedLibrary/default/dw32e1f8d0/homepage/HeroBanner/floral-bloom-desktop.jpg', 'Banner', 0, 0, 1, NOW())
ON DUPLICATE KEY UPDATE Title=Title;

SELECT 'Database project_3 and all tables created successfully!' AS Status;
SELECT 'Users Table: ' AS Info, COUNT(*) AS TotalRows FROM Users
UNION ALL
SELECT 'RefreshTokens Table: ', COUNT(*) FROM RefreshTokens
UNION ALL
SELECT 'PasswordResetTokens Table: ', COUNT(*) FROM PasswordResetTokens
UNION ALL
SELECT 'EmailVerificationTokens Table: ', COUNT(*) FROM EmailVerificationTokens
UNION ALL
SELECT 'Stories Table: ', COUNT(*) FROM Stories
UNION ALL
SELECT 'Categories Table: ', COUNT(*) FROM Categories
UNION ALL
SELECT 'Products Table: ', COUNT(*) FROM Products
UNION ALL
SELECT 'CartItems Table: ', COUNT(*) FROM CartItems
UNION ALL
SELECT 'Favorites Table: ', COUNT(*) FROM Favorites
UNION ALL
SELECT 'Sizes Table: ', COUNT(*) FROM Sizes
UNION ALL
SELECT 'ProductSizes Table: ', COUNT(*) FROM ProductSizes
UNION ALL
SELECT 'Reviews Table: ', COUNT(*) FROM Reviews
UNION ALL
SELECT 'Orders Table: ', COUNT(*) FROM Orders
UNION ALL
SELECT 'OrderItems Table: ', COUNT(*) FROM OrderItems
UNION ALL
SELECT 'Payments Table: ', COUNT(*) FROM Payments
UNION ALL
SELECT 'Materials Table: ', COUNT(*) FROM Materials
UNION ALL
SELECT 'MetalColors Table: ', COUNT(*) FROM MetalColors
UNION ALL
SELECT 'ProductImages Table: ', COUNT(*) FROM ProductImages;
