-- Script to create Carts table and migrate data from CartItems
-- Run this script in your MySQL database

-- Step 1: Create Carts table
CREATE TABLE IF NOT EXISTS `Carts` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `UserId` int(11) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_Carts_UserId` (`UserId`),
  CONSTRAINT `FK_Carts_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 2: Create carts for existing users who have cart items
INSERT INTO `Carts` (`UserId`, `CreatedAt`)
SELECT DISTINCT `UserId`, MIN(`CreatedAt`) as `CreatedAt`
FROM `CartItems`
WHERE `UserId` IS NOT NULL
GROUP BY `UserId`
ON DUPLICATE KEY UPDATE `CreatedAt` = VALUES(`CreatedAt`);

-- Step 3: Check if CartId column exists, if not add it
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'CartItems'
  AND COLUMN_NAME = 'CartId';

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE `CartItems` ADD COLUMN `CartId` int(11) DEFAULT NULL AFTER `Id`',
    'SELECT "CartId column already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 4: Update CartId in CartItems based on UserId
UPDATE `CartItems` ci
INNER JOIN `Carts` c ON ci.`UserId` = c.`UserId`
SET ci.`CartId` = c.`Id`
WHERE ci.`CartId` IS NULL;

-- Step 5: Make CartId NOT NULL
ALTER TABLE `CartItems`
  MODIFY COLUMN `CartId` int(11) NOT NULL;

-- Step 6: Add foreign key constraint (drop first if exists)
SET @fk_exists = 0;
SELECT COUNT(*) INTO @fk_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'CartItems'
  AND CONSTRAINT_NAME = 'FK_CartItems_Carts_CartId';

SET @sql = IF(@fk_exists > 0,
    'ALTER TABLE `CartItems` DROP FOREIGN KEY `FK_CartItems_Carts_CartId`',
    'SELECT "FK does not exist" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE `CartItems`
  ADD CONSTRAINT `FK_CartItems_Carts_CartId` FOREIGN KEY (`CartId`) REFERENCES `Carts` (`Id`) ON DELETE CASCADE;

-- Step 7: Add indexes (drop first if exists, then add)
SET @idx_exists = 0;
SELECT COUNT(*) INTO @idx_exists
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'CartItems'
  AND INDEX_NAME = 'IX_CartItems_CartId';

SET @sql = IF(@idx_exists > 0,
    'ALTER TABLE `CartItems` DROP INDEX `IX_CartItems_CartId`',
    'SELECT "Index does not exist" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE `CartItems` ADD INDEX `IX_CartItems_CartId` (`CartId`);

SET @idx_exists = 0;
SELECT COUNT(*) INTO @idx_exists
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'CartItems'
  AND INDEX_NAME = 'IX_CartItems_CartId_ProductId';

SET @sql = IF(@idx_exists > 0,
    'ALTER TABLE `CartItems` DROP INDEX `IX_CartItems_CartId_ProductId`',
    'SELECT "Index does not exist" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE `CartItems` ADD UNIQUE INDEX `IX_CartItems_CartId_ProductId` (`CartId`, `ProductId`);

-- Note: After migration, you can optionally remove UserId column from CartItems
-- ALTER TABLE `CartItems` DROP COLUMN `UserId`;

