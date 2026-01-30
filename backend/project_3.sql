-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 29, 2026 at 05:31 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `project_3`
--

-- --------------------------------------------------------

--
-- Table structure for table `cartitems`
--

CREATE TABLE `cartitems` (
  `Id` int(11) NOT NULL,
  `UserId` int(11) NOT NULL,
  `ProductId` int(11) NOT NULL,
  `Quantity` int(11) NOT NULL DEFAULT 1,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `Id` int(11) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `ParentCategoryId` int(11) DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`Id`, `Name`, `Description`, `ParentCategoryId`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'Rings', 'Engagement, wedding, and statement rings', NULL, '2026-01-29 20:15:50.000000', NULL),
(2, 'Necklaces', 'Gold and diamond necklaces for every occasion', NULL, '2026-01-29 20:15:50.000000', NULL),
(3, 'Earrings', 'Studs, hoops, and chandelier designs', NULL, '2026-01-29 20:15:50.000000', NULL),
(4, 'Bracelets', 'Timeless gold and diamond bracelets', NULL, '2026-01-29 20:15:50.000000', NULL),
(5, 'Bangles', 'Elegant bangles with modern craftsmanship', NULL, '2026-01-29 20:15:50.000000', NULL),
(6, 'Pendants', 'Signature pendants with precious stones', NULL, '2026-01-29 20:15:50.000000', NULL),
(7, 'Bridal Sets', 'Curated bridal jewelry collections', NULL, '2026-01-29 20:15:50.000000', NULL),
(8, 'Heritage', 'Classic designs inspired by Indian heritage', NULL, '2026-01-29 20:15:50.000000', NULL),
(9, 'Gold Rings', 'Gold ring designs and collections', 1, '2026-01-29 20:15:50.000000', NULL),
(10, 'Diamond Rings', 'Diamond ring designs and collections', 1, '2026-01-29 20:15:50.000000', NULL),
(11, 'Gold Necklaces', 'Gold necklace designs and collections', 2, '2026-01-29 20:15:50.000000', NULL),
(12, 'Diamond Necklaces', 'Diamond necklace designs and collections', 2, '2026-01-29 20:15:50.000000', NULL),
(13, 'Gold Earrings', 'Gold earring designs and collections', 3, '2026-01-29 20:15:50.000000', NULL),
(14, 'Diamond Earrings', 'Diamond earring designs and collections', 3, '2026-01-29 20:15:50.000000', NULL),
(15, 'Gold Bracelets', 'Gold bracelet designs and collections', 4, '2026-01-29 20:15:50.000000', NULL),
(16, 'Diamond Bracelets', 'Diamond bracelet designs and collections', 4, '2026-01-29 20:15:50.000000', NULL),
(17, 'Gold Bangles', 'Gold bangle designs and collections', 5, '2026-01-29 20:15:50.000000', NULL),
(18, 'Diamond Bangles', 'Diamond bangle designs and collections', 5, '2026-01-29 20:15:50.000000', NULL),
(19, 'Gold Pendants', 'Gold pendant designs and collections', 6, '2026-01-29 20:15:50.000000', NULL),
(20, 'Diamond Pendants', 'Diamond pendant designs and collections', 6, '2026-01-29 20:15:50.000000', NULL),
(21, 'Gold Bridal Sets', 'Gold bridal set designs and collections', 7, '2026-01-29 20:15:50.000000', NULL),
(22, 'Diamond Bridal Sets', 'Diamond bridal set designs and collections', 7, '2026-01-29 20:15:50.000000', NULL),
(23, 'Gold Heritage', 'Gold heritage designs and collections', 8, '2026-01-29 20:15:50.000000', NULL),
(24, 'Diamond Heritage', 'Diamond heritage designs and collections', 8, '2026-01-29 20:15:50.000000', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `emailverificationtokens`
--

CREATE TABLE `emailverificationtokens` (
  `Id` int(11) NOT NULL,
  `Token` varchar(255) NOT NULL,
  `UserId` int(11) NOT NULL,
  `ExpiresAt` datetime(6) NOT NULL,
  `IsUsed` tinyint(1) NOT NULL DEFAULT 0,
  `CreatedAt` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `emailverificationtokens`
--

INSERT INTO `emailverificationtokens` (`Id`, `Token`, `UserId`, `ExpiresAt`, `IsUsed`, `CreatedAt`) VALUES
(1, 'F6D2b/5tXAke7V/MzI6Rgp0BivYDjN7/pumXumpWCpRxggZ2Iq4a29MldBYElhJoLdiINMD52K9h6QWnfakXxg==', 1, '2026-01-29 14:47:03.065627', 1, '2026-01-29 14:46:03.065662');

-- --------------------------------------------------------

--
-- Table structure for table `favorites`
--

CREATE TABLE `favorites` (
  `Id` int(11) NOT NULL,
  `UserId` int(11) NOT NULL,
  `ProductId` int(11) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `materials`
--

CREATE TABLE `materials` (
  `Id` int(11) NOT NULL,
  `Name` varchar(50) NOT NULL,
  `PriceMultiplier` decimal(5,2) NOT NULL DEFAULT 1.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `materials`
--

INSERT INTO `materials` (`Id`, `Name`, `PriceMultiplier`) VALUES
(1, '10K', 0.90),
(2, '14K', 1.00),
(3, '18K', 1.10),
(4, '22K', 1.20);

-- --------------------------------------------------------

--
-- Table structure for table `metalcolors`
--

CREATE TABLE `metalcolors` (
  `Id` int(11) NOT NULL,
  `Name` varchar(50) NOT NULL,
  `HexCode` varchar(20) DEFAULT NULL,
  `PriceMultiplier` decimal(5,2) NOT NULL DEFAULT 1.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `metalcolors`
--

INSERT INTO `metalcolors` (`Id`, `Name`, `HexCode`, `PriceMultiplier`) VALUES
(1, 'Yellow Gold', '#d9b37a', 1.00),
(2, 'Rose Gold', '#e5b3a6', 1.02),
(3, 'White Gold', '#e7e7e7', 1.01);

-- --------------------------------------------------------

--
-- Table structure for table `orderitems`
--

CREATE TABLE `orderitems` (
  `Id` int(11) NOT NULL,
  `OrderId` int(11) NOT NULL,
  `ProductId` int(11) NOT NULL,
  `Quantity` int(11) NOT NULL DEFAULT 1,
  `UnitPrice` decimal(10,2) NOT NULL DEFAULT 0.00,
  `TotalPrice` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orderitems`
--

INSERT INTO `orderitems` (`Id`, `OrderId`, `ProductId`, `Quantity`, `UnitPrice`, `TotalPrice`) VALUES
(1, 1, 2, 1, 489.00, 489.00),
(2, 1, 7, 1, 975.00, 975.00),
(3, 2, 7, 1, 975.00, 975.00),
(4, 2, 4, 1, 189.00, 189.00),
(5, 3, 6, 1, 165.00, 165.00),
(6, 3, 8, 1, 648.00, 648.00),
(7, 4, 8, 1, 648.00, 648.00),
(8, 4, 6, 1, 165.00, 165.00);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `Id` int(11) NOT NULL,
  `UserId` int(11) NOT NULL,
  `Status` varchar(50) NOT NULL DEFAULT 'Pending',
  `Subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `Total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `ShippingAddress` varchar(255) DEFAULT NULL,
  `PaymentMethod` varchar(100) DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`Id`, `UserId`, `Status`, `Subtotal`, `Total`, `ShippingAddress`, `PaymentMethod`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 1, 'Pending', 1464.00, 1474.00, 'abc, Phường Vinh Hưng, Tỉnh Nghệ An', 'bank_transfer', '2026-01-29 16:14:06.957095', NULL),
(2, 1, 'Pending', 1164.00, 1174.00, 'abc, Phường Vinh Hưng, Tỉnh Nghệ An', 'bank_transfer', '2026-01-29 16:18:13.030547', NULL),
(3, 1, 'Pending', 813.00, 823.00, 'abc, Phường Vinh Hưng, Tỉnh Nghệ An', 'bank_transfer', '2026-01-29 16:20:28.862712', NULL),
(4, 1, 'Pending', 813.00, 823.00, 'abc, Phường Vinh Hưng, Tỉnh Nghệ An', 'cod', '2026-01-29 16:22:40.897612', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `passwordresettokens`
--

CREATE TABLE `passwordresettokens` (
  `Id` int(11) NOT NULL,
  `Token` varchar(255) NOT NULL,
  `UserId` int(11) NOT NULL,
  `ExpiresAt` datetime(6) NOT NULL,
  `IsUsed` tinyint(1) NOT NULL DEFAULT 0,
  `CreatedAt` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `Id` int(11) NOT NULL,
  `OrderId` int(11) NOT NULL,
  `UserId` int(11) NOT NULL,
  `Amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `Currency` varchar(10) NOT NULL DEFAULT 'USD',
  `Status` varchar(50) NOT NULL DEFAULT 'Pending',
  `Provider` varchar(100) DEFAULT NULL,
  `Method` varchar(100) DEFAULT NULL,
  `Reference` varchar(255) DEFAULT NULL,
  `PaidAt` datetime(6) DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`Id`, `OrderId`, `UserId`, `Amount`, `Currency`, `Status`, `Provider`, `Method`, `Reference`, `PaidAt`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 1, 1, 1474.00, 'USD', 'Pending', NULL, 'bank_transfer', NULL, NULL, '2026-01-29 16:14:07.040768', NULL),
(2, 2, 1, 1174.00, 'USD', 'Pending', NULL, 'bank_transfer', NULL, NULL, '2026-01-29 16:18:13.052958', NULL),
(3, 3, 1, 823.00, 'USD', 'Pending', NULL, 'bank_transfer', NULL, NULL, '2026-01-29 16:20:28.872162', NULL),
(4, 4, 1, 823.00, 'USD', 'Pending', NULL, 'cod', NULL, NULL, '2026-01-29 16:22:40.913826', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `productimages`
--

CREATE TABLE `productimages` (
  `Id` int(11) NOT NULL,
  `ProductId` int(11) NOT NULL,
  `ImageUrl` varchar(500) NOT NULL,
  `SortOrder` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `Id` int(11) NOT NULL,
  `Name` varchar(200) NOT NULL,
  `StyleCode` varchar(50) NOT NULL,
  `ProductType` varchar(50) NOT NULL,
  `Brand` varchar(50) NOT NULL,
  `GoldCarat` varchar(20) NOT NULL,
  `MRP` decimal(10,2) NOT NULL DEFAULT 0.00,
  `OriginalPrice` decimal(10,2) NOT NULL DEFAULT 0.00,
  `ImageUrl` varchar(500) NOT NULL,
  `Views` int(11) NOT NULL DEFAULT 0,
  `Likes` int(11) NOT NULL DEFAULT 0,
  `CategoryId` int(11) DEFAULT NULL,
  `MaterialId` int(11) DEFAULT NULL,
  `MetalColorId` int(11) DEFAULT NULL,
  `IsFeatured` tinyint(1) NOT NULL DEFAULT 0,
  `CreatedAt` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`Id`, `Name`, `StyleCode`, `ProductType`, `Brand`, `GoldCarat`, `MRP`, `OriginalPrice`, `ImageUrl`, `Views`, `Likes`, `CategoryId`, `MaterialId`, `MetalColorId`, `IsFeatured`, `CreatedAt`) VALUES
(1, 'Regal Solitaire Ring', 'RG-ASM-102', 'Ring', 'Asmi', '18K', 185.00, 215.00, 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&h=600&fit=crop&q=80', 15200, 1200, 10, 3, 3, 1, '2026-01-29 20:15:50.000000'),
(2, 'Imperial Halo Necklace', 'NK-DDM-415', 'Necklace', 'Ddamas', '22K', 425.00, 489.00, 'https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?w=800&h=600&fit=crop&q=80', 9800, 756, 12, 4, 1, 1, '2026-01-29 20:15:50.000000'),
(3, 'Celestial Drop Earrings', 'ER-CT-308', 'Earrings', 'Caratlane', '18K', 118.00, 136.00, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', 11200, 890, 14, 3, 2, 1, '2026-01-29 20:15:50.000000'),
(4, 'Royal Charm Bracelet', 'BR-ASM-220', 'Bracelet', 'Asmi', '18K', 165.00, 189.00, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop&q=80', 8500, 634, 15, 3, 1, 0, '2026-01-29 20:15:50.000000'),
(5, 'Majestic Heritage Bangle', 'BG-HR-519', 'Bangle', 'Heritage', '22K', 355.00, 399.00, 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=800&h=600&fit=crop&q=80', 13800, 1023, 17, 4, 1, 1, '2026-01-29 20:15:50.000000'),
(6, 'Crown Pendant Set', 'PD-DDM-314', 'Pendant', 'Ddamas', '18K', 142.00, 165.00, 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=600&fit=crop&q=80', 12400, 912, 19, 3, 3, 0, '2026-01-29 20:15:50.000000'),
(7, 'Bridal Radiance Set', 'BRD-ASM-777', 'Bridal Set', 'Asmi', '22K', 895.00, 975.00, 'https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=800&h=600&fit=crop&q=80', 9800, 756, 21, 4, 2, 1, '2026-01-29 20:15:50.000000'),
(8, 'Heritage Kundan Necklace', 'HN-HR-642', 'Necklace', 'Heritage', '22K', 585.00, 648.00, 'https://images.unsplash.com/photo-1503342452485-86b7f54527ef?w=800&h=600&fit=crop&q=80', 11500, 801, 23, 4, 1, 0, '2026-01-29 20:15:50.000000');

-- --------------------------------------------------------

--
-- Table structure for table `productsizes`
--

CREATE TABLE `productsizes` (
  `Id` int(11) NOT NULL,
  `ProductId` int(11) NOT NULL,
  `SizeId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `productsizes`
--

INSERT INTO `productsizes` (`Id`, `ProductId`, `SizeId`) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 3),
(4, 1, 4),
(5, 1, 5),
(17, 2, 2),
(18, 2, 3),
(19, 2, 4),
(20, 2, 5),
(24, 3, 1),
(25, 3, 2),
(26, 3, 3),
(8, 4, 2),
(9, 4, 3),
(10, 4, 4),
(11, 5, 3),
(12, 5, 4),
(13, 5, 5),
(27, 6, 2),
(28, 6, 3),
(14, 7, 2),
(15, 7, 3),
(16, 7, 4),
(30, 8, 3),
(31, 8, 4),
(32, 8, 5);

-- --------------------------------------------------------

--
-- Table structure for table `refreshtokens`
--

CREATE TABLE `refreshtokens` (
  `Id` int(11) NOT NULL,
  `Token` varchar(255) NOT NULL,
  `UserId` int(11) NOT NULL,
  `ExpiresAt` datetime(6) NOT NULL,
  `RevokedAt` datetime(6) DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `refreshtokens`
--

INSERT INTO `refreshtokens` (`Id`, `Token`, `UserId`, `ExpiresAt`, `RevokedAt`, `CreatedAt`) VALUES
(1, '+aYJ5ZDgwoGxBYsqb2BR6dYm0wtx6NVIHP23bZHNp7O5ob9NsJ6ge5AeJy5P+xytsC05sa376nrsUy6Wt2sIRA==', 1, '2026-02-05 14:46:32.546820', '2026-01-29 14:46:51.194816', '2026-01-29 14:46:32.546933'),
(2, 'iffMb+DWzlQdGAVIqRuXkxiD7nNarcaUZBZfWhKXt9J1DxX979xUu+yBTyeKvRLljo0h8V5RR13UOL3F4pHNfA==', 1, '2026-02-05 14:46:51.195266', '2026-01-29 14:46:59.397229', '2026-01-29 14:46:51.195271'),
(3, '8SgMhmay/trtmQ4SzGXvLyjkHacfqxzoZfFXTh+Ri/4SVwVGvUa5+5A4aJVJzYXcZlbIFTGScnH+duOQzBjpZA==', 1, '2026-02-05 14:46:59.402744', '2026-01-29 14:47:01.826616', '2026-01-29 14:46:59.402759'),
(4, 'bdRA6Lsg4nCOfzKt8eZJnhlaQCQxE03GZuZzdbvvDykd5mkis18I0KCyY+KO5jBTep+maK/r3qJv2yajr1WOIQ==', 1, '2026-02-05 14:47:01.826861', '2026-01-29 14:47:10.635231', '2026-01-29 14:47:01.826868'),
(5, 'TRufhakR2FK93zgd0dRJG7cAKy91CLq7YL0hvkOaYhwJSOQHqrMWuE23Wt0X8cq7Qy/Htxevfyfo3L9KAiko8Q==', 1, '2026-02-05 14:47:10.635620', '2026-01-29 14:52:33.921457', '2026-01-29 14:47:10.635624'),
(6, 'DALCEH0q4XDfQSZXeBx4IjjRbHcYf+S20dhO5TQv8cCSTyFJ/eigopff736mizICRrCPKcBHbr7pzMt6KuvTRQ==', 1, '2026-02-05 14:52:33.921727', '2026-01-29 14:56:48.198921', '2026-01-29 14:52:33.921734'),
(7, '1oSJxZFcogPFsjezpCyAmPBH1tT/WvD1UHwWGUvqtnTRI4in11ZQ7x5lXfwWt/h/3ak4oKx0nGfmNu3Xk0rZgg==', 1, '2026-02-05 14:56:48.199168', '2026-01-29 14:59:08.728022', '2026-01-29 14:56:48.199173'),
(8, 'FpGmhHImXSJsIKV1mbWG24Of6DHK7tG0jbEnwyySOcamSXg05CcVwgaVlVmBHYQ/EJ7fTAqOZfajhZ7K07KmIA==', 1, '2026-02-05 14:59:08.752055', '2026-01-29 14:59:19.802836', '2026-01-29 14:59:08.752224'),
(9, '+HPFvo+w0F6XsvWO8gm2r4NIN27mduCZoFMO8MmmDjd1mFhuraQj4SKNe/CVWn2CH199YDYVyZpz67Dejh0+aw==', 1, '2026-02-05 14:59:19.803091', '2026-01-29 14:59:33.050509', '2026-01-29 14:59:19.803096'),
(10, 'gNRxeXgTHTH/CXbIrE3jVKUiF25g1/Q/3aDaxffS4A0N4FmLadtzR0cJh4MIixBOE/XMqfDDS/VxECv+8FuDRQ==', 1, '2026-02-05 14:59:33.050718', '2026-01-29 14:59:38.387743', '2026-01-29 14:59:33.050724'),
(11, 'ORyDdepnMvWSABX0oG2iWEAgKcdq1WTEvjvK1y7Kqs7WkNF9gnqhbyACEfJPzEBLQ/cTUuAcr1de1DSDwduNkw==', 1, '2026-02-05 14:59:38.388213', '2026-01-29 14:59:48.218879', '2026-01-29 14:59:38.388233'),
(12, 'sRyMbHnZMoKR7Xya5yqXr7Kzs5mPDfCn3fuHAolSgwQqsWLvVpvvZr92qSZAWkF1TLLdtkTck22IuDh4X2wGhw==', 1, '2026-02-05 14:59:48.219774', '2026-01-29 14:59:56.931780', '2026-01-29 14:59:48.219785'),
(13, 'MUu/fmMy2Ljr25oUpely2vhCi2lmHqvBzO288hgyjqAxgqZwrUk/31f84uueCP1dyXWQiGXrtBj2KNBhrdfAAA==', 1, '2026-02-05 14:59:56.932527', '2026-01-29 15:00:14.070168', '2026-01-29 14:59:56.932617'),
(14, 'RWIsjRbFrezTN1VHxCHQbHqDKigpHn/AnJ/vLcqy0520yBo2/aATmalfOIbFDZzFVOkNL41xbqKxI4BAV1ns+w==', 1, '2026-02-05 15:00:14.070590', '2026-01-29 15:00:23.747627', '2026-01-29 15:00:14.070601'),
(15, 'nWStrNIiKgSqD8qQVzSHDK3T+K4pp9kDmxzZvQlU5zP26SZR4SOdWj1OVz1tSY8xH19ImCKQv7VbIh1RAqTedg==', 1, '2026-02-05 15:00:23.747863', '2026-01-29 15:00:27.293069', '2026-01-29 15:00:23.747867'),
(16, 'f49F9ozwb6c6B0Xy5lVRpx58V2fBom9vckr0UHViQq1gUBH2fKI9oIAFDcL7uyhXqZrn5ruBZhM9b8ooCbAwBg==', 1, '2026-02-05 15:00:27.293230', '2026-01-29 15:00:30.260101', '2026-01-29 15:00:27.293233'),
(17, 'cgC1IhVqFR52JLkpwsfNWlMe5CLuN9yojQauY/mRYL9Y+PjrH1YpslOk2WP5xLja2MKS4eD2YtbsoYy1+dr/uA==', 1, '2026-02-05 15:00:30.260304', '2026-01-29 15:01:10.725770', '2026-01-29 15:00:30.260307'),
(18, 'xq/dVJ5ZKPeletgipafMmSa1Rpdp0AdkcFLDz2zFLbln2kDtFLSjTje9F7aIzKEySyXVj37fIn9wfFW7q1XTaw==', 1, '2026-02-05 15:01:10.726101', '2026-01-29 15:01:24.260450', '2026-01-29 15:01:10.726107'),
(19, 'dwhYjw1eeZeU3ZzG54xeQ+NfHPI6nBjP4Iq3y2wy35zbKcsBRXqEUmj5wEvQJsQ+nPO375P2k55gHVRSvVd7eg==', 1, '2026-02-05 15:01:24.261410', '2026-01-29 15:01:37.541618', '2026-01-29 15:01:24.261417'),
(20, 'Q7P+4ukFgRjfcIK/6voBSwml5w2k8YpCiBAqCfLKHLXQEngM+ImMY779/idJmWbaE8U2eCi/4sywp+hA3LGJRA==', 1, '2026-02-05 15:01:37.541895', '2026-01-29 15:03:20.474820', '2026-01-29 15:01:37.541900'),
(21, 'Wt20cA9D09Jyyu39spQuqaumeWezkci1ImewSyH4kXhkjXPFZsuYsOitsFLF7FqTO4YVrNkp8qkPtUTYOO6xUQ==', 1, '2026-02-05 15:03:20.475081', '2026-01-29 15:03:36.217744', '2026-01-29 15:03:20.475086'),
(22, 'gReXZ7Dj48R8sgV+3Tryq75K8isSLcme782HeTj6FpBCUbkbUOtr0C5DUbEJiSymYHR11DxmM6DSxWZWAKj1Kg==', 1, '2026-02-05 15:03:36.217971', '2026-01-29 15:04:28.182963', '2026-01-29 15:03:36.217976'),
(23, 'mzUmGcvfzJ6BQI5RS7V8/T769iQFsnfnWxQ+RXZ3iUTTTJKGOy2OgGOdrL335r8fjwEZeBsTDuDniuy2tMygOA==', 1, '2026-02-05 15:04:28.201066', '2026-01-29 15:04:34.027561', '2026-01-29 15:04:28.201250'),
(24, '4ZRhZdUJ+dMnYioKsV01CRW7TuHxDAE1ZbISQlomNDLhjbUey/7JXMNmGDl26YBvu24Ex5W4DvO6aaPRzmFVGw==', 1, '2026-02-05 15:04:34.027912', '2026-01-29 15:04:38.544718', '2026-01-29 15:04:34.027921'),
(25, 'qvFeBzJLcECS9HWv9i/X8aQp+TDVlyHmSHlyXYtTeConO5QWuto3yc1LgCXJqSM3kajuACnPc9wFBlQwBPoX8Q==', 1, '2026-02-05 15:04:38.544962', '2026-01-29 15:06:03.381264', '2026-01-29 15:04:38.544968'),
(26, 'P0LgEBVx6GSBM0c56Ckkpk9Yec6MKyPpRwvyc13vvGjdP1BjL4gCoDpxnllfE5QFsQBjeOvT8cVvICpcqzAy0Q==', 1, '2026-02-05 15:06:03.381620', '2026-01-29 15:07:14.098762', '2026-01-29 15:06:03.381626'),
(27, 'T4B2m/bNVirBycjN0ugaV8P52sM+bslZ88fxZVdZ/1pIJwy+eoXqSZ4nJKc5q13vCqP62T4+ei+zMyZ9fHFaww==', 1, '2026-02-05 15:07:14.099142', '2026-01-29 15:07:24.623281', '2026-01-29 15:07:14.099154'),
(28, 'tXUKBhiw7gbWjT6Jgm9axuGwIivmGTneCIUvDOPFOWUzuZLVwIeLkBGxD9Eh1d+aZJNmWM8gT8alZU+2kPh/0A==', 1, '2026-02-05 15:07:24.623630', '2026-01-29 15:08:07.515692', '2026-01-29 15:07:24.623636'),
(29, 'uFIXqBqg81orgoWP6aYKsEwNU1pPGGzCDMXudmypuVrtSm50tmzj2SKZ+V/3l8e1qlGmtyMsAvRhnOnmPKNGPg==', 1, '2026-02-05 15:08:07.516086', '2026-01-29 15:09:08.523864', '2026-01-29 15:08:07.516093'),
(30, 'jKKqYoFW9mKJ564yQ7jtcvPeNW4nK8Q+arFjF7KrfKhNbhQBvdPPwr4PDaaZNkc0iZN3aPVMxPtRam16NUohRw==', 1, '2026-02-05 15:09:08.524270', '2026-01-29 15:12:12.665565', '2026-01-29 15:09:08.524276'),
(31, 'aNU/038HfkHHTMItwGKHGpYWv6bE4dRu2szrsbzptd8BR/JxTTYpseEFshYHn/6Rfoc7UUqtsUW9eejA7HO+qQ==', 1, '2026-02-05 15:12:12.665803', '2026-01-29 15:12:16.709243', '2026-01-29 15:12:12.665808'),
(32, 'yUtoOo9oXN6JS/dwNuQspRKp0RiZgLdPaTyj9KMJGWelEsSvP+IvLM/EYUox7QoQ2btVbq8udNX56B0D17QLOQ==', 1, '2026-02-05 15:12:16.709512', '2026-01-29 15:12:30.726656', '2026-01-29 15:12:16.709517'),
(33, 'AaJlYY1KW5kMI9Aq49RHrxoklBkX2Svd73ebdO+DWR++PvBUCpvAvpZAF07jhurgKZSE215e0CUUs7QnbfdXrw==', 1, '2026-02-05 15:12:30.726948', '2026-01-29 15:14:02.380708', '2026-01-29 15:12:30.726951'),
(34, 'neMqBpy/8InnpiQR2iwbpLanR0KYvZYTQ4eiXlSNWGkmH/YtukyPvEBjjsS//weKnym525n/l7KyeLrSZqIPaQ==', 1, '2026-02-05 15:14:02.381086', '2026-01-29 15:14:05.130720', '2026-01-29 15:14:02.381091'),
(35, '/i4MjnxFwan7zRGKIVm98klQ/XWU/4Tf9QhfrzHEReBN/NcBVtWiU2rqoAvyJtQLAmy0T4u+g+kzogLFB9XvFg==', 1, '2026-02-05 15:14:05.130884', '2026-01-29 15:15:44.952249', '2026-01-29 15:14:05.130888'),
(36, '6/D8bBn6y7FBmRbDQnvwEqSgxIIJn8Z3XrJ+Qczi9LkaGiPK0Sn1tB8Pi+HjXd0csAMRSAVdZV5w7Jrl34lXug==', 1, '2026-02-05 15:15:44.952483', '2026-01-29 15:15:47.046613', '2026-01-29 15:15:44.952525'),
(37, '5InAIjRu8DPuaWh8yBQIXmy2KMKQFM0Krq/7tUZUBNt0q9Sfywd3fpXHqRbjKCMJF3wOIlu9PjEKVJspRf8b9A==', 1, '2026-02-05 15:15:47.046876', '2026-01-29 15:15:55.577720', '2026-01-29 15:15:47.046882'),
(38, 'QhLZ860J8yxaPr/9IlDGYhbDMASZOwusoA4eRH6GwiSDB78K1eof5uIlq3inE4oAYmefms8etF6N11rceV/aWw==', 1, '2026-02-05 15:15:55.578028', '2026-01-29 15:16:06.526633', '2026-01-29 15:15:55.578033'),
(39, 'tAXULQpCJ3l1rXACDVMQTR5HAUUKxk/GeN93w3GnjnUYmVjaFEGkTewcuR22PEO1yX2Ej8kZ+OdmFaoUipkh8A==', 1, '2026-02-05 15:16:06.526777', '2026-01-29 15:16:25.081898', '2026-01-29 15:16:06.526781'),
(40, 'pnpsTshVnC/YqUr7XgUTlWlCZ4shdAsCUGpnZ5zdKViaxEwShlPg2ZWhDiTTuvbN/Z167cN5t3GWqHAWWH9DPA==', 1, '2026-02-05 15:16:25.082033', '2026-01-29 15:16:37.199037', '2026-01-29 15:16:25.082036'),
(41, 'Nu/eQvoNAgnD2Zb2NgixeInWeRiBkk1j17euW3+yMBVJDg1PRUbKB19p8nXNBaugGQc/eT8Tb0+GM4CnG8wZwQ==', 1, '2026-02-05 15:16:37.199279', '2026-01-29 15:17:45.233276', '2026-01-29 15:16:37.199285'),
(42, 'e+pVCF2AVqjx0fBvahIUeBl32EkDBwpy6W1JzU48r7aKZcFETQ+cM4rUeWhwFZHtoBAU06AexPhZuq1/LQXR9w==', 1, '2026-02-05 15:17:45.233439', '2026-01-29 15:18:50.920037', '2026-01-29 15:17:45.233444'),
(43, 'pMFp2HXjDs8Q1TLq0CqgpyLIrZQtlE4MORNybao7iF1mdRH2/JaUzLixE3IAP08OqmVYdNDusoTgKrCnL8xYSg==', 1, '2026-02-05 15:18:50.920193', '2026-01-29 15:22:46.773272', '2026-01-29 15:18:50.920197'),
(44, 'VpazLiuob6YEEpLa6hVFGe71WTwbtqlWPofB+EKMXTKC/VBKSfNIKTVBZz1beyEOyWWyRuR32s91rXDw9PZ9gA==', 1, '2026-02-05 15:22:46.773869', '2026-01-29 15:23:22.017539', '2026-01-29 15:22:46.773878'),
(45, 'Ergswj+DHjDa1BblBM3YqBpBzX8JdItBw8uuh2kaJN8I7VPkh0b+yWGBTI9FvCt4fmeDVUfH2aCoJoj6KTLmdw==', 1, '2026-02-05 15:23:22.017761', '2026-01-29 15:23:24.357446', '2026-01-29 15:23:22.017766'),
(46, '/iENbzK+Zy7KjvoDFJQkB/jDYzB4z6bj/ifYvO8m30mzwvyJMwMhgy9QqIxrU0vn4GTZI49ogOiQ+CmvQPrNZg==', 1, '2026-02-05 15:23:24.357579', '2026-01-29 15:23:27.976979', '2026-01-29 15:23:24.357583'),
(47, 'Er33NcC1VOObvhWiKy4sOANGgrxQRHokBFd5sfOa70b1j9rO/whQMH+D19uWYdGCdKDciVAG39ssR2W91iAvQw==', 1, '2026-02-05 15:23:27.977131', '2026-01-29 15:25:38.811180', '2026-01-29 15:23:27.977135'),
(48, '/bt27yGvtg4n0kIfLFtUSjHiuUWAH/FDB0CSzSvu2++vbIg5CWf80L6x7Qqh3K68R1ykj71DAVrCTe/Dtv37Lw==', 1, '2026-02-05 15:25:38.824356', '2026-01-29 15:28:09.569550', '2026-01-29 15:25:38.824360'),
(49, '3reqU1nYdvlOPP+fOt9SVNlqXpvBrWO68WGCI+lSyc4JhCTkY7LH+4iBeIHjhM8btWhgLuYtFoX9W87+JC7QvA==', 1, '2026-02-05 15:28:09.569753', '2026-01-29 15:30:07.994597', '2026-01-29 15:28:09.569758'),
(50, 'qQMjEVxFQmWNprRRA/XtgeCXx0XhpNJ3U9/ZNernOPZJsICbjFgKXnakrsOi7HGy84AFcRsLuGWvC40QRxj/vQ==', 1, '2026-02-05 15:30:07.995025', '2026-01-29 15:30:08.962720', '2026-01-29 15:30:07.995117'),
(51, 'FBUh8pmZoP/iqtVaMYRU9/rNM2jUFQ9s9RRkjajTXoReJQhL3NchHzvveSM/j/Bnt/9r0+d3Wo+AoCsWkFYT9Q==', 1, '2026-02-05 15:30:08.962875', '2026-01-29 15:30:14.445764', '2026-01-29 15:30:08.962879'),
(52, 'i2gg4LyOxYgIeseq4GmNrinmPwDhrVcp1PrA8j+yvgkBv+wnNEhYGbrSEdKYXXjoUxbl4GtS7jbwaDzdUWTqfw==', 1, '2026-02-05 15:30:14.445929', '2026-01-29 15:30:50.824589', '2026-01-29 15:30:14.445932'),
(53, 'HTjqOkAS7SBIE6PT1R3iZEAYG5xTbt1G9Ot19tq3b6i1wAKcUn88geg03S2GsusKuEEay4rzdiN7bRs2MMsDIA==', 1, '2026-02-05 15:30:50.824777', '2026-01-29 15:31:14.983620', '2026-01-29 15:30:50.824783'),
(54, 'jCip0iRokBdNBqFyw+stALzKhfv3Ro5EzbwRpljFwi74ADgeN7Mds87jEcIbzWj2f5ALKq6pXiTl1L2aA3O5sQ==', 1, '2026-02-05 15:31:14.983897', '2026-01-29 15:32:23.531567', '2026-01-29 15:31:14.983901'),
(55, 'wjNOcFYTmI3O4SVweWqwKLkz9TzNWcA0z9JYcEo1NrxYOXVKq+xMs0HW7hQesk1bT4SUICSjMCjbZMKalKiavQ==', 1, '2026-02-05 15:32:23.531679', '2026-01-29 15:32:28.984649', '2026-01-29 15:32:23.531683'),
(56, 'o0P8gm58pR/x93k7V1etkMUM/GgcJfspDUUSkt+S5L+eYHA/sbSa5W2lIg1MV5xyXO7Db74Y8ZX7Ry3fWyCxgg==', 1, '2026-02-05 15:32:28.984728', '2026-01-29 15:33:42.445769', '2026-01-29 15:32:28.984730'),
(57, 'w+OHaLJCENnfP0zR68vJvjkCmknoR2THaYcj+eAU8t4Uj227Limc94JKtnq7wVmaiXdppMCpOshCMgWoCfamYQ==', 1, '2026-02-05 15:33:42.445943', '2026-01-29 15:34:44.919023', '2026-01-29 15:33:42.445947'),
(58, 'fmJNkVRtQHEuWPekOlRqupInWDicxVUZiKtj+SQxQJMHk9Ap1tF8uDomdYIWp6KwVdjw9zLwN/HvufwwVpT8bA==', 1, '2026-02-05 15:34:44.919132', '2026-01-29 15:35:18.650008', '2026-01-29 15:34:44.919134'),
(59, '3FWCOGa/QZUF7WiMhIKtMYpUm53gZ53rWPlHhNfqhgyU+e8G1e8FM0PEBb8uqW9QjGZ4DpDi33pqtvtPZd0WTA==', 1, '2026-02-05 15:35:18.659247', '2026-01-29 15:35:42.160125', '2026-01-29 15:35:18.659514'),
(60, 'vnHWvYDjl2qE63Q+UwPxjpeGl8udzjKaoKiTRS26m3Q5xZMoAi678P0JkV3HNqRrqua4oL79BoZHN6r/NpJrJQ==', 1, '2026-02-05 15:35:42.160225', NULL, '2026-01-29 15:35:42.160228'),
(61, 'HuTUBdWbQKfsf32DioP7pN3kZCGWWagXQToQOLXpxpFxL0c1d6Brlthmi7RVbBB2NJjBYVjoS/UEyBPWj+HOrA==', 1, '2026-02-05 15:37:41.869658', '2026-01-29 15:38:44.892406', '2026-01-29 15:37:41.869660'),
(62, 'PlkeHOyZkaEVcF6+R+0oWgxdtEERjkvnUyJJHY1aNMFU5go8MPPb9oiG+VlIoH60yUUrw/dzeCUnW9wwGF9tWA==', 1, '2026-02-05 15:38:44.892520', '2026-01-29 15:38:47.333393', '2026-01-29 15:38:44.892524'),
(63, 'DZb6v/+4rnGJpXP1etDYleKsW2ThJRnXffDf3xwKFCKhfF+FrRFTeUTQYI7dRUYswB0tbIS23GTL8Abt5AhV+A==', 1, '2026-02-05 15:38:47.333501', '2026-01-29 15:38:53.152697', '2026-01-29 15:38:47.333505'),
(64, 'sLPfeT3ZuLGAUdL0s7szFZoN8VSQr/XcawCqte+IQhgJvOwHTSL3ihMPH1yVGs747bRO7/f/cS6+DHbDJ+q7YQ==', 1, '2026-02-05 15:38:53.152826', '2026-01-29 15:39:09.293969', '2026-01-29 15:38:53.152829'),
(65, '/BsOIHHoko14g1ai+R7y8Eog+Mm7YrmiDb/Dp3d4KHGdXDUMT/oCsOx6loQ11xPvEBkGrzP9u/1TmJHxvvcqLg==', 1, '2026-02-05 15:39:09.294093', '2026-01-29 15:39:15.428984', '2026-01-29 15:39:09.294097'),
(66, 'DpmTLyXooc2v3DgQ0lG96WEBJqsfRBG8FlYWIGgpFQs1bM9K3+KZFZJEELMVvRIKesYNqVmeVCmCcc/7P2mOtA==', 1, '2026-02-05 15:39:15.429266', '2026-01-29 15:39:21.322547', '2026-01-29 15:39:15.429275'),
(67, 'cFqrFdHN2iSnw+8nx5x4AYuPIttyG4xaf7btqyv8+0wwtBJXHevDzu2SoaAA1oycFhlDhLF+uT3foRuX3b2llg==', 1, '2026-02-05 15:39:21.322628', '2026-01-29 15:41:48.509075', '2026-01-29 15:39:21.322630'),
(68, 'IXBeliD2tQ6YrxhyCeXhPiFEKqoOuu9Pzp4j4oc73/cFz8rWhwG5eCEmQJYV0iJQsu3/R+cp9/mi1S4ytcW2Qg==', 1, '2026-02-05 15:41:48.509206', '2026-01-29 15:42:06.261524', '2026-01-29 15:41:48.509209'),
(69, 'rYd+Q6X7IWn4XWmKmCtQnjqo9n05Ly0pgfWjhwC5VS2FlNGQRVLTGSYMqa1DVT5lQ9i3YIAxBSesjGGLWDa3WQ==', 1, '2026-02-05 15:42:06.261649', '2026-01-29 15:42:14.899417', '2026-01-29 15:42:06.261654'),
(70, 'lMu4/X11KD/Z9tqlhsDhf8hFFg6ue9wpgmMFNpTwRWvO54L7dwGdLYTWNBB5d/LhunSy7s9DvenXYEuv1eKOjg==', 1, '2026-02-05 15:42:14.899509', NULL, '2026-01-29 15:42:14.899511'),
(71, 'tkkKiEgMQy4sD4BMdUXliK+ih2tXXs2cjI+11Uzb/HOxEb1kFAZl//5/4oOnrJpEM4QO77c7Z8di8YmnGNRQuw==', 1, '2026-02-05 15:44:51.633047', '2026-01-29 15:44:52.034868', '2026-01-29 15:44:51.633049'),
(72, 'NWsO3K3MadRHqB2ltDMLEVcjzLzMvJwOKRsR4qc2N+flHw7OxZs9YBj6Frp0IQ9n928IEsXa4eZ6EoARgYOdEQ==', 1, '2026-02-05 15:44:52.035521', '2026-01-29 15:45:04.823010', '2026-01-29 15:44:52.035752'),
(73, '4FogDxrzagyz0/gNE5rGKZguFo8I8dnWYboVUBzDA3+lI2ytNmwpZrSW1cSxAvmWNlNLBVmcj1mrgY+2C3LKCg==', 1, '2026-02-05 15:45:04.823195', '2026-01-29 15:45:09.238862', '2026-01-29 15:45:04.823199'),
(74, 'kENJyQQYLKbkdT5+L2WqCSv1hBCM5XlUbUVHyB44SYyS5K0N+0P8HcNAeiGqa8mmFB9rGCqOeCbgRJhfEnPSOA==', 1, '2026-02-05 15:45:09.238946', '2026-01-29 15:47:51.454843', '2026-01-29 15:45:09.238949'),
(75, '9+yH4uPD756kyj4uTFYAOKP0MLTY88An6YMO5TrkECDo3fCIldv98icLEGT0YtcudbeYHboJBIm/6hCXhmt0Vw==', 1, '2026-02-05 15:47:51.454962', '2026-01-29 15:48:10.886541', '2026-01-29 15:47:51.454964'),
(76, 'NOeKMf5P+kZHu5ZULTOgz6u37c2aX2QYke75+zp8X6GNlYJICRi3DnrNkQE1LE7zDioJfg7N0tEZSx2uoSy4lQ==', 1, '2026-02-05 15:48:10.886638', '2026-01-29 15:48:13.599482', '2026-01-29 15:48:10.886640'),
(77, 'UTvyPJ834hIbRvBmFwcpGh/ohN9qT41v4kpF5CdV89pCecYsT+66nvie8EU5l1E0dLC0pEQFXeH91CR/jEnjkA==', 1, '2026-02-05 15:48:13.599575', NULL, '2026-01-29 15:48:13.599578'),
(78, 'bBz3HmmpJsMFwCfx5fjne69E4qTdSdCNXWsVrxlb2mNHcQSVAKoED1EEsFVXr/Aw6Y5hyN98BDQNneYctAPkeg==', 1, '2026-02-05 15:49:49.697282', '2026-01-29 15:49:49.975925', '2026-01-29 15:49:49.697284'),
(79, '245u7iwO8gfIx4Ye2SfhhrWCZqnuEVYhO6t8zVeWV0lblAwh8QbASc18GKxW9ck1G8JzVIZRs3QWjodE56wLJA==', 1, '2026-02-05 15:49:49.976036', '2026-01-29 15:50:03.066845', '2026-01-29 15:49:49.976038'),
(80, 'StCrT/DdMksHtezM/vZeo/n1EAHz1bA6kItcxqhsgxTMfADnNKIycn1zUy1mPT6QbA6mdkgmMAvgoLlxcEnHNg==', 1, '2026-02-05 15:50:03.066951', '2026-01-29 15:50:09.452524', '2026-01-29 15:50:03.066953'),
(81, 'rEUHpH3eRR6lvrVCrAhiLteE0KeDYj8c6SRIhqDp9ojYi7RsNit9vmgIb4+WWs1weqqs+QCkgxmOfA52JIejVg==', 1, '2026-02-05 15:50:09.453133', '2026-01-29 15:50:20.956669', '2026-01-29 15:50:09.453140'),
(82, 'gDwrTHlLXu7wGSFR/Dzf4kJ0Co9o8weUQ205ss65KetRz67nNzNFlJK16Q0cbYXAV7McYgKdD3NqIH8+FBdhDg==', 1, '2026-02-05 15:50:20.956824', '2026-01-29 15:50:29.723913', '2026-01-29 15:50:20.956827'),
(83, '+hT/BiMYGfL5bZya6zB7o/qxzMjGKHtoYdNXBRkkSNpPQBAMCAadAMmgukeoWuFuakFTibsB2Wpzu559OASxBw==', 1, '2026-02-05 15:50:29.724893', '2026-01-29 15:52:46.684238', '2026-01-29 15:50:29.724901'),
(84, 'PHXMnSA9gkxb4XXm0Eyd+vjBBNsGOQY4yMS2y8fkj6qw7WN6KUpy4h5NLBGSh7sRk4NFb9Pv/a1TqOrBZUH5Yw==', 1, '2026-02-05 15:52:46.714208', '2026-01-29 15:52:56.101343', '2026-01-29 15:52:46.714389'),
(85, 'oL4Okx2hibRjAmYUtbmun7swO9ItuNmAkfEyqjqRSJEI0uKr5av2PMRXH5uCgoRbNRpsuV71YDny8ZSzO41KoA==', 1, '2026-02-05 15:52:56.101644', '2026-01-29 15:53:00.747056', '2026-01-29 15:52:56.101651'),
(86, 'IaDKTnHCQmzTZmIMCJyoiqpJRSI6oyZ5LxpUuE2sRiVDj1GfYZb0DR1KHS51Xe/r5vRbPGfDml3VK9yrzWkcVA==', 1, '2026-02-05 15:53:00.749074', '2026-01-29 15:53:04.180170', '2026-01-29 15:53:00.749080'),
(87, 'qbHyIFODwcl3COC2+Ti1S0VzxJD6GusHi3+UnzIpUk9+RJdOmFGrpkTkrDgkHjNlgm5PAcGt1mrFtX1aH+AUqg==', 1, '2026-02-05 15:53:04.180418', '2026-01-29 15:53:08.144760', '2026-01-29 15:53:04.180425'),
(88, 'UROeQvjRh/Ia/OxQ8xBxKVPoKsx869R77432e5mD9kISJVGnRt2WG0vpnSIgiYABlAwRdCZaLaxNA9SREUt4AQ==', 1, '2026-02-05 15:53:08.144943', '2026-01-29 15:53:16.030818', '2026-01-29 15:53:08.144947'),
(89, 'View3mWWzG1+FKwFi8h4elAyq019dhOnBMcurc3tFKgtsQP26cVrwBTJulH7qrcunLzy9mW3o8prvT1sDF2G8Q==', 1, '2026-02-05 15:53:16.031045', '2026-01-29 15:53:19.446324', '2026-01-29 15:53:16.031056'),
(90, 'GukrfRDqQH+tn+nlui1GNcdxYs8i9PX5wwmcDTPHGkIirDed09RDtj0ra/AMHM3lhXueF1TmBJVH/OJXCYNIbQ==', 1, '2026-02-05 15:53:19.446552', '2026-01-29 15:53:32.826009', '2026-01-29 15:53:19.446558'),
(91, 'EKOCSPrnY8uE9aKEBSkEysV4NotyJ/U+z4EhH8WO/dCmy96bpDmRB+53zd+HQ1QrFTh9ix6dlzVAKE+pmVBtog==', 1, '2026-02-05 15:53:32.826590', '2026-01-29 15:55:52.884744', '2026-01-29 15:53:32.826635'),
(92, 'evaQSy0kBMVuJ40NlmEzpGOOFe+a6G3/qRqD9Tks8ooE0EmR3gzo76MdHIc0xcZgHcYdxrW0l4tixxst03jQXg==', 1, '2026-02-05 15:55:52.918889', NULL, '2026-01-29 15:55:52.919046'),
(93, 'ERJN0Pxb9P54PwTvpsyaJ4X03gnzPrj5z5YJ3DOaCyNz1CyyRXadz4wAZL/zUN58K/NO40aE3UKqUXcAUN1C6g==', 1, '2026-02-05 15:55:53.486773', '2026-01-29 15:56:02.466779', '2026-01-29 15:55:53.486781'),
(94, 'ABA0xdfJzR/pfCAcXqKpPYK5zYveSWn6MTqHbRRGeh7EsUFjCfqMl8sCrUa9iaKCCoV0cMTpv82LMKl5cxdlhQ==', 1, '2026-02-05 15:56:02.467150', '2026-01-29 15:56:06.229500', '2026-01-29 15:56:02.467160'),
(95, 'We1rKh1eK3/34L4/J5XG013zjJdku7+Mw5/3iZKe/yvR4DwWCqP9YLPUkEFzwDEZgheLAqw6m/xddmfrD2THPA==', 1, '2026-02-05 15:56:06.229896', '2026-01-29 15:56:09.066471', '2026-01-29 15:56:06.229907'),
(96, 'Tr/82UXJYkrUpbP2rCpieO3H1u53PczvY+aRM43lD1dWveOGLI4iAKNxDe0XvqfY2ccPS0IAcCP6OcgaffDucA==', 1, '2026-02-05 15:56:09.066664', '2026-01-29 15:56:17.310909', '2026-01-29 15:56:09.066670'),
(97, 'Wmf6ZyuHT2xexsi54HSytCLZtxym3BWYUx0d7GzOuhKqI6sPm9UJAbvWyF33Tq/pI2M7bgkQRUqeM+R41EaqNw==', 1, '2026-02-05 15:56:17.311076', '2026-01-29 15:56:28.247360', '2026-01-29 15:56:17.311079'),
(98, 'WnpwUWe2+jtHtfclf/p1mFvIFMLkLxvPxq7Dcw8bO8Ip861RsfaTx96efULxmbrVvrtd8bYs8ha3X6kBY8Tpng==', 1, '2026-02-05 15:56:28.247567', '2026-01-29 15:56:34.065744', '2026-01-29 15:56:28.247571'),
(99, 'AKNtWR4eBfFpDjEc3Lx6jDLj35BZcTeJJpSArO9EEyJfL88nFXQIMr63JnRHBz1FksNq6aaQidG5ENk94Q0Oxg==', 1, '2026-02-05 15:56:34.065959', '2026-01-29 15:56:41.706805', '2026-01-29 15:56:34.065963'),
(100, 'MyT/1SSo45oAN8RwFsY/M75ERcWF6MRcvobn2xp4f5mMcEylW4hVo6f/3xOOBXQ+/JJR7XE6dx4J3/uC+00l3w==', 1, '2026-02-05 15:56:41.707001', '2026-01-29 15:56:47.261493', '2026-01-29 15:56:41.707007'),
(101, 'YUcWOKue3A3N7HEht87OJwd6GiP1eOa8SysxuwIDRg+BbAqBbAuALAfPgchSmE1sNSVZ3EC2f17f8nU/5y+Llw==', 1, '2026-02-05 15:56:47.262172', '2026-01-29 15:56:51.911182', '2026-01-29 15:56:47.262178'),
(102, '07Vq7iaCmy39UwXaUW0jCQjUvbbPioHm6gJW+WnKboXkjBgGkrWW9jTJHYKt6rFFuN7VygxApZkvsKqz1/RTsg==', 1, '2026-02-05 15:56:51.911372', '2026-01-29 15:56:54.427625', '2026-01-29 15:56:51.911375'),
(103, 'riMUbPAd8Ao3AHEz1UXVeR2Efc/PHbib8b5J4zh3uU3Qw5844aK5yNAVyQhwYsck4tNJ9WeYDowGKIQ+v9BdCA==', 1, '2026-02-05 15:56:54.428019', '2026-01-29 15:59:58.598411', '2026-01-29 15:56:54.428023'),
(104, 'PKXaSKo2v3RJ1tCD7r9HLPHNjfjKEZI6TL6xxk04ZF+jtNQvvRUkj3GCPKMqCIYJKEA7YlsEqsQrmpyYHrX29Q==', 1, '2026-02-05 15:59:58.593342', NULL, '2026-01-29 15:59:58.593466'),
(105, 'CR/wdZV9RaZD1jS799YKPGC8co5fOdpDDqDuBWAFIF/PsIHpHvDb2xOwvq8mDpYl2FX0i4dV/wZ5FUX/nUtI7Q==', 1, '2026-02-05 15:59:58.599242', '2026-01-29 15:59:58.720593', '2026-01-29 15:59:58.599250'),
(106, 'QsdFnoHXk39+OAgEyyanyxJ2aNS5wXLFPDViqXycppVHxAMVuy9l1wSYXnGwU3VHe0YIPuz+IkUvS7y26y/X5A==', 1, '2026-02-05 15:59:58.720763', '2026-01-29 16:01:07.612405', '2026-01-29 15:59:58.720767'),
(107, 'eoVCYYBzqOS+1X9J+eCEe1gGaCtKU/FPTpMm1XyEw9csxxt6rWb4aKGJdQ5X+digj7rnq0csIgiim1L/HSGw/g==', 1, '2026-02-05 16:01:07.613226', '2026-01-29 16:01:07.691480', '2026-01-29 16:01:07.613232'),
(108, 'IykH4I2i7PTaySGrMG9TSXM0TLqqpueEp8PGt7p9CeyvtLPl3fJtQfUTGh4MEmnLWGnNEfLSls5i6GMcFWcc4Q==', 1, '2026-02-05 16:01:07.691657', '2026-01-29 16:04:16.942260', '2026-01-29 16:01:07.691662'),
(109, 'HmxVCswObdPw2VaMFiOb6Uav7nl3AW5VznjXMcBVlHvtcLcvQmR8BjKO5EAbjHEEts/y2R3VoVXJaYRh2uz9RQ==', 1, '2026-02-05 16:04:16.965234', '2026-01-29 16:05:28.061743', '2026-01-29 16:04:16.965371'),
(110, '9ITJr3YRCWcXY2Wd/N4qd66TdJnkpTbIdaHo8yPeJxBx4USN9NQO18L0JtBXL1T2t8Uc9/KKDPT0iAA4SLZgZA==', 1, '2026-02-05 16:05:28.062048', NULL, '2026-01-29 16:05:28.062056'),
(111, '6Mrno8MkSk5ialNchiOEutwbFGgbEM0AsESOctUfNc9G/wzv6ZqD7vaxXeA0PiwaFg/SPALNBVVLH2UFJRCc2Q==', 1, '2026-02-05 16:07:40.502458', '2026-01-29 16:07:46.663509', '2026-01-29 16:07:40.502461'),
(112, 'WzoyO7CZkZ+3NJuU5VbbOKS6CcvwIRl5z8pyXyFd1c52Ysf2JtoP3ZxOPitWm8nKLVKmlxyZ9O644O3VFYN3Tw==', 1, '2026-02-05 16:07:46.663692', NULL, '2026-01-29 16:07:46.663696'),
(113, 'QPrpZ7tiOQvo2BZPbnvCZIqqQaQSBZvcl/9E13oBFIe/DLz3glgSkqcpWV9ukZ1luFPv6WQaM2X0+KYSn+mCIw==', 1, '2026-02-05 16:09:03.907505', '2026-01-29 16:09:04.227992', '2026-01-29 16:09:03.907507'),
(114, 'USOGLgVALVbkyoQaqGMqoCfogz7qJ2CycqFm5l6MfScSKRfnk0JVuEWAanTFwitG8EWszHYSpTkIif7EO640sw==', 1, '2026-02-05 16:09:04.228171', '2026-01-29 16:09:09.982308', '2026-01-29 16:09:04.228175'),
(115, 'pj1ZJ3O4Ii+k1Ld7Ig5/NpN0JAk6wUoSWFdhAhtOQtqltLKhDef0a1itAYJwRMF373VHumG2bMPW5L5apOb9IA==', 1, '2026-02-05 16:09:09.982737', '2026-01-29 16:10:17.520909', '2026-01-29 16:09:09.982741'),
(116, 'MXo/xyNoO22yI5qwN20Q87kuSLS9xX+9i7dOSstS481ehu/Uf9mc44ND1/4Z1SV4ZpTJK5wbfXzZXemd3FaP9Q==', 1, '2026-02-05 16:10:17.521190', NULL, '2026-01-29 16:10:17.521193'),
(117, 'lqpM34GfbvgXJ6FtShYEkUzm7kYJwJ/Oq/rh6YzQMZBwoolSlneIlZ7IqzpdVikSdcmCRxkUbzHT8ayMPe/6zw==', 1, '2026-02-05 16:10:19.923324', '2026-01-29 16:10:20.311087', '2026-01-29 16:10:19.923329'),
(118, 'KkkxhLnZEgEuLuyHE5Obz19EM7SxuwsII6Z1Vrr9u/LL8XAE93oeo3DDaY6RpROUeuNIZ6CDqMvnt903cpkr3g==', 1, '2026-02-05 16:10:20.313359', '2026-01-29 16:10:25.293925', '2026-01-29 16:10:20.313369'),
(119, 'ifxK4kBJNqQk7/2z/+D0uwEeIGu69NjYDAOXlP/8yt7m4OEwGgbzFzys6ZnqTAoR6DMBhwuw6264GKwocT6QBQ==', 1, '2026-02-05 16:10:25.295878', '2026-01-29 16:10:29.120720', '2026-01-29 16:10:25.295894'),
(120, 'kx9YMqhtzLJu6WdU1VXHRIXisWlOMkqueXQ+zB3rxDn9jNV9wteX975yDgitaRYvaDoLYUcAbtdBSYom0U+/8g==', 1, '2026-02-05 16:10:29.121162', NULL, '2026-01-29 16:10:29.121172'),
(121, 'B158+p+zg1jQqF2Kij2iDRcmw01mCmBtDd8isnl7ovCYEjlnI5vK02alaXAzz7CzJ8DOQHaC3ZSWv4ecwjxQag==', 1, '2026-02-05 16:11:50.408981', '2026-01-29 16:11:51.069528', '2026-01-29 16:11:50.408987'),
(122, 'PiScFFOUOZe0JD4deSEdZi5ypFGLt1N/FarrHAuKL+jtRuIge1Khh02urIfYvruh3b3gNOTabLWZxXpVUE7Qjw==', 1, '2026-02-05 16:11:51.069915', '2026-01-29 16:11:55.591225', '2026-01-29 16:11:51.069920'),
(123, 'GTgPO4Icl2yOk1xtMZQ+3b0lvvUyPM3zeLQqjJ8TSCBRwZjWW+ljxc48gx/+9uLvkNgnO4+45BIxfmH9aQ57eA==', 1, '2026-02-05 16:11:55.591397', '2026-01-29 16:13:20.089787', '2026-01-29 16:11:55.591402'),
(124, 'bk4YInCj4XhlYteYMyf5ooZarfF/9jzSdReiWxV9H4YyMcVBYloq+ZXQSTKLHTTbrX+PjW4sk1iiDtSUlIKlcg==', 1, '2026-02-05 16:13:20.081322', NULL, '2026-01-29 16:13:20.081326'),
(125, 'dg14NiD5wW3qhSCfp4IOAnle038lF/evpv6sWSZnBhvtlUAyup60Tfflf8GFSzjlpw1BKw+/9XHT4fd2ZfyBkw==', 1, '2026-02-05 16:13:20.090055', NULL, '2026-01-29 16:13:20.090061'),
(126, 'clDjE3cA7MykLEkc6aJRoGsWmT8AA83QUHe+fmwbqydK/xmVdCmCq1qgIKy4hd0agXEjYub/ekn0AkoBqDWgiw==', 1, '2026-02-05 16:13:51.701010', '2026-01-29 16:13:52.041212', '2026-01-29 16:13:51.701014'),
(127, 'fsFF5MQRgl2D5kt5eBrQRdHkXWrwmaIC/jcNngeU8LVVKqaewVZGPslMN6lxVOI1b1FC+znSjmc/41gYG/2kSQ==', 1, '2026-02-05 16:13:52.041434', '2026-01-29 16:14:10.465942', '2026-01-29 16:13:52.041438'),
(128, 'zCMq70M9TEExY2s7P8QqGO9nfY5IASaRRZ7GDWnjlXlh8aJstuEHGbueKylj0+rOMdXT/ToKE27kVGD9WUIDFA==', 1, '2026-02-05 16:14:10.466106', '2026-01-29 16:15:29.532294', '2026-01-29 16:14:10.466110'),
(129, '6yq9Ecb42yQch/RNk3NpcswDJn0l9VoSOyLz4j2AU/sLWkqRHp8SkWsgMuzP2pdqX7Va9J3VlfA4G4z+VgBTVQ==', 1, '2026-02-05 16:15:29.532533', '2026-01-29 16:16:21.887721', '2026-01-29 16:15:29.532539'),
(130, '8FQgdCy8qzII3n0lItEVQUlhxPS32N1KgKrHFLtiUn3VeTiszVZeS9uEZG3LiKv2rajfykFckdH6m6W4y/BVXA==', 1, '2026-02-05 16:16:21.888006', '2026-01-29 16:16:24.380969', '2026-01-29 16:16:21.888013'),
(131, 'JctemrfSLqWmbAlUghdQoNuHNsHCStUVyuO+VNLxEm4KrDNmSRUv2tl1LdNIuFP5WxPWlaz+tg50i4JJC3bRwA==', 1, '2026-02-05 16:16:24.381112', '2026-01-29 16:16:38.437609', '2026-01-29 16:16:24.381116'),
(132, 'BnCy+hSDKRoJCRkcdWeCrV3+GgdewKedXThxY7alVm9CvhWZF3iA27/JAdZgc+gL0bKUlG2Wnm8d0h01fs3Xkg==', 1, '2026-02-05 16:16:38.438118', '2026-01-29 16:17:12.987939', '2026-01-29 16:16:38.438125'),
(133, 'FdwaTG2mjK42lCe7iupsrKw6Cn8SOU6mThjYbD4c0BcB13kE0Q9jE6Ubh6vpOBPCrAW9xpx36X/76IXxucMV4A==', 1, '2026-02-05 16:17:12.988087', '2026-01-29 16:17:18.743601', '2026-01-29 16:17:12.988091'),
(134, 'T4C1YWzRWRJWTWmeNJgR7F7gf2AC/u5MKuezVrq4/ZVt2MWO8yNfjeJBI3ZnsJ+rvW9mWpPJvu+tsiOEBqVIvg==', 1, '2026-02-05 16:17:18.743766', '2026-01-29 16:17:23.186542', '2026-01-29 16:17:18.743771'),
(135, 'Yo/rcm9oM45VjMSFK8QFV6yVJejS90kio1ZvIsIX67C/rDj46452xO6d6O9qkitsM9ohX4PjwmcRfBHAFVeQxg==', 1, '2026-02-05 16:17:23.186703', '2026-01-29 16:18:15.211754', '2026-01-29 16:17:23.186707'),
(136, '3KxgpyH9Tn1A6qef1LIGvLYfEr7Vhnegsm4V4xKguJ0Bpd3AOyaAdx1CKggYvQRieiJDj1znpyIe0LAgyf9mNA==', 1, '2026-02-05 16:18:15.211951', '2026-01-29 16:18:20.862713', '2026-01-29 16:18:15.211956'),
(137, 'NibsJhg6PzW++ev2gk91ztyopIIKTiu8AxlNFgUGX2fKours3dernrKhC0zsXRt7ink5zn9yZaYGDfzt2WoZ8w==', 1, '2026-02-05 16:18:20.862931', '2026-01-29 16:18:28.495379', '2026-01-29 16:18:20.862935'),
(138, '7XfGqXQoSAmCplyNIPqMkrorJrPvSBH2Ez9CDKg+UOmaS+q1wr/7uTx6OZmz6L740r+3nYcG6+c767YGRHq+LA==', 1, '2026-02-05 16:18:28.495564', NULL, '2026-01-29 16:18:28.495567'),
(139, 'vGTzEdtGmRqPm5ss/4hwBUbRGawF/ppLr7jRfKIjMZgpkpR9qKTYGzl0WNSkj5/G+IV5Gh15+7gzktFjHWlgkA==', 1, '2026-02-05 16:19:35.344891', '2026-01-29 16:19:40.862648', '2026-01-29 16:19:35.344897'),
(140, 'nUy89ZP3ee64T6T5FHTOrwqfdTkt4Q70v0vuNC40JUaN4C+9cxdTDy4Z3/Y9q43H4QebpcyNkEQyQI0PHSNTaQ==', 1, '2026-02-05 16:19:40.862825', '2026-01-29 16:19:55.106798', '2026-01-29 16:19:40.862828'),
(141, '+I0CQ0IFtlBzPMdfLfK0R7clLlzClrL/ApdSuhyq8z/VXlxVsQ8qzOvwPV2MxBJsY2cVZvP6sQifd3hgUWf48A==', 1, '2026-02-05 16:19:55.107147', '2026-01-29 16:20:04.877421', '2026-01-29 16:19:55.107151'),
(142, 'F5TZ4efHfqJtQxvVePknisd24Beo8Y968BsG+OSk8XXY7+5txQR8vsQ4e4ftiJ+3Zcf9F1YAAh63zMdTM49akA==', 1, '2026-02-05 16:20:04.877626', '2026-01-29 16:20:08.155391', '2026-01-29 16:20:04.877631'),
(143, '1HlxLa1nCNbF1l6itqkWFDzA+ibcXO9cvXO2oNNR32EivLiPbiEn2plc4UhuWTrfUvnXDq/wLSHsOTLciiOVbQ==', 1, '2026-02-05 16:20:08.155508', '2026-01-29 16:20:11.757560', '2026-01-29 16:20:08.155511'),
(144, 'zX19O140NvMZykEfKcVs84tkdhjEAK0S+YGAVlQS6XxATWoo+WBwaWIPC5wLzCPE1ggPL13BUvbIU1eanoY/xQ==', 1, '2026-02-05 16:20:11.757715', '2026-01-29 16:20:15.805874', '2026-01-29 16:20:11.757718'),
(145, '+I6AfU+vDG8ck7B/M137RK1EPByjzfhqM4Chphbt64B3mGx93ZY/JXrbdnInhGgh0Ty41RHwK8m2BbBnOrsLWA==', 1, '2026-02-05 16:20:15.805986', '2026-01-29 16:20:44.484875', '2026-01-29 16:20:15.805988'),
(146, 'PEQ4RH6IGPiXjUPdbQmLN/BDijYTyJvdDRJo2yxfPDS8NHKwnK4KWcHF3VFSzYovvLU0Wrb9pst5k9RS5lepuA==', 1, '2026-02-05 16:20:44.485002', NULL, '2026-01-29 16:20:44.485004'),
(147, 'Krj1P8rYGiixsdyAoTsLUkunJ+hEvCs/QM8mUrKhi+sC7pUUmiBVC7w8UZVRbN5alf/zpy2rjoBCtLjTDMyicA==', 1, '2026-02-05 16:22:11.469758', '2026-01-29 16:22:23.087676', '2026-01-29 16:22:11.469760'),
(148, 'TYGOauzXG7spHEjZfuGnwe6vEvrtRcSerOAnv/cArVPxp5A93lyT3FIrh2Wtqhc93P/scXvUhQSfy3X4uBsQZg==', 1, '2026-02-05 16:22:23.087768', '2026-01-29 16:22:29.229530', '2026-01-29 16:22:23.087771'),
(149, '7XNDPKpwp1RGyJV4yiDgIwtUyVYY7Bxug0hz5BrET2PnNQp5csy5JU/g/fr698pnOBqo5cyx1rGc7d3fXaFygA==', 1, '2026-02-05 16:22:29.229626', '2026-01-29 16:22:35.615926', '2026-01-29 16:22:29.229628'),
(150, 'n4UIq39Xav5+Ai9BhuhgpHzjQgN1fXY9l/zN9y8QUoPFCbvHWCDQSwNHI8g63Vpo6iAcGtEa0rRUL40bQmcRGQ==', 1, '2026-02-05 16:22:35.616488', '2026-01-29 16:22:45.660729', '2026-01-29 16:22:35.616493'),
(151, 'VoAmbn7OwAaPzH1AGBIHCJwZBL9UmINwOQY/fLkdi6g9iIOiqh99R87TTzwZE2rpJ8AM1r28RwvypXIVR11LOg==', 1, '2026-02-05 16:22:45.660832', '2026-01-29 16:22:48.617585', '2026-01-29 16:22:45.660835'),
(152, 'bF5DnaXhuUbQVd4QCwkvfz6pEtdDztAAuo69DwYSXgI7/vyDAuI+rj/g1DpAvfdUmEmItf5odDwphhjS2lAF1A==', 1, '2026-02-05 16:22:48.617695', '2026-01-29 16:27:45.390677', '2026-01-29 16:22:48.617698'),
(153, 'si2VlnXuN2T83tHtu7eiULPtoNaegUmb/e4tOT1UMEygCbzxydt9H84aQCYCenauPAx3dSpHlPczruJVYrYqYA==', 1, '2026-02-05 16:27:45.390820', NULL, '2026-01-29 16:27:45.390824');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `Id` int(11) NOT NULL,
  `UserId` int(11) NOT NULL,
  `ProductId` int(11) NOT NULL,
  `Rating` int(11) NOT NULL,
  `Comment` varchar(1000) DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sizes`
--

CREATE TABLE `sizes` (
  `Id` int(11) NOT NULL,
  `Name` varchar(50) NOT NULL,
  `PriceMultiplier` decimal(5,2) NOT NULL DEFAULT 1.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sizes`
--

INSERT INTO `sizes` (`Id`, `Name`, `PriceMultiplier`) VALUES
(1, '5', 0.98),
(2, '6', 1.00),
(3, '7', 1.02),
(4, '8', 1.04),
(5, '9', 1.06),
(6, '10', 1.08),
(7, '11', 1.10);

-- --------------------------------------------------------

--
-- Table structure for table `stories`
--

CREATE TABLE `stories` (
  `Id` int(11) NOT NULL,
  `Title` varchar(200) NOT NULL,
  `Author` varchar(100) NOT NULL,
  `Description` varchar(1000) DEFAULT NULL,
  `ImageUrl` varchar(500) NOT NULL,
  `Category` varchar(50) DEFAULT NULL,
  `Views` int(11) NOT NULL DEFAULT 0,
  `Likes` int(11) NOT NULL DEFAULT 0,
  `IsFeatured` tinyint(1) NOT NULL DEFAULT 0,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stories`
--

INSERT INTO `stories` (`Id`, `Title`, `Author`, `Description`, `ImageUrl`, `Category`, `Views`, `Likes`, `IsFeatured`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'Royal Gold and Diamond Heritage', 'Yash Gems', 'Experience exquisite craftsmanship and timeless elegance in every piece.', 'https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-TanishqSharedLibrary/default/dw6a7b4efe/homepage/HeroBanner/fod-desktop-7-1-26.jpg', 'Banner', 0, 0, 1, '2026-01-29 20:15:50.000000', NULL),
(2, 'Signature Bridal Radiance', 'Yash Gems', 'Curated for grand celebrations and heirloom-worthy sets.', 'https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-TanishqSharedLibrary/default/dw458029d9/homepage/HeroBanner/tanishq-at-pcw-desktop-26.jpg', 'Banner', 0, 0, 1, '2026-01-29 20:15:50.000000', NULL),
(3, 'Timeless Gemstone Collection', 'Yash Gems', 'Discover refined insights from our gem experts.', 'https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-TanishqSharedLibrary/default/dw301aba3f/homepage/HeroBanner/sos-25-desktop.jpg', 'Banner', 0, 0, 1, '2026-01-29 20:15:50.000000', NULL),
(4, 'Modern Artisan Highlights', 'Yash Gems', 'Explore elegant pieces crafted with modern artistry.', 'https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-TanishqSharedLibrary/default/dw1fc6a80f/homepage/HeroBanner/radiance-in-rhythm-desktop.jpg', 'Banner', 0, 0, 1, '2026-01-29 20:15:50.000000', NULL),
(5, 'Radiant Sparkle Moments', 'Yash Gems', 'Celebrate brilliance with iconic designs.', 'https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-TanishqSharedLibrary/default/dw2f04db49/homepage/HeroBanner/wedding-gifting-desktop-vgreen.jpg', 'Banner', 0, 0, 1, '2026-01-29 20:15:50.000000', NULL),
(6, 'Radiant Sparkle Moments', 'Yash Gems', 'Celebrate brilliance with iconic designs.', 'https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-TanishqSharedLibrary/default/dw32e1f8d0/homepage/HeroBanner/floral-bloom-desktop.jpg', 'Banner', 0, 0, 1, '2026-01-29 20:15:50.000000', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `Id` int(11) NOT NULL,
  `Username` varchar(50) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `PasswordHash` longtext NOT NULL,
  `FullName` varchar(100) DEFAULT NULL,
  `Gender` varchar(10) DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT 1,
  `Role` int(11) NOT NULL DEFAULT 2,
  `AvatarUrl` varchar(500) DEFAULT NULL,
  `Address` varchar(500) DEFAULT NULL,
  `City` varchar(50) DEFAULT NULL,
  `State` varchar(50) DEFAULT NULL,
  `MobileNumber` varchar(20) DEFAULT NULL,
  `DateOfBirth` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`Id`, `Username`, `Email`, `PasswordHash`, `FullName`, `Gender`, `CreatedAt`, `UpdatedAt`, `IsActive`, `Role`, `AvatarUrl`, `Address`, `City`, `State`, `MobileNumber`, `DateOfBirth`) VALUES
(1, 'sonphan', 'son.pt.2336@aptechlearning.edu.vn', '$2a$11$1oufVigtmH2srOY6DexnU.jxTPq2dsWd2df9ZFUX710Cle/pi62Fa', 'Phan Son', 'Nam', '2026-01-29 14:46:02.817241', '2026-01-29 15:56:25.111534', 1, 2, '/uploads/avatars/avatar_1_20260129155329.jpg', 'abc', 'Tỉnh Nghệ An', 'Phường Vinh Hưng', '01234567899', '1991-05-27 00:00:00.000000');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cartitems`
--
ALTER TABLE `cartitems`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `IX_CartItems_UserId_ProductId` (`UserId`,`ProductId`),
  ADD KEY `IX_CartItems_UserId` (`UserId`),
  ADD KEY `IX_CartItems_ProductId` (`ProductId`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_Categories_Name` (`Name`),
  ADD KEY `IX_Categories_ParentCategoryId` (`ParentCategoryId`);

--
-- Indexes for table `emailverificationtokens`
--
ALTER TABLE `emailverificationtokens`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `IX_EmailVerificationTokens_Token` (`Token`),
  ADD KEY `IX_EmailVerificationTokens_UserId` (`UserId`);

--
-- Indexes for table `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `IX_Favorites_UserId_ProductId` (`UserId`,`ProductId`),
  ADD KEY `IX_Favorites_UserId` (`UserId`),
  ADD KEY `IX_Favorites_ProductId` (`ProductId`);

--
-- Indexes for table `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `IX_Materials_Name` (`Name`);

--
-- Indexes for table `metalcolors`
--
ALTER TABLE `metalcolors`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `IX_MetalColors_Name` (`Name`);

--
-- Indexes for table `orderitems`
--
ALTER TABLE `orderitems`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `IX_OrderItems_OrderId_ProductId` (`OrderId`,`ProductId`),
  ADD KEY `IX_OrderItems_OrderId` (`OrderId`),
  ADD KEY `IX_OrderItems_ProductId` (`ProductId`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_Orders_UserId` (`UserId`),
  ADD KEY `IX_Orders_Status` (`Status`);

--
-- Indexes for table `passwordresettokens`
--
ALTER TABLE `passwordresettokens`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `IX_PasswordResetTokens_Token` (`Token`),
  ADD KEY `IX_PasswordResetTokens_UserId` (`UserId`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_Payments_OrderId` (`OrderId`),
  ADD KEY `IX_Payments_UserId` (`UserId`),
  ADD KEY `IX_Payments_Status` (`Status`),
  ADD KEY `IX_Payments_Reference` (`Reference`);

--
-- Indexes for table `productimages`
--
ALTER TABLE `productimages`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_ProductImages_ProductId` (`ProductId`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_Products_IsFeatured` (`IsFeatured`),
  ADD KEY `IX_Products_IsFeatured_CreatedAt` (`IsFeatured`,`CreatedAt`),
  ADD KEY `IX_Products_CategoryId` (`CategoryId`),
  ADD KEY `IX_Products_MaterialId` (`MaterialId`),
  ADD KEY `IX_Products_MetalColorId` (`MetalColorId`),
  ADD KEY `IX_Products_CategoryId_CreatedAt` (`CategoryId`,`CreatedAt`),
  ADD KEY `IX_Products_StyleCode` (`StyleCode`),
  ADD KEY `IX_Products_CreatedAt` (`CreatedAt`),
  ADD KEY `IX_Products_Views_Likes` (`Views`,`Likes`);

--
-- Indexes for table `productsizes`
--
ALTER TABLE `productsizes`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `IX_ProductSizes_ProductId_SizeId` (`ProductId`,`SizeId`),
  ADD KEY `IX_ProductSizes_ProductId` (`ProductId`),
  ADD KEY `IX_ProductSizes_SizeId` (`SizeId`);

--
-- Indexes for table `refreshtokens`
--
ALTER TABLE `refreshtokens`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `IX_RefreshTokens_Token` (`Token`),
  ADD KEY `IX_RefreshTokens_UserId` (`UserId`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `IX_Reviews_UserId_ProductId` (`UserId`,`ProductId`),
  ADD KEY `IX_Reviews_ProductId` (`ProductId`),
  ADD KEY `IX_Reviews_UserId` (`UserId`);

--
-- Indexes for table `sizes`
--
ALTER TABLE `sizes`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `IX_Sizes_Name` (`Name`);

--
-- Indexes for table `stories`
--
ALTER TABLE `stories`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_Stories_IsFeatured` (`IsFeatured`),
  ADD KEY `IX_Stories_Category` (`Category`),
  ADD KEY `IX_Stories_CreatedAt` (`CreatedAt`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `IX_Users_Username` (`Username`),
  ADD UNIQUE KEY `IX_Users_Email` (`Email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cartitems`
--
ALTER TABLE `cartitems`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `emailverificationtokens`
--
ALTER TABLE `emailverificationtokens`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `materials`
--
ALTER TABLE `materials`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `metalcolors`
--
ALTER TABLE `metalcolors`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `orderitems`
--
ALTER TABLE `orderitems`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `passwordresettokens`
--
ALTER TABLE `passwordresettokens`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `productimages`
--
ALTER TABLE `productimages`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `productsizes`
--
ALTER TABLE `productsizes`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `refreshtokens`
--
ALTER TABLE `refreshtokens`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=154;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sizes`
--
ALTER TABLE `sizes`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `stories`
--
ALTER TABLE `stories`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cartitems`
--
ALTER TABLE `cartitems`
  ADD CONSTRAINT `cartitems_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cartitems_ibfk_2` FOREIGN KEY (`ProductId`) REFERENCES `products` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`ParentCategoryId`) REFERENCES `categories` (`Id`) ON DELETE SET NULL;

--
-- Constraints for table `emailverificationtokens`
--
ALTER TABLE `emailverificationtokens`
  ADD CONSTRAINT `emailverificationtokens_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`ProductId`) REFERENCES `products` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `orderitems`
--
ALTER TABLE `orderitems`
  ADD CONSTRAINT `orderitems_ibfk_1` FOREIGN KEY (`OrderId`) REFERENCES `orders` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orderitems_ibfk_2` FOREIGN KEY (`ProductId`) REFERENCES `products` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `passwordresettokens`
--
ALTER TABLE `passwordresettokens`
  ADD CONSTRAINT `passwordresettokens_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`OrderId`) REFERENCES `orders` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `productimages`
--
ALTER TABLE `productimages`
  ADD CONSTRAINT `productimages_ibfk_1` FOREIGN KEY (`ProductId`) REFERENCES `products` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`CategoryId`) REFERENCES `categories` (`Id`) ON DELETE SET NULL,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`MaterialId`) REFERENCES `materials` (`Id`) ON DELETE SET NULL,
  ADD CONSTRAINT `products_ibfk_3` FOREIGN KEY (`MetalColorId`) REFERENCES `metalcolors` (`Id`) ON DELETE SET NULL;

--
-- Constraints for table `productsizes`
--
ALTER TABLE `productsizes`
  ADD CONSTRAINT `productsizes_ibfk_1` FOREIGN KEY (`ProductId`) REFERENCES `products` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `productsizes_ibfk_2` FOREIGN KEY (`SizeId`) REFERENCES `sizes` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `refreshtokens`
--
ALTER TABLE `refreshtokens`
  ADD CONSTRAINT `refreshtokens_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`ProductId`) REFERENCES `products` (`Id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
