-- ============================================
-- Update Database Script
-- Chạy file này nếu bạn đã có database cũ và muốn thêm các tính năng mới
-- Hoặc để Migration tự động xử lý (khuyến nghị)
-- ============================================

USE project_3;

-- Thêm các cột mới vào bảng Users (nếu chưa có)
ALTER TABLE Users 
ADD COLUMN IF NOT EXISTS AvatarUrl VARCHAR(500) NULL AFTER FullName,
ADD COLUMN IF NOT EXISTS Address VARCHAR(500) NULL AFTER AvatarUrl,
ADD COLUMN IF NOT EXISTS City VARCHAR(50) NULL AFTER Address,
ADD COLUMN IF NOT EXISTS State VARCHAR(50) NULL AFTER City,
ADD COLUMN IF NOT EXISTS MobileNumber VARCHAR(20) NULL AFTER State,
ADD COLUMN IF NOT EXISTS DateOfBirth DATETIME(6) NULL AFTER MobileNumber;

-- Tạo bảng Carts (nếu chưa có)
CREATE TABLE IF NOT EXISTS Carts (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    CreatedAt DATETIME(6) NOT NULL,
    UpdatedAt DATETIME(6) NULL,
    UNIQUE INDEX IX_Carts_UserId (UserId),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tạo bảng CartItems (nếu chưa có)
CREATE TABLE IF NOT EXISTS CartItems (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    CartId INT NOT NULL,
    ProductId INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    CreatedAt DATETIME(6) NOT NULL,
    UpdatedAt DATETIME(6) NULL,
    UNIQUE INDEX IX_CartItems_CartId_ProductId (CartId, ProductId),
    FOREIGN KEY (CartId) REFERENCES Carts(Id) ON DELETE CASCADE,
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Kiểm tra kết quả
SELECT 'Database updated successfully!' AS Status;

