-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Mar 05, 2026 at 12:56 PM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

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
-- Table structure for table `banners`
--

CREATE TABLE `banners` (
  `Id` int NOT NULL,
  `Title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ImageUrl` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Link` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `SortOrder` int NOT NULL DEFAULT '0',
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `banners`
--

INSERT INTO `banners` (`Id`, `Title`, `ImageUrl`, `Link`, `SortOrder`, `IsActive`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'eid-ramadan-gifts', 'https://www.catbirdnyc.com/media/wysiwyg/20250908_TiniestCharmsHP_Desktop_1_.jpg', NULL, 1, 1, '2026-03-05 12:37:13.016634', '2026-03-05 12:38:03.772368'),
(2, 'stoneandstrand', 'https://www.stoneandstrand.com/cdn/shop/files/Untitled_design_c9942fe7-8485-4f58-87be-bf8535f2b0a6_1920x.png?v=1770318851', NULL, 2, 1, '2026-03-05 12:46:12.065635', '2026-03-05 12:46:20.766039'),
(3, 'stoneandstrand2', 'https://www.stoneandstrand.com/cdn/shop/files/Website_Banner_1211_5f418004-2e3c-4df5-b6f3-c36c6ef09351_1920x.png?v=1767893912', NULL, 4, 1, '2026-03-05 12:46:47.617596', '2026-03-05 12:49:40.219407'),
(4, 'dam.jamesallen', 'https://dam.jamesallen.com/images/public/15206/DIAMOND-RING-A-DREAM-RING-COME-TRUE.webp', NULL, 3, 1, '2026-03-05 12:49:15.074461', '2026-03-05 12:49:24.745150'),
(5, 'debeers', 'https://media.debeers.com/i/debeers/v2-feb-2026-hompage-hero-banner-4000x2250/High%20Jewellery%20Talisman%20Diamond%20Collection%20On%20Model?fmt=auto&fmt.avif.qlt=40&fmt.webp.qlt=40&fmt.jp2.qlt=30&fmt.jpeg.qlt=50&$db-nd3-16-9-1920-poi$', NULL, 5, 1, '2026-03-05 12:50:31.366017', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `cartitems`
--

CREATE TABLE `cartitems` (
  `Id` int NOT NULL,
  `UserId` int NOT NULL,
  `ProductId` int NOT NULL,
  `Quantity` int NOT NULL DEFAULT '1',
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `Id` int NOT NULL,
  `Name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ParentCategoryId` int DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`Id`, `Name`, `Description`, `ParentCategoryId`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'Rings', 'Engagement, wedding, and statement rings', NULL, '2026-03-05 19:12:25.000000', NULL),
(2, 'Earrings', 'Studs, hoops, and chandelier designs', NULL, '2026-03-05 19:12:25.000000', NULL),
(3, 'Necklaces', 'Gold and diamond necklaces for every occasion', NULL, '2026-03-05 19:12:25.000000', NULL),
(4, 'Bracelets', 'Timeless gold and diamond bracelets', NULL, '2026-03-05 19:12:25.000000', NULL),
(5, 'Bangles', 'Elegant bangles with modern craftsmanship', NULL, '2026-03-05 19:12:25.000000', NULL),
(6, 'Gold Rings', 'Gold ring designs and collections', 1, '2026-03-05 19:12:25.000000', NULL),
(7, 'Diamond Rings', 'Diamond ring designs and collections', 1, '2026-03-05 19:12:25.000000', NULL),
(8, 'Gold Earrings', 'Gold earring designs and collections', 2, '2026-03-05 19:12:25.000000', NULL),
(9, 'Diamond Earrings', 'Diamond earring designs and collections', 2, '2026-03-05 19:12:25.000000', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `Id` int NOT NULL,
  `Name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `Subject` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Message` varchar(5000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `IsResolved` tinyint(1) NOT NULL DEFAULT '0',
  `AdminResponse` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `emailverificationtokens`
--

CREATE TABLE `emailverificationtokens` (
  `Id` int NOT NULL,
  `Token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `UserId` int NOT NULL,
  `ExpiresAt` datetime(6) NOT NULL,
  `IsUsed` tinyint(1) NOT NULL DEFAULT '0',
  `CreatedAt` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `emailverificationtokens`
--

INSERT INTO `emailverificationtokens` (`Id`, `Token`, `UserId`, `ExpiresAt`, `IsUsed`, `CreatedAt`) VALUES
(1, 'PBKdpZ8fo+zXbuM2iYOymArTvu8uLUB50PPADcL5GH2+wKToqE3NO53OV1PPskbd6keCmBCRvISqb88LPDl0nA==', 11, '2026-03-05 12:23:40.135804', 1, '2026-03-05 12:22:40.135858');

-- --------------------------------------------------------

--
-- Table structure for table `favorites`
--

CREATE TABLE `favorites` (
  `Id` int NOT NULL,
  `UserId` int NOT NULL,
  `ProductId` int NOT NULL,
  `CreatedAt` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `materials`
--

CREATE TABLE `materials` (
  `Id` int NOT NULL,
  `Name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `PriceMultiplier` decimal(5,2) NOT NULL DEFAULT '1.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `materials`
--

INSERT INTO `materials` (`Id`, `Name`, `PriceMultiplier`) VALUES
(1, '10K', '0.90'),
(2, '14K', '1.00'),
(3, '18K', '1.10'),
(4, '22K', '1.20');

-- --------------------------------------------------------

--
-- Table structure for table `metalcolors`
--

CREATE TABLE `metalcolors` (
  `Id` int NOT NULL,
  `Name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `HexCode` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PriceMultiplier` decimal(5,2) NOT NULL DEFAULT '1.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `metalcolors`
--

INSERT INTO `metalcolors` (`Id`, `Name`, `HexCode`, `PriceMultiplier`) VALUES
(1, 'Yellow Gold', '#d9b37a', '1.00'),
(2, 'Rose Gold', '#e5b3a6', '1.02'),
(3, 'White Gold', '#e7e7e7', '1.01');

-- --------------------------------------------------------

--
-- Table structure for table `orderitems`
--

CREATE TABLE `orderitems` (
  `Id` int NOT NULL,
  `OrderId` int NOT NULL,
  `ProductId` int NOT NULL,
  `Quantity` int NOT NULL DEFAULT '1',
  `UnitPrice` decimal(18,2) NOT NULL DEFAULT '0.00',
  `TotalPrice` decimal(18,2) NOT NULL DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `Id` int NOT NULL,
  `UserId` int NOT NULL,
  `Status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `Subtotal` decimal(18,2) NOT NULL DEFAULT '0.00',
  `Total` decimal(18,2) NOT NULL DEFAULT '0.00',
  `ShippingAddress` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PaymentMethod` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `passwordresettokens`
--

CREATE TABLE `passwordresettokens` (
  `Id` int NOT NULL,
  `Token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `UserId` int NOT NULL,
  `ExpiresAt` datetime(6) NOT NULL,
  `IsUsed` tinyint(1) NOT NULL DEFAULT '0',
  `CreatedAt` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `Id` int NOT NULL,
  `OrderId` int NOT NULL,
  `UserId` int NOT NULL,
  `Amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `Currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'VND',
  `Status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `Provider` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Method` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Reference` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PaidAt` datetime(6) DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `productimages`
--

CREATE TABLE `productimages` (
  `Id` int NOT NULL,
  `ProductId` int NOT NULL,
  `ImageUrl` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `SortOrder` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `productimages`
--

INSERT INTO `productimages` (`Id`, `ProductId`, `ImageUrl`, `SortOrder`) VALUES
(1, 1, 'https://69a603a6581800b707fb4ba3.imgix.net/Regal-Solitaire-Ring-866073.png', 1),
(2, 2, 'https://69a603a6581800b707fb4ba3.imgix.net/Imperial-Halo-Necklace-718647.png', 1),
(3, 3, 'https://69a603a6581800b707fb4ba3.imgix.net/Celestial-Drop-Earrings-261056.png', 1),
(4, 4, 'https://69a603a6581800b707fb4ba3.imgix.net/Royal-Charm-Bracelet-192271.png', 1),
(5, 5, 'https://69a603a6581800b707fb4ba3.imgix.net/Majestic-Heritage-Bangle-337414.png', 1),
(6, 6, 'https://69a603a6581800b707fb4ba3.imgix.net/Imperial-Halo-Necklace-436802.png', 1),
(7, 7, 'https://69a603a6581800b707fb4ba3.imgix.net/Bridal-Radiance-Set-344932/photo_2025-02-03_19-58-32-2_f016ae24-b088-46b0-b35a-1736a856174c.jpg', 1),
(8, 8, 'https://69a603a6581800b707fb4ba3.imgix.net/Heritage-Kundan-Necklace-231105.png', 1),
(9, 9, 'https://69a603a6581800b707fb4ba3.imgix.net/Diamond-Eternity-Band-465724.png', 1),
(10, 10, 'https://69a603a6581800b707fb4ba3.imgix.net/Vintage-Emerald-Pendant-262015.png', 1),
(11, 11, 'https://69a603a6581800b707fb4ba3.imgix.net/Royal-Sapphire-Earrings-1201.png', 1),
(12, 12, 'https://69a603a6581800b707fb4ba3.imgix.net/Infinity-Love-Bracelet-623843/bracelet-with-infinity-and-heart-silver.jpg', 1),
(13, 13, 'https://69a603a6581800b707fb4ba3.imgix.net/Golden-Lotus-Bangle/Lotus-Design-Openable-Bracelet-Bangle-01-scaled.jpg', 1),
(14, 14, 'https://69a603a6581800b707fb4ba3.imgix.net/Celestial-Star-Necklace-876683.png', 1),
(15, 15, 'https://69a603a6581800b707fb4ba3.imgix.net/Princess-Cut-Diamond-Ring-707618.png', 1),
(16, 16, 'https://69a603a6581800b707fb4ba3.imgix.net/Minimalist-Gold-Studs-449145.png', 1),
(17, 17, 'https://69a603a6581800b707fb4ba3.imgix.net/Luxury-Diamond-Engagement-Ring-304665.png', 1),
(18, 18, 'https://69a603a6581800b707fb4ba3.imgix.net/Elegant-Pearl-Necklace-491068.png', 1),
(19, 19, 'https://69a603a6581800b707fb4ba3.imgix.net/Classic-Gold-Hoop-Earrings-722676.png', 1),
(20, 20, 'https://69a603a6581800b707fb4ba3.imgix.net/Signature-Charm-Bracelet-723761.png', 1),
(21, 21, 'https://69a603a6581800b707fb4ba3.imgix.net/Majestic-Pearl-Ring-653474.png', 1),
(22, 22, 'https://69a603a6581800b707fb4ba3.imgix.net/Diamond-Ivy-Earrings-529810.png', 1),
(23, 23, 'https://69a603a6581800b707fb4ba3.imgix.net/Enchanted-Leaf-Bracelet/bracelet-enchanted-garden-foliage-royal-white-gold-and-diamonds-9-carat__8002718_1-z.jpg', 1),
(24, 24, 'https://69a603a6581800b707fb4ba3.imgix.net/Vintage-Heritage-Bangle-912722.png', 1),
(25, 25, 'https://69a603a6581800b707fb4ba3.imgix.net/Royal-Crest-Necklace/s-l400.jpg', 1),
(32, 1, 'https://69a603a6581800b707fb4ba3.imgix.net/Regal-Solitaire-Ring-on-finger-863690.png', 2),
(33, 2, 'https://69a603a6581800b707fb4ba3.imgix.net/Imperial-Halo-Necklace%7CNecklace%7CImperial-Halo-Necklace-on-woman-neck,-luxury-jewelry-photography,-22K-gold,-Ddamas-brand,-ultra-realistic,-soft-natural-lighting,-high-fashion-magazine-style,-8k-resolution-272959.png', 2),
(34, 3, 'https://69a603a6581800b707fb4ba3.imgix.net/Celestial-Drop-Earrings%7CEarrings%7CCelestial-Drop-Earrings-on-woman-ear,-luxury-jewelry-photography,-18K-gold,-Caratlane-brand,-ultra-realistic,-soft-natural-lighting,-high-fashion-magazine-style,-8k-resolution-966656.png', 2),
(35, 4, 'https://69a603a6581800b707fb4ba3.imgix.net/Royal-Charm-Bracelet%7CBracelet%7CRoyal-Charm-Bracelet-on-woman-wrist,-luxury-jewelry-photography,-18K-gold,-Asmi-brand,-ultra-realistic,-soft-natural-lighting,-high-fashion-magazine-style,-8k-resolution-443326.png', 2),
(36, 5, 'https://69a603a6581800b707fb4ba3.imgix.net/Majestic-Heritage-Bangle%7CBangle%7CMajestic-Heritage-Bangle-on-woman-wrist,-luxury-jewelry-photography,-22K-gold,-Heritage-brand,-ultra-realistic,-soft-natural-lighting,-high-fashion-magazine-style,-8k-resolution-77821.png', 2),
(37, 6, 'https://69a603a6581800b707fb4ba3.imgix.net/Crown-Pendant-Set%7CPendant%7CCrown-Pendant-Set-on-woman-neck,-luxury-jewelry-photography,-18K-gold,-Ddamas-brand,-ultra-realistic,-soft-natural-lighting,-high-fashion-magazine-style,-8k-resolution-55058.png', 2),
(38, 7, 'https://69a603a6581800b707fb4ba3.imgix.net/Bridal-Radiance-Set%7CBridal-Set%7CBridal-Radiance-Set-on-bride-wearing-full-jewelry-set,-luxury-jewelry-photography,-22K-gold,-Asmi-brand,-ultra-realistic,-soft-natural-lighting,-high-fashion-magazine-style,-8k-resolution-953735.png', 2),
(39, 8, 'https://69a603a6581800b707fb4ba3.imgix.net/Heritage-Kundan-Necklace%7CNecklace%7CHeritage-Kundan-Necklace-on-woman-neck,-luxury-jewelry-photography,-22K-gold,-Heritage-brand,-ultra-realistic,-soft-natural-lighting,-high-fashion-magazine-style,-8k-resolution-79040.png', 2),
(40, 9, 'https://69a603a6581800b707fb4ba3.imgix.net/Diamond-Eternity-Band%7CRing%7CDiamond-Eternity-Band-on-woman-finger,-luxury-jewelry-photography,-18K-gold,-Asmi-brand,-ultra-realistic,-soft-natural-lighting,-high-fashion-magazine-style,-8k-resolution-537727.png', 2),
(41, 10, 'https://69a603a6581800b707fb4ba3.imgix.net/Vintage-Emerald-Pendant%7CPendant%7CVintage-Emerald-Pendant-on-woman-neck,-luxury-jewelry-photography,-22K-gold,-Heritage-brand,-ultra-realistic,-soft-natural-lighting,-high-fashion-magazine-style,-8k-resolution-808419.png', 2),
(42, 11, 'https://69a603a6581800b707fb4ba3.imgix.net/Royal-Sapphire-Earrings%7CEarrings%7CRoyal-Sapphire-Earrings-on-woman-ear,-luxury-jewelry-photography,-18K-gold,-Ddamas-brand,-ultra-realistic,-soft-natural-lighting,-high-fashion-magazine-style,-8k-resolution-650436.png', 2),
(43, 12, 'https://69a603a6581800b707fb4ba3.imgix.net/Infinity-Love-Bracelet%7CBracelet%7CInfinity-Love-Bracelet-on-woman-wrist,-luxury-jewelry-photography,-18K-gold,-Caratlane-brand,-ultra-realistic,-soft-natural-lighting,-high-fashion-magazine-style,-8k-resolution-885488.png', 2),
(44, 13, 'https://69a603a6581800b707fb4ba3.imgix.net/Golden-Lotus-Bangle%7CBangle%7CGolden-Lotus-Bangle-on-woman-wrist,-luxury-jewelry-photography,-22K-gold,-Heritage-brand,-ultra-realistic,-soft-natural-lighting,-high-fashion-magazine-style,-8k-resolution-944950.png', 2),
(45, 14, 'https://69a603a6581800b707fb4ba3.imgix.net/Celestial-Star-Necklace%7CNecklace%7CCelestial-Star-Necklace-on-woman-neck,-luxury-jewelry-photography,-18K-gold,-Asmi-brand,-ultra-realistic,-soft-natural-lighting,-high-fashion-magazine-style,-8k-resolution-312132.png', 2),
(46, 15, 'https://69a603a6581800b707fb4ba3.imgix.net/Princess-Cut-Diamond-Ring%7CRing%7CPrincess-Cut-Diamond-Ring-on-woman-finger,-luxury-jewelry-photography,-22K-gold,-Ddamas-brand,-ultra-realistic,-soft-natural-lighting,-high-fashion-magazine-style,-8k-resolution-103643.png', 2),
(47, 16, 'https://69a603a6581800b707fb4ba3.imgix.net/Minimalist-Gold-Studs%7CEarrings%7CMinimalist-Gold-Studs-on-woman-ear,-luxury-jewelry-photography,-18K-gold,-Caratlane-brand,-ultra-realistic,-soft-natural-lighting,-high-fashion-magazine-style,-8k-resolution-362574.png', 2),
(48, 17, 'https://69a603a6581800b707fb4ba3.imgix.net/Luxury-Diamond-Engagement/61Vzr6pX5IS._AC_UF350,350_QL80_.jpg', 2),
(49, 18, 'https://69a603a6581800b707fb4ba3.imgix.net/Elegant-Pearl-Necklace%7CNecklace%7CElegant-Pearl-Necklace-on-woman-neck,-luxury-jewelry-photography,-22K-gold,-Heritage-brand,-ultra-realistic,-soft-natural-lighting,-high-fashion-magazine-style,-8k-resolution-437075.png', 2),
(50, 19, 'https://69a603a6581800b707fb4ba3.imgix.net/Classic-Gold-Hoop-Earrings%7CEarrings%7CClassic-Gold-Hoop-Earrings-on-woman-ear,-luxury-jewelry-photography,-18K-gold,-Caratlane-brand,-ultra-realistic,-soft-natural-lighting,-high-fashion-magazine-style,-8k-resolution-954620.png', 2),
(51, 20, 'https://69a603a6581800b707fb4ba3.imgix.net/Signature-Charm-Bracelet%7CBracelet%7CSignature-Charm-Bracelet-on-woman-wrist,-luxury-jewelry-photography,-18K-gold,-Ddamas-brand,-ultra-realistic,-soft-natural-lighting,-high-fashion-magazine-style,-8k-resolution-81750.png', 2),
(52, 21, 'https://69a603a6581800b707fb4ba3.imgix.net/Majestic-Pearl-Ring%7CRing%7CMajestic-Pearl-Ring-on-woman-finger,-luxury-jewelry-photography,-18K-gold,-Asmi-brand,-ultra-realistic,-soft-natural-lighting,-high-fashion-magazine-style,-8k-resolution-327863.png', 2),
(53, 22, 'https://69a603a6581800b707fb4ba3.imgix.net/Diamond-Ivy-Earrings%7CEarrings%7CDiamond-Ivy-Earrings-on-woman-ear,-luxury-jewelry-photography,-22K-gold,-Ddamas-brand,-ultra-realistic,-soft-natural-lighting,-high-fashion-magazine-style,-8k-resolution-339203.png', 2),
(54, 23, 'https://69a603a6581800b707fb4ba3.imgix.net/Enchanted-Leaf-Bracelet%7CBracelet%7CEnchanted-Leaf-Bracelet-on-woman-wrist,-luxury-jewelry-photography,-18K-gold,-Caratlane-brand,-ultra-realistic,-soft-natural-lighting,-high-fashion-magazine-style,-8k-resolution-473808.png', 2),
(55, 24, 'https://69a603a6581800b707fb4ba3.imgix.net/Vintage-Heritage-Bangle%7CBangle%7CVintage-Heritage-Bangle-on-woman-wrist,-luxury-jewelry-photography,-22K-gold,-Heritage-brand,-ultra-realistic,-soft-natural-lighting,-high-fashion-magazine-style,-8k-resolution-936798.png', 2),
(56, 25, 'https://69a603a6581800b707fb4ba3.imgix.net/Royal-Crest-Necklace%7CNecklace%7CRoyal-Crest-Necklace-on-woman-neck,-luxury-jewelry-photography,-18K-gold,-Asmi-brand,-ultra-realistic,-soft-natural-lighting,-high-fashion-magazine-style,-8k-resolution-948919.png', 2),
(63, 1, 'https://69a603a6581800b707fb4ba3.imgix.net/Regal-Solitaire-Ring%7CRegal-Solitaire-Ring-placed-on-luxury-marble-table,-elegant-jewelry-display,-soft-natural-lighting,-luxury-product-photography,-8k%7CRegal-Solitaire-Ring-in-luxury-jewelry-collection-showcase,-velvet-display-box,-premium-brand-advertisement,-cinematic-lighting,-8k-533796.png', 3),
(64, 2, 'https://69a603a6581800b707fb4ba3.imgix.net/Imperial-Halo-Necklace%7CImperial-Halo-Necklace-placed-on-luxury-marble-table,-elegant-jewelry-display,-soft-natural-lighting,-luxury-product-photography,-8k%7CImperial-Halo-Necklace-in-luxury-jewelry-collection-showcase,-velvet-display-box,-premium-brand-advertisement,-cinematic-lighting,-8k-210954.png', 3),
(65, 3, 'https://69a603a6581800b707fb4ba3.imgix.net/Celestial-Drop-Earrings%7CCelestial-Drop-Earrings-placed-on-luxury-marble-table,-elegant-jewelry-display,-soft-natural-lighting,-luxury-product-photography,-8k%7CCelestial-Drop-Earrings-in-luxury-jewelry-collection-showcase,-velvet-display-box,-premium-brand-advertisement,-cinematic-lighting,-8k-759806.png', 3),
(66, 4, 'https://69a603a6581800b707fb4ba3.imgix.net/Royal-Charm-Bracelet-192271.png?v=3', 3),
(67, 5, 'https://69a603a6581800b707fb4ba3.imgix.net/Majestic-Heritage-Bangle-337414.png?v=3', 3),
(68, 6, 'https://69a603a6581800b707fb4ba3.imgix.net/Crown-Pendant-Set%7CCrown-Pendant-Set-placed-on-luxury-marble-table,-elegant-jewelry-display,-soft-natural-lighting,-luxury-product-photography,-8k%7CCrown-Pendant-Set-in-luxury-jewelry-collection-showcase,-velvet-display-box,-premium-brand-advertisement,-cinematic-lighting,-8k-245388.png', 3),
(69, 7, 'https://69a603a6581800b707fb4ba3.imgix.net/Bridal-Radiance-Set%7CBridal-Radiance-Set-placed-on-luxury-marble-table,-elegant-jewelry-display,-soft-natural-lighting,-luxury-product-photography,-8k%7CBridal-Radiance-Set-in-luxury-jewelry-collection-showcase,-velvet-display-box,-premium-brand-advertisement,-cinematic-lighting,-8k-14196.png', 3),
(70, 8, 'https://69a603a6581800b707fb4ba3.imgix.net/Heritage-Kundan-Necklace-231105.png?v=3https://69a603a6581800b707fb4ba3.imgix.net/Heritage-Kundan-Necklace%7CHeritage-Kundan-Necklace-placed-on-luxury-marble-table,-elegant-jewelry-display,-soft-natural-lighting,-luxury-product-photography,-8k%7CHeritage-Kundan-Necklace-in-luxury-jewelry-collection-showcase,-velvet-display-box,-premium-brand-advertisement,-cinematic-lighting,-8k-386772.png', 3),
(71, 9, 'https://69a603a6581800b707fb4ba3.imgix.net/Diamond-Eternity-Band-465724.png?v=3https://69a603a6581800b707fb4ba3.imgix.net/Diamond-Eternity-Band%7CDiamond-Eternity-Band-placed-on-luxury-marble-table,-elegant-jewelry-display,-soft-natural-lighting,-luxury-product-photography,-8k%7CDiamond-Eternity-Band-in-luxury-jewelry-collection-showcase,-velvet-display-box,-premium-brand-advertisement,-cinematic-lighting,-8k-744007.png', 3),
(72, 10, 'https://69a603a6581800b707fb4ba3.imgix.net/Vintage-Emerald-Pendant%7CVintage-Emerald-Pendant-placed-on-luxury-marble-table,-elegant-jewelry-display,-soft-natural-lighting,-luxury-product-photography,-8k%7CVintage-Emerald-Pendant-in-luxury-jewelry-collection-showcase,-velvet-display-box,-premium-brand-advertisement,-cinematic-lighting,-8k-471382.png', 3);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `Id` int NOT NULL,
  `Name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `StyleCode` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ProductType` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Brand` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `GoldCarat` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MRP` decimal(18,2) NOT NULL DEFAULT '0.00',
  `OriginalPrice` decimal(18,2) NOT NULL DEFAULT '0.00',
  `ImageUrl` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Views` int NOT NULL DEFAULT '0',
  `Likes` int NOT NULL DEFAULT '0',
  `CategoryId` int DEFAULT NULL,
  `MaterialId` int DEFAULT NULL,
  `MetalColorId` int DEFAULT NULL,
  `IsFeatured` tinyint(1) NOT NULL DEFAULT '0',
  `IsBestSeller` tinyint(1) NOT NULL DEFAULT '0',
  `CreatedAt` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`Id`, `Name`, `StyleCode`, `ProductType`, `Brand`, `GoldCarat`, `MRP`, `OriginalPrice`, `ImageUrl`, `Views`, `Likes`, `CategoryId`, `MaterialId`, `MetalColorId`, `IsFeatured`, `IsBestSeller`, `CreatedAt`) VALUES
(1, 'Regal Solitaire Ring', 'RG-ASM-102', 'Ring', 'Asmi', '18K', '18500000.00', '21500000.00', 'https://69a603a6581800b707fb4ba3.imgix.net/Regal-Solitaire-Ring-866073.png', 15200, 1200, 7, 3, 3, 1, 0, '2026-02-23 16:30:37.000000'),
(2, 'Imperial Halo Necklace', 'NK-DDM-415', 'Necklace', 'Ddamas', '22K', '42500000.00', '48900000.00', 'https://69a603a6581800b707fb4ba3.imgix.net/Imperial-Halo-Necklace-718647.png', 9800, 756, NULL, 4, 1, 1, 0, '2026-02-23 16:30:37.000000'),
(3, 'Celestial Drop Earrings', 'ER-CT-308', 'Earrings', 'Caratlane', '18K', '11800000.00', '13600000.00', 'https://69a603a6581800b707fb4ba3.imgix.net/Celestial-Drop-Earrings-261056.png', 11200, 890, 9, 3, 2, 1, 0, '2026-02-23 16:30:37.000000'),
(4, 'Royal Charm Bracelet', 'BR-ASM-220', 'Bracelet', 'Asmi', '18K', '16500000.00', '18900000.00', 'https://69a603a6581800b707fb4ba3.imgix.net/Royal-Charm-Bracelet-192271.png', 8500, 634, NULL, 3, 1, 0, 0, '2026-02-23 16:30:37.000000'),
(5, 'Majestic Heritage Bangle', 'BG-HR-519', 'Bangle', 'Heritage', '22K', '35500000.00', '39900000.00', 'https://69a603a6581800b707fb4ba3.imgix.net/Majestic-Heritage-Bangle-337414.png', 13800, 1023, NULL, 4, 1, 1, 0, '2026-02-23 16:30:37.000000'),
(6, 'Crown Pendant Set', 'PD-DDM-314', 'Pendant', 'Ddamas', '18K', '14200000.00', '16500000.00', 'https://69a603a6581800b707fb4ba3.imgix.net/Imperial-Halo-Necklace-436802.png', 12400, 912, NULL, 3, 3, 0, 0, '2026-02-23 16:30:37.000000'),
(7, 'Bridal Radiance Set', 'BRD-ASM-777', 'Bridal Set', 'Asmi', '22K', '89500000.00', '97500000.00', 'https://69a603a6581800b707fb4ba3.imgix.net/Bridal-Radiance-Set-344932/photo_2025-02-03_19-58-32-2_f016ae24-b088-46b0-b35a-1736a856174c.jpg', 9800, 756, NULL, 4, 2, 1, 0, '2026-02-23 16:30:37.000000'),
(8, 'Heritage Kundan Necklace', 'HN-HR-642', 'Necklace', 'Heritage', '22K', '58500000.00', '64800000.00', 'https://69a603a6581800b707fb4ba3.imgix.net/Heritage-Kundan-Necklace-231105.png', 11500, 801, NULL, 4, 1, 0, 0, '2026-02-23 16:30:37.000000'),
(9, 'Diamond Eternity Band', 'RG-ASM-310', 'Ring', 'Asmi', '18K', '22500000.00', '25900000.00', 'https://69a603a6581800b707fb4ba3.imgix.net/Diamond-Eternity-Band-465724.png', 17600, 1345, 7, 3, 2, 1, 1, '2026-03-03 05:11:34.000000'),
(10, 'Vintage Emerald Pendant', 'PD-HR-418', 'Pendant', 'Heritage', '22K', '31500000.00', '34900000.00', 'https://69a603a6581800b707fb4ba3.imgix.net/Vintage-Emerald-Pendant-262015.png', 9400, 702, 3, 4, 1, 0, 0, '2026-03-03 05:11:34.000000'),
(11, 'Royal Sapphire Earrings', 'ER-DDM-512', 'Earrings', 'Ddamas', '18K', '19800000.00', '22500000.00', 'https://69a603a6581800b707fb4ba3.imgix.net/Royal-Sapphire-Earrings-1201.png', 12800, 965, 9, 3, 3, 1, 0, '2026-03-03 05:11:34.000000'),
(12, 'Infinity Love Bracelet', 'BR-CT-290', 'Bracelet', 'Caratlane', '18K', '14500000.00', '16900000.00', 'https://69a603a6581800b707fb4ba3.imgix.net/Infinity-Love-Bracelet-623843/bracelet-with-infinity-and-heart-silver.jpg', 8700, 643, 4, 3, 2, 0, 1, '2026-03-03 05:11:34.000000'),
(13, 'Golden Lotus Bangle', 'BG-HR-703', 'Bangle', 'Heritage', '22K', '46200000.00', '49800000.00', 'https://69a603a6581800b707fb4ba3.imgix.net/Golden-Lotus-Bangle/Lotus-Design-Openable-Bracelet-Bangle-01-scaled.jpg', 15400, 1112, 5, 4, 1, 1, 1, '2026-03-03 05:11:34.000000'),
(14, 'Celestial Star Necklace', 'NK-ASM-501', 'Necklace', 'Asmi', '18K', '28900000.00', '31500000.00', 'https://69a603a6581800b707fb4ba3.imgix.net/Celestial-Star-Necklace-876683.png', 9900, 721, 3, 3, 2, 0, 0, '2026-03-03 05:11:34.000000'),
(15, 'Princess Cut Diamond Ring', 'RG-DDM-610', 'Ring', 'Ddamas', '22K', '52500000.00', '56900000.00', 'https://69a603a6581800b707fb4ba3.imgix.net/Princess-Cut-Diamond-Ring-707618.png', 21202, 1684, 7, 4, 3, 1, 1, '2026-03-03 05:11:34.000000'),
(16, 'Minimalist Gold Studs', 'ER-CT-144', 'Earrings', 'Caratlane', '18K', '8900000.00', '10900000.00', 'https://69a603a6581800b707fb4ba3.imgix.net/Minimalist-Gold-Studs-449145.png', 18401, 1520, 8, 3, 1, 1, 1, '2026-03-03 05:11:34.000000'),
(17, 'Luxury Diamond Engagement Ring', 'RG-ASM-901', 'Ring', 'Asmi', '18K', '67500000.00', '72500000.00', 'https://69a603a6581800b707fb4ba3.imgix.net/Luxury-Diamond-Engagement-Ring-304665.png', 24502, 1890, 7, 3, 3, 1, 1, '2026-03-03 05:20:53.000000'),
(18, 'Elegant Pearl Necklace', 'NK-HR-332', 'Necklace', 'Heritage', '22K', '28500000.00', '31900000.00', 'https://69a603a6581800b707fb4ba3.imgix.net/Elegant-Pearl-Necklace-491068.png', 8800, 645, 3, 4, 1, 0, 0, '2026-03-03 05:20:53.000000'),
(19, 'Classic Gold Hoop Earrings', 'ER-CT-211', 'Earrings', 'Caratlane', '18K', '9500000.00', '11500000.00', 'https://69a603a6581800b707fb4ba3.imgix.net/Classic-Gold-Hoop-Earrings-722676.png', 16201, 1340, 8, 3, 2, 1, 1, '2026-03-03 05:20:53.000000'),
(20, 'Signature Charm Bracelet', 'BR-DDM-778', 'Bracelet', 'Ddamas', '18K', '17800000.00', '20500000.00', 'https://69a603a6581800b707fb4ba3.imgix.net/Signature-Charm-Bracelet-723761.png', 9200, 710, 4, 3, 1, 0, 0, '2026-03-03 05:20:53.000000'),
(21, 'Majestic Pearl Ring', 'RG-ASM-328', 'Ring', 'Asmi', '18K', '16500000.00', '19200000.00', 'https://69a603a6581800b707fb4ba3.imgix.net/Majestic-Pearl-Ring-653474.png', 11800, 840, 7, 3, 1, 1, 0, '2026-02-24 09:41:33.000000'),
(22, 'Diamond Ivy Earrings', 'ER-DDM-462', 'Earrings', 'Ddamas', '22K', '22500000.00', '25900000.00', 'https://69a603a6581800b707fb4ba3.imgix.net/Diamond-Ivy-Earrings-529810.png', 11000, 820, NULL, 4, 3, 0, 0, '2026-02-24 09:41:33.000000'),
(23, 'Enchanted Leaf Bracelet', 'BR-CT-590', 'Bracelet', 'Caratlane', '18K', '14800000.00', '17200000.00', 'https://69a603a6581800b707fb4ba3.imgix.net/Enchanted-Leaf-Bracelet/bracelet-enchanted-garden-foliage-royal-white-gold-and-diamonds-9-carat__8002718_1-z.jpg', 10200, 700, NULL, 3, 2, 0, 0, '2026-02-24 09:41:33.000000'),
(24, 'Vintage Heritage Bangle', 'BG-HR-620', 'Bangle', 'Heritage', '22K', '38200000.00', '42800000.00', 'https://69a603a6581800b707fb4ba3.imgix.net/Vintage-Heritage-Bangle-912722.png', 14500, 1120, NULL, 4, 1, 1, 0, '2026-02-24 09:41:33.000000'),
(25, 'Royal Crest Necklace', 'NK-ASM-711', 'Necklace', 'Asmi', '18K', '29500000.00', '33500000.00', 'https://69a603a6581800b707fb4ba3.imgix.net/Royal-Crest-Necklace/s-l400.jpg', 11500, 785, NULL, 3, 2, 1, 0, '2026-02-24 09:41:33.000000');

-- --------------------------------------------------------

--
-- Table structure for table `productsizes`
--

CREATE TABLE `productsizes` (
  `Id` int NOT NULL,
  `ProductId` int NOT NULL,
  `SizeId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `refreshtokens`
--

CREATE TABLE `refreshtokens` (
  `Id` int NOT NULL,
  `Token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `UserId` int NOT NULL,
  `ExpiresAt` datetime(6) NOT NULL,
  `RevokedAt` datetime(6) DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `refreshtokens`
--

INSERT INTO `refreshtokens` (`Id`, `Token`, `UserId`, `ExpiresAt`, `RevokedAt`, `CreatedAt`) VALUES
(1, 'njB6PWzvx2p3ejwT3wuEN7OfpU0Yv9A9j8kq3xFAu0V/aCCIWvD7Nese5NKUm2f3Xhu+2VtiKNV54UuzgX4E3w==', 11, '2026-03-12 12:23:33.038412', '2026-03-05 12:26:35.868795', '2026-03-05 12:23:33.038548'),
(2, '/O7/uYxgNYmXXLsC16acqGRQPyUbo3wLUN0hlTQr9j/BSEu3eSJYYWAYgdNDI00VfoWPqoe+qlBCXbxGpfK6Ow==', 11, '2026-03-12 12:26:35.887964', '2026-03-05 12:27:37.077863', '2026-03-05 12:26:35.888065'),
(3, 'hpr0orXeXUbwOi9D69fGGE+7ZG9sxLLz1+1KOf64Z84N7HSN+qhZiKGAs8/WiY7fUSQ0nUohTXcP+YRU4U10lQ==', 11, '2026-03-12 12:27:37.086418', '2026-03-05 12:29:55.458809', '2026-03-05 12:27:37.086534'),
(4, 'ISEQ34ZjuoYB5iNKdHXQIOiYMa2yXwQwMKiQPYNg50IsR/fw7XluLv3nA/7bw1Tf85RZZxYdbl4iowTxghVJLQ==', 11, '2026-03-12 12:29:55.475930', '2026-03-05 12:44:27.428148', '2026-03-05 12:29:55.476028'),
(5, '957ZFbnjOM1gerIOX7KQsdOOgXjwtox7tGoePHNiq+DqyYIUHvyh06uvvY5CyP9uZ10QPaJy6Q/z7zK6690ogw==', 11, '2026-03-12 12:44:27.450591', '2026-03-05 12:48:48.658317', '2026-03-05 12:44:27.450725'),
(6, 'sQ28UfcqFZGP70pQORTUMi/pXSdVJ09lQMCGwfKnYGsBJNmiSuZX3OS7eIQ1Qtm10X77gHx6/s++1xS0h221vg==', 11, '2026-03-12 12:48:48.676967', '2026-03-05 12:53:05.065285', '2026-03-05 12:48:48.677072'),
(7, '9OU/iV6gpmRK7LjluWuGBjjv9mpd4Fl/lQhoH3xuE5u1Vl3L1OPsZZ0b5boyjH7G5vy86kKEDDCOOPU69lNHCw==', 11, '2026-03-12 12:53:05.088820', '2026-03-05 12:55:12.965763', '2026-03-05 12:53:05.088963'),
(8, 'GzL3oERDlgsafM1ldeRFGonB5X9Rygas0Hw0nJajqSM6NIgMQPVuqLjdQbRNXqYNBzMg4IzRQePsS7B4+VoCuQ==', 11, '2026-03-12 12:55:12.966147', '2026-03-05 12:55:52.673428', '2026-03-05 12:55:12.966156'),
(9, '+BbICKWzkfYtMrS4XcutgedZqVZ3s7fWkH5jpDN/proOeQLfPWmMWsurcPnO/Cq0MSBmBolIHVC2xMmJbzhzQg==', 11, '2026-03-12 12:55:52.673653', '2026-03-05 12:56:10.762386', '2026-03-05 12:55:52.673658'),
(10, 'T/Zz6mlunZCrjqIDTWr3tIb0KbaKFSoVeaWRFy4MSZztnHnflcbP+3wuIQ03mC1H8QrUREhkHSI40P3Wn3y/Uw==', 11, '2026-03-12 12:56:10.762750', '2026-03-05 12:56:19.060107', '2026-03-05 12:56:10.762757'),
(11, '+8wHdpofaXdKt6a0XfzKU3St94U/T0TgZRN/0JsSHzTckNWoV3uvQVba3UAldKfek/Eqdym8m/hmJJR80zmiVg==', 11, '2026-03-12 12:56:19.060555', '2026-03-05 12:56:31.339421', '2026-03-05 12:56:19.060564'),
(12, 'gXEY0ljFhO58XbiTP0+TkiYOB+Ygk6L3NOsFYqPnBmblAhlDE6vRHwk743RmpkafU8kT4Bq0et0oy0S2Ik/zrA==', 11, '2026-03-12 12:56:31.340559', '2026-03-05 12:56:34.177865', '2026-03-05 12:56:31.340580'),
(13, '3FmUMEYFrAYpBzRelhHDt+cIsWru5tPrLpCrCv4i4bUbUeWM5K54ujfmsEr0wGLdWwR1tnwg7Un2KD7onMmlgg==', 11, '2026-03-12 12:56:34.178187', '2026-03-05 12:56:40.765859', '2026-03-05 12:56:34.178193'),
(14, '/fdoKe95puosoF32VmHvS8N27FOyzynFRnmT7tPuYMVUTBRUU3X24w9PUwiu0vLTmgowP9wok8oQg56tiWNY7g==', 11, '2026-03-12 12:56:40.766129', NULL, '2026-03-05 12:56:40.766134');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `Id` int NOT NULL,
  `UserId` int NOT NULL,
  `ProductId` int NOT NULL,
  `Rating` int NOT NULL,
  `Comment` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`Id`, `UserId`, `ProductId`, `Rating`, `Comment`, `CreatedAt`) VALUES
(1, 1, 9, 5, 'The craftsmanship is excellent, exactly as described.', '2026-03-03 12:10:00.000000'),
(2, 1, 3, 4, 'Looks beautiful when worn, good quality overall.', '2026-03-03 12:15:00.000000'),
(3, 2, 14, 5, 'Better than expected, carefully packaged.', '2026-03-03 12:20:00.000000'),
(4, 2, 7, 4, 'Elegant design, delivery was a bit slow.', '2026-03-03 12:22:00.000000'),
(5, 3, 1, 5, 'Worth every penny, will buy again.', '2026-03-03 12:25:00.000000'),
(6, 3, 8, 4, 'Good quality product, very detailed.', '2026-03-03 12:27:00.000000'),
(7, 4, 12, 5, 'The necklace shines beautifully and matches outfits well.', '2026-03-03 12:32:00.000000'),
(8, 4, 18, 4, 'Reasonable price and carefully packed.', '2026-03-03 12:35:00.000000'),
(9, 5, 5, 5, 'High-quality gold with elegant patterns.', '2026-03-03 12:40:00.000000'),
(10, 5, 16, 4, 'Great as a gift, the packaging is nice.', '2026-03-03 12:42:00.000000'),
(11, 6, 20, 5, 'Beautiful bracelet, shiny and sturdy.', '2026-03-03 12:45:00.000000'),
(12, 6, 11, 4, 'Comfortable to wear and matches the description.', '2026-03-03 12:47:00.000000'),
(13, 7, 4, 5, 'Very satisfied, elegant appearance.', '2026-03-03 12:50:00.000000'),
(14, 7, 10, 4, 'Good product, but the price is slightly high.', '2026-03-03 12:53:00.000000'),
(15, 8, 2, 5, 'Fast delivery and high-quality product.', '2026-03-03 12:56:00.000000'),
(16, 8, 13, 4, 'Nice bracelet, makes a great gift.', '2026-03-03 12:58:00.000000'),
(17, 9, 6, 5, 'Excellent, the diamond cut is beautiful.', '2026-03-03 13:02:00.000000'),
(18, 9, 15, 4, 'Satisfied, but the box could be better.', '2026-03-03 13:05:00.000000'),
(19, 10, 19, 5, 'Gorgeous, looks even more luxurious in person.', '2026-03-03 13:10:00.000000'),
(20, 10, 17, 4, 'Good quality but delivery was a bit slow.', '2026-03-03 13:12:00.000000'),
(21, 11, 19, 5, 'hello', '2026-03-05 12:55:54.507866');

-- --------------------------------------------------------

--
-- Table structure for table `sizes`
--

CREATE TABLE `sizes` (
  `Id` int NOT NULL,
  `Name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `PriceMultiplier` decimal(5,2) NOT NULL DEFAULT '1.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sizes`
--

INSERT INTO `sizes` (`Id`, `Name`, `PriceMultiplier`) VALUES
(1, '5', '0.98'),
(2, '6', '1.00'),
(3, '7', '1.02'),
(4, '8', '1.04'),
(5, '9', '1.06'),
(6, '10', '1.08'),
(7, '11', '1.10');

-- --------------------------------------------------------

--
-- Table structure for table `useraddresses`
--

CREATE TABLE `useraddresses` (
  `Id` int NOT NULL,
  `UserId` int NOT NULL,
  `ReceiverName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `AddressLine` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `City` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `IsDefault` tinyint(1) NOT NULL DEFAULT '0',
  `CreatedAt` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `useraddresses`
--

INSERT INTO `useraddresses` (`Id`, `UserId`, `ReceiverName`, `Phone`, `AddressLine`, `City`, `IsDefault`, `CreatedAt`) VALUES
(1, 1, 'Phan Son', '0912345678', '12 Alley 45 Minh Khai Street', 'Hai Ba Trung, Hanoi', 1, '2026-03-03 20:12:16.000000'),
(2, 2, 'Phan Tuan Son', '0987654321', '23 Alley 88 Tay Son Street', 'Dong Da, Hanoi', 1, '2026-03-03 20:12:16.000000'),
(3, 3, 'Nguyen Minh Duc', '0911223344', '56 Cau Giay Street', 'Cau Giay, Hanoi', 1, '2026-03-03 20:12:16.000000'),
(4, 4, 'Nguyen Van An', '0901111222', '101 Lach Tray Street', 'Hai Phong City', 1, '2026-03-03 20:12:16.000000'),
(5, 5, 'Tran Thi Bich Ngoc', '0902222333', '45 Nguyen Thai Binh Street', 'District 1, Ho Chi Minh City', 1, '2026-03-03 20:12:16.000000'),
(6, 6, 'Pham Quang Chau', '0903333444', '78 Tran Phu Street', 'Da Nang City', 1, '2026-03-03 20:12:16.000000'),
(7, 7, 'Le Thi Diem My', '0904444555', '32 Vo Van Ngan Street', 'Thu Duc, Ho Chi Minh City', 1, '2026-03-03 20:12:16.000000'),
(8, 8, 'Hoang Van Dung', '0905555666', '14 30th April Street', 'Can Tho City', 1, '2026-03-03 20:12:16.000000'),
(9, 9, 'Dang Thi Phuong Anh', '0906666777', '89 Le Mao Street', 'Nghe An Province', 1, '2026-03-03 20:12:16.000000'),
(10, 10, 'Vu Truong Giang', '0907777888', '27 Bien Hoa Street', 'Ha Nam Province', 1, '2026-03-03 20:12:16.000000');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `Id` int NOT NULL,
  `Username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `PasswordHash` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `FullName` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `AvatarUrl` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Gender` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Address` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `DateOfBirth` date DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `Role` int NOT NULL DEFAULT '2'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`Id`, `Username`, `Email`, `PasswordHash`, `FullName`, `AvatarUrl`, `Gender`, `Address`, `Phone`, `DateOfBirth`, `CreatedAt`, `UpdatedAt`, `IsActive`, `Role`) VALUES
(1, 'sonphan', 'sonphan@gmail.com', '$2a$11$HJo72rwFWPkJvQ2gBuXTyOGPzqXHYdU2n.xjXO5mRhV2WhYpOoAse', 'Phan Son', '/uploads/avatars/avatar_1.png', 'Male', 'Hai Ba Trung District - Hanoi', '0912345678', '1991-01-25', '2026-03-03 20:11:53.000000', '2026-03-03 20:11:53.000000', 1, 2),
(2, 'son', 'sontuan@gmail.com', '$2a$11$HJo72rwFWPkJvQ2gBuXTyOGPzqXHYdU2n.xjXO5mRhV2WhYpOoAse', 'Phan Tuan Son', '/uploads/avatars/avatar_2.png', 'Male', 'Dong Da District - Hanoi', '0987654321', '1991-01-29', '2026-03-03 20:11:53.000000', '2026-03-03 20:11:53.000000', 1, 1),
(3, 'minhduc', 'minhduc.nguyen@gmail.com', '$2a$11$HJo72rwFWPkJvQ2gBuXTyOGPzqXHYdU2n.xjXO5mRhV2WhYpOoAse', 'Nguyen Minh Duc', '/uploads/avatars/avatar_3.png', 'Male', 'Cau Giay District - Hanoi', '0911223344', '1991-01-25', '2026-03-03 20:11:53.000000', '2026-03-03 20:11:53.000000', 1, 2),
(4, 'nguyenvana', 'nguyenvana92@gmail.com', '$2a$11$HJo72rwFWPkJvQ2gBuXTyOGPzqXHYdU2n.xjXO5mRhV2WhYpOoAse', 'Nguyen Van An', '/uploads/avatars/avatar_4.png', 'Male', 'Hai Phong City', '0901111222', '1992-02-14', '2026-03-03 20:11:53.000000', NULL, 1, 1),
(5, 'bichngoc', 'bichngoc.tran95@gmail.com', '$2a$11$HJo72rwFWPkJvQ2gBuXTyOGPzqXHYdU2n.xjXO5mRhV2WhYpOoAse', 'Tran Thi Bich Ngoc', '/uploads/avatars/avatar_5.png', 'Female', 'District 1 - Ho Chi Minh City', '0902222333', '1995-09-12', '2026-03-03 20:11:53.000000', NULL, 1, 2),
(6, 'quangchau', 'quangchau.pham90@gmail.com', '$2a$11$HJo72rwFWPkJvQ2gBuXTyOGPzqXHYdU2n.xjXO5mRhV2WhYpOoAse', 'Pham Quang Chau', '/uploads/avatars/avatar_6.png', 'Male', 'Da Nang City', '0903333444', '1990-06-02', '2026-03-03 20:11:53.000000', NULL, 1, 2),
(7, 'diemmy', 'diemmy.le98@gmail.com', '$2a$11$HJo72rwFWPkJvQ2gBuXTyOGPzqXHYdU2n.xjXO5mRhV2WhYpOoAse', 'Le Thi Diem My', '/uploads/avatars/avatar_7.png', 'Female', 'Thu Duc City - Ho Chi Minh City', '0904444555', '1998-11-22', '2026-03-03 20:11:53.000000', NULL, 1, 1),
(8, 'dung', 'dung.hoang88@gmail.com', '$2a$11$HJo72rwFWPkJvQ2gBuXTyOGPzqXHYdU2n.xjXO5mRhV2WhYpOoAse', 'Hoang Van Dung', '/uploads/avatars/avatar_8.png', 'Male', 'Can Tho City', '0905555666', '1988-03-30', '2026-03-03 20:11:53.000000', NULL, 1, 2),
(9, 'phuonganh', 'phuonganh.dang96@gmail.com', '$2a$11$HJo72rwFWPkJvQ2gBuXTyOGPzqXHYdU2n.xjXO5mRhV2WhYpOoAse', 'Dang Thi Phuong Anh', '/uploads/avatars/avatar_9.png', 'Female', 'Nghe An Province', '0906666777', '1996-12-10', '2026-03-03 20:11:53.000000', NULL, 1, 2),
(10, 'truonggiang', 'truonggiang.vu87@gmail.com', '$2a$11$HJo72rwFWPkJvQ2gBuXTyOGPzqXHYdU2n.xjXO5mRhV2WhYpOoAse', 'Vu Truong Giang', '/uploads/avatars/avatar_10.png', 'Male', 'Ha Nam Province', '0907777888', '1987-07-19', '2026-03-03 20:11:53.000000', NULL, 1, 1),
(11, 'nguyenngocduc', 'duc.nn.2378@aptechlearning.edu.vn', '$2a$11$7Ebqlk.Nb/rS9vFYdv/lK.S6jbMCNiNLn0H4B4fNUfGIFB60y/gzS', 'Nguyễn Ngọc Đức', NULL, NULL, NULL, NULL, NULL, '2026-03-05 12:22:39.968468', '2026-03-05 12:23:14.500657', 1, 2);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_Banners_IsActive` (`IsActive`),
  ADD KEY `IX_Banners_SortOrder` (`SortOrder`);

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
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_Contacts_Email` (`Email`),
  ADD KEY `IX_Contacts_IsResolved` (`IsResolved`),
  ADD KEY `IX_Contacts_CreatedAt` (`CreatedAt`);

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
-- Indexes for table `useraddresses`
--
ALTER TABLE `useraddresses`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_UserAddresses_UserId` (`UserId`);

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
-- AUTO_INCREMENT for table `banners`
--
ALTER TABLE `banners`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `cartitems`
--
ALTER TABLE `cartitems`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `emailverificationtokens`
--
ALTER TABLE `emailverificationtokens`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `materials`
--
ALTER TABLE `materials`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `metalcolors`
--
ALTER TABLE `metalcolors`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `orderitems`
--
ALTER TABLE `orderitems`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `passwordresettokens`
--
ALTER TABLE `passwordresettokens`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `productimages`
--
ALTER TABLE `productimages`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `productsizes`
--
ALTER TABLE `productsizes`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `refreshtokens`
--
ALTER TABLE `refreshtokens`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `sizes`
--
ALTER TABLE `sizes`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `useraddresses`
--
ALTER TABLE `useraddresses`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

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

--
-- Constraints for table `useraddresses`
--
ALTER TABLE `useraddresses`
  ADD CONSTRAINT `useraddresses_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
