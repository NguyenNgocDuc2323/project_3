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
-- Stories Table - Store story information
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
-- Categories Table - Store category information
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
-- Products Table - Store product information
-- ============================================
CREATE TABLE IF NOT EXISTS Products (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    Author VARCHAR(100) NOT NULL,
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
    FOREIGN KEY (CategoryId) REFERENCES Categories(Id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Sample Data for Categories
-- ============================================
INSERT INTO Categories (Name, Description, CreatedAt) VALUES
('Novel', 'Long stories with complex plots and multi-dimensional characters', NOW()),
('Short Story', 'Brief and concise stories', NOW()),
('Science Fiction', 'Stories about the future, technology and space', NOW()),
('Fantasy', 'Worlds of magic and imagination', NOW()),
('Romance', 'Love stories and emotions', NOW()),
('Action', 'Thrilling and adventurous stories', NOW()),
('Horror', 'Horror and mystery stories', NOW()),
('History', 'Stories based on historical events', NOW())
ON DUPLICATE KEY UPDATE Name=Name;

-- ============================================
-- Sample Data for Products
-- ============================================
INSERT INTO Products (Title, Author, Description, ImageUrl, Views, Likes, CategoryId, IsFeatured, CreatedAt) VALUES
('Golden Book Collection', 'John Smith', 'A collection of the most classic books of all time', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop', 15200, 1200, 1, 1, NOW()),
('Treasure of Knowledge', 'Sarah Johnson', 'Valuable books about knowledge and academics', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=600&fit=crop', 9800, 756, 1, 1, NOW()),
('Digital Library', 'Michael Brown', 'Modern e-book collection with various genres', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop', 11200, 890, 2, 0, NOW()),
('Children Books', 'Emily Davis', 'Great and meaningful stories for children', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&h=600&fit=crop', 8500, 634, 2, 0, NOW()),
('Science Collection', 'David Wilson', 'Explore the world of science through the best books', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=600&fit=crop', 13800, 1023, 3, 1, NOW()),
('Fantasy Library', 'Jessica Martinez', 'The most amazing imaginary worlds', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop', 12400, 912, 4, 1, NOW()),
('Romance Collection', 'Robert Taylor', 'The most touching love stories', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&h=600&fit=crop', 9800, 756, 5, 0, NOW()),
('History Collection', 'Lisa Anderson', 'Learn history through fascinating books', 'https://images.unsplash.com/photo-1521542464131-cb30f7a44e91?w=800&h=600&fit=crop', 11500, 801, 8, 0, NOW())
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
SELECT 'Stories Table: ', COUNT(*) FROM Stories
UNION ALL
SELECT 'Categories Table: ', COUNT(*) FROM Categories
UNION ALL
SELECT 'Products Table: ', COUNT(*) FROM Products;
