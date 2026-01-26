-- ============================================
-- Database Schema for Project 3
-- Create database and necessary tables
-- Import this file into MySQL to create the complete database
-- ============================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS project_3 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE project_3;

-- ============================================
-- Users Table - Store user information
-- ============================================
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

-- ============================================
-- RefreshTokens Table - Store refresh tokens for JWT
-- ============================================
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

-- ============================================
-- PasswordResetTokens Table - Store password reset tokens
-- ============================================
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

-- ============================================
-- EmailVerificationTokens Table - Store email verification tokens
-- ============================================
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

-- ============================================
-- Stories Table - Store gem & jewelry insights
-- ============================================
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
    INDEX IX_Stories_IsFeatured (IsFeatured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Categories Table - Store jewelry categories
-- ============================================
CREATE TABLE IF NOT EXISTS Categories (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Description VARCHAR(500) NULL,
    CreatedAt DATETIME(6) NOT NULL,
    UpdatedAt DATETIME(6) NULL,
    INDEX IX_Categories_Name (Name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Products Table - Store jewelry products
-- ============================================
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
    Description VARCHAR(1000) NULL,
    ImageUrl VARCHAR(500) NOT NULL,
    Views INT NOT NULL DEFAULT 0,
    Likes INT NOT NULL DEFAULT 0,
    CategoryId INT NULL,
    IsFeatured TINYINT(1) NOT NULL DEFAULT 0,
    CreatedAt DATETIME(6) NOT NULL,
    UpdatedAt DATETIME(6) NULL,
    INDEX IX_Products_IsFeatured (IsFeatured),
    INDEX IX_Products_CategoryId (CategoryId),
    INDEX IX_Products_StyleCode (StyleCode),
    FOREIGN KEY (CategoryId) REFERENCES Categories(Id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Sample Data for Categories
-- ============================================
INSERT INTO Categories (Name, Description, CreatedAt) VALUES
('Rings', 'Engagement, wedding, and statement rings', NOW()),
('Necklaces', 'Gold and diamond necklaces for every occasion', NOW()),
('Earrings', 'Studs, hoops, and chandelier designs', NOW()),
('Bracelets', 'Timeless gold and diamond bracelets', NOW()),
('Bangles', 'Elegant bangles with modern craftsmanship', NOW()),
('Pendants', 'Signature pendants with precious stones', NOW()),
('Bridal Sets', 'Curated bridal jewelry collections', NOW()),
('Heritage', 'Classic designs inspired by Indian heritage', NOW())
ON DUPLICATE KEY UPDATE Name=Name;

-- ============================================
-- Sample Data for Products
-- ============================================
INSERT INTO Products (Name, Designer, StyleCode, ProductType, Brand, GoldCarat, GoldWeight, DiamondCarat, DiamondQuality, StoneType, StoneCarat, Quantity, MakingCharges, MRP, Description, ImageUrl, Views, Likes, CategoryId, IsFeatured, CreatedAt) VALUES
('Regal Solitaire Ring', 'Aanya Mehta', 'RG-ASM-102', 'Ring', 'Asmi', '18K', 6.250, 0.75, 'VVS', 'Ruby', 0.20, 12, 8500, 185000, 'A regal solitaire ring with diamond brilliance and ruby accents.', 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&h=600&fit=crop&q=80', 15200, 1200, 1, 1, NOW()),
('Imperial Halo Necklace', 'Rohan Kapoor', 'NK-DDM-415', 'Necklace', 'Ddamas', '22K', 18.500, 1.25, 'VS', 'Sapphire', 0.40, 5, 14500, 425000, 'An opulent necklace with halo diamonds and a sapphire centerpiece.', 'https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?w=800&h=600&fit=crop&q=80', 9800, 756, 2, 1, NOW()),
('Celestial Drop Earrings', 'Meera Shah', 'ER-CT-308', 'Earrings', 'Caratlane', '18K', 4.200, 0.60, 'VVS', 'Emerald', 0.15, 20, 6200, 118000, 'Celestial drop earrings with emerald sparkle and fine diamonds.', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', 11200, 890, 3, 1, NOW()),
('Royal Charm Bracelet', 'Kabir Rao', 'BR-ASM-220', 'Bracelet', 'Asmi', '18K', 10.800, 0.50, 'VS', 'Topaz', 0.25, 9, 7200, 165000, 'A royal charm bracelet crafted for grand celebrations.', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop&q=80', 8500, 634, 4, 0, NOW()),
('Majestic Heritage Bangle', 'Nisha Verma', 'BG-HR-519', 'Bangle', 'Heritage', '22K', 22.750, 0.40, 'VS', NULL, 0.00, 6, 9800, 355000, 'Classic heritage bangle with detailed gold artistry.', 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=800&h=600&fit=crop&q=80', 13800, 1023, 5, 1, NOW()),
('Crown Pendant Set', 'Dev Patel', 'PD-DDM-314', 'Pendant', 'Ddamas', '18K', 8.300, 0.85, 'VVS', 'Pearl', 0.30, 14, 5400, 142000, 'Crown-inspired pendant set with pearl luster.', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=600&fit=crop&q=80', 12400, 912, 6, 0, NOW()),
('Bridal Radiance Set', 'Riya Nair', 'BRD-ASM-777', 'Bridal Set', 'Asmi', '22K', 35.500, 2.20, 'VVS', 'Ruby', 0.60, 3, 26000, 925000, 'A grand bridal set with masterful goldwork and ruby accents.', 'https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=800&h=600&fit=crop&q=80', 9800, 756, 7, 1, NOW()),
('Heritage Kundan Necklace', 'Isha Gupta', 'HN-HR-642', 'Necklace', 'Heritage', '22K', 28.200, 0.30, 'VS', 'Ruby', 0.50, 4, 15200, 585000, 'Traditional kundan necklace with royal aura.', 'https://images.unsplash.com/photo-1503342452485-86b7f54527ef?w=800&h=600&fit=crop&q=80', 11500, 801, 8, 0, NOW())
ON DUPLICATE KEY UPDATE Name=Name;

-- ============================================
-- Sample Data for Stories (Hero Banner)
-- ============================================
INSERT INTO Stories (Id, Title, Author, Description, ImageUrl, Category, Views, Likes, IsFeatured, CreatedAt) VALUES
(1, 'Royal Gold and Diamond Heritage', 'Yash Gems', 'Experience exquisite craftsmanship and timeless elegance in every piece.', 'https://goldanddiamond.com/cdn/shop/files/January_Birthstone_2025_Website_Banner.png?v=1767199971&width=1600', 'Banner', 0, 0, 1, NOW()),
(2, 'Signature Bridal Radiance', 'Yash Gems', 'Curated for grand celebrations and heirloom-worthy sets.', 'https://goldanddiamond.com/cdn/shop/files/Your_paragraph_text_1920_x_700_px_15.png?v=1759332521&width=1600', 'Banner', 0, 0, 1, NOW()),
(3, 'Timeless Gemstone Collection', 'Yash Gems', 'Discover refined insights from our gem experts.', 'https://www.tierra.vn/wp-content/uploads/2026/01/COVER-NCH-BANNER-WEB-1-2048x853.jpg', 'Banner', 0, 0, 1, NOW()),
(4, 'Modern Artisan Highlights', 'Yash Gems', 'Explore elegant pieces crafted with modern artistry.', 'https://goldanddiamond.com/cdn/shop/files/Your_paragraph_text_1920_x_700_px_13.png?v=1759332521&width=1600', 'Banner', 0, 0, 1, NOW()),
(5, 'Radiant Sparkle Moments', 'Yash Gems', 'Celebrate brilliance with iconic designs.', 'https://www.tierra.vn/wp-content/uploads/2026/01/banner-web-1-2048x853.jpg', 'Banner', 0, 0, 1, NOW())
ON DUPLICATE KEY UPDATE Title=Title;
-- ============================================
-- Migration: Change Role column from VARCHAR to INT (if table already exists)
-- IMPORTANT: Run these commands if Users table exists with Role as VARCHAR(20)
-- This will fix the registration error (500 Internal Server Error)
-- 
-- First, check the current column type:
-- DESCRIBE Users;
-- 
-- If Role is VARCHAR(20), run these migration commands:
-- ============================================
-- Step 1: Add temporary column
-- ALTER TABLE Users ADD COLUMN RoleTemp INT NOT NULL DEFAULT 2;
-- Step 2: Convert and copy data
-- UPDATE Users SET RoleTemp = CASE WHEN Role = 'Admin' OR Role = '1' THEN 1 WHEN Role = 'User' OR Role = '2' THEN 2 ELSE 2 END;
-- Step 3: Drop old VARCHAR column
-- ALTER TABLE Users DROP COLUMN Role;
-- Step 4: Rename new column to Role
-- ALTER TABLE Users CHANGE COLUMN RoleTemp Role INT NOT NULL DEFAULT 2;
-- Step 5: Verify (optional)
-- DESCRIBE Users;

-- ============================================
-- Complete
-- ============================================
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
SELECT 'Products Table: ', COUNT(*) FROM Products;
