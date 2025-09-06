-- MySQL dump 10.13  Distrib 9.4.0, for macos15.4 (arm64)
--
-- Host: localhost    Database: custom_ecommerce
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `materials`
--

DROP TABLE IF EXISTS `materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_bahan` varchar(255) NOT NULL,
  `deskripsi` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materials`
--

LOCK TABLES `materials` WRITE;
/*!40000 ALTER TABLE `materials` DISABLE KEYS */;
INSERT INTO `materials` VALUES (1,'Stainless Steel 304','Material premium tahan karat','2025-09-06 00:26:49'),(2,'Keramik Premium','Keramik berkualitas tinggi','2025-09-06 00:26:49'),(3,'Kulit Sintetis','Bahan cover notebook berkualitas','2025-09-06 00:26:49'),(4,'Plastik Food Grade','Plastik aman untuk makanan','2025-09-06 00:26:49');
/*!40000 ALTER TABLE `materials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_logs`
--

DROP TABLE IF EXISTS `notification_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `notification_id` int NOT NULL,
  `delivery_method` enum('email','sms','whatsapp') NOT NULL,
  `delivery_status` enum('sent','delivered','failed','bounced') NOT NULL,
  `provider_response` text,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `notification_id` (`notification_id`),
  KEY `idx_delivery_status` (`delivery_status`),
  CONSTRAINT `notification_logs_ibfk_1` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_logs`
--

LOCK TABLES `notification_logs` WRITE;
/*!40000 ALTER TABLE `notification_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `type` enum('order_status','payment','shipping','general') DEFAULT 'order_status',
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `recipient_email` varchar(255) NOT NULL,
  `recipient_phone` varchar(50) DEFAULT NULL,
  `status` enum('pending','sent','failed') DEFAULT 'pending',
  `sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_details`
--

DROP TABLE IF EXISTS `order_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `material_id` int NOT NULL,
  `qty` int NOT NULL,
  `harga_per_pcs` decimal(10,2) NOT NULL,
  `packaging_id` int DEFAULT NULL,
  `upgrade_id` int DEFAULT NULL,
  `teks_logo` text,
  `logo_custom_url` varchar(500) DEFAULT NULL,
  `desain_packaging_id` int DEFAULT NULL,
  `desain_custom_url` varchar(500) DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  KEY `material_id` (`material_id`),
  KEY `packaging_id` (`packaging_id`),
  KEY `upgrade_id` (`upgrade_id`),
  KEY `desain_packaging_id` (`desain_packaging_id`),
  CONSTRAINT `order_details_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `order_details_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `order_details_ibfk_3` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`),
  CONSTRAINT `order_details_ibfk_4` FOREIGN KEY (`packaging_id`) REFERENCES `packaging` (`id`),
  CONSTRAINT `order_details_ibfk_5` FOREIGN KEY (`upgrade_id`) REFERENCES `upgrades` (`id`),
  CONSTRAINT `order_details_ibfk_6` FOREIGN KEY (`desain_packaging_id`) REFERENCES `packaging_designs` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_details`
--

LOCK TABLES `order_details` WRITE;
/*!40000 ALTER TABLE `order_details` DISABLE KEYS */;
INSERT INTO `order_details` VALUES (1,2,1,1,5,75000.00,NULL,NULL,NULL,NULL,NULL,NULL,375000.00,'2025-09-06 00:58:26'),(2,3,1,1,5,75000.00,1,NULL,'Test Logo Text',NULL,NULL,NULL,3750005000.00,'2025-09-06 01:02:36'),(3,4,1,1,5,75000.00,1,NULL,'Test Logo Text',NULL,NULL,NULL,3750005000.00,'2025-09-06 01:03:28'),(4,5,1,1,5,75000.00,1,NULL,NULL,NULL,NULL,NULL,3750005000.00,'2025-09-06 01:06:01'),(5,6,1,1,5,75000.00,1,NULL,NULL,NULL,NULL,NULL,3750005000.00,'2025-09-06 05:21:43'),(6,7,1,1,5,75000.00,1,NULL,NULL,NULL,NULL,NULL,3750005000.00,'2025-09-06 05:22:48'),(7,8,2,2,50,40000.00,NULL,1,NULL,NULL,NULL,NULL,2750000.00,'2025-09-06 05:41:16');
/*!40000 ALTER TABLE `order_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) NOT NULL,
  `nama_pemesan` varchar(255) NOT NULL,
  `kontak_pemesan` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `alamat_kirim` text NOT NULL,
  `harga_total` decimal(12,2) NOT NULL,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'ORD-TEST-001','Test Customer','081234567890','test@example.com','Jl. Test No. 123',100000.00,'pending','2025-09-06 00:27:23','2025-09-06 00:27:23'),(2,'ORD-1757120305999-ID3HN','Test Customer','081234567890','test@example.com','Jl. Test No. 123',375000.00,'pending','2025-09-06 00:58:26','2025-09-06 00:58:26'),(3,'ORD-1757120556719-ZP73R','Test Customer Enhanced','081234567890','enhanced-test@example.com','Jl. Test Enhanced No. 123, Jakarta',3750005000.00,'pending','2025-09-06 01:02:36','2025-09-06 01:02:36'),(4,'ORD-1757120607946-8N6WL','Test Customer Fixed','081234567890','fixed-test@example.com','Jl. Test Fixed No. 123, Jakarta',3750005000.00,'pending','2025-09-06 01:03:28','2025-09-06 01:03:28'),(5,'ORD-1757120761795-KX6YQ','Debug Test','081234567890','debug@example.com','Jl. Debug No. 123',3750005000.00,'pending','2025-09-06 01:06:01','2025-09-06 01:06:01'),(6,'ORD-1757136102970-L8OH3','Final Test','081234567890','final@example.com','Jl. Final Test No. 123',3750005000.00,'pending','2025-09-06 05:21:43','2025-09-06 05:21:43'),(7,'ORD-1757136168783-WBC2U','Clean Test','081234567890','clean@example.com','Jl. Clean Test No. 123',3750005000.00,'pending','2025-09-06 05:22:48','2025-09-06 05:22:48'),(8,'ORD-1757137276426-RMTEW','dicky maulana','08111','ddd@gmail.com','jalan laswi kp cipeuteuy',2750000.00,'pending','2025-09-06 05:41:16','2025-09-06 05:41:16');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `packaging`
--

DROP TABLE IF EXISTS `packaging`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `packaging` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_packaging` varchar(255) NOT NULL,
  `deskripsi` text,
  `harga_packaging` decimal(10,2) NOT NULL,
  `gambar_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `packaging`
--

LOCK TABLES `packaging` WRITE;
/*!40000 ALTER TABLE `packaging` DISABLE KEYS */;
INSERT INTO `packaging` VALUES (1,'Thanks Card','Kartu ucapan terima kasih',5000.00,'/images/thankscard.jpg','2025-09-06 00:26:49'),(2,'Paper Sleeve','Kemasan kertas premium',8000.00,'/images/sleeve.jpg','2025-09-06 00:26:49'),(3,'Gift Box','Box hadiah mewah',15000.00,'/images/giftbox.jpg','2025-09-06 00:26:49');
/*!40000 ALTER TABLE `packaging` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `packaging_designs`
--

DROP TABLE IF EXISTS `packaging_designs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `packaging_designs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `packaging_id` int NOT NULL,
  `nama_desain` varchar(255) NOT NULL,
  `preview_url` varchar(500) DEFAULT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `packaging_id` (`packaging_id`),
  CONSTRAINT `packaging_designs_ibfk_1` FOREIGN KEY (`packaging_id`) REFERENCES `packaging` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `packaging_designs`
--

LOCK TABLES `packaging_designs` WRITE;
/*!40000 ALTER TABLE `packaging_designs` DISABLE KEYS */;
INSERT INTO `packaging_designs` VALUES (1,1,'Minimalist Design','/designs/thanks-minimal.jpg','/designs/thanks-minimal.pdf','2025-09-06 00:26:49'),(2,1,'Floral Pattern','/designs/thanks-floral.jpg','/designs/thanks-floral.pdf','2025-09-06 00:26:49'),(3,2,'Corporate Style','/designs/sleeve-corporate.jpg','/designs/sleeve-corporate.pdf','2025-09-06 00:26:49'),(4,3,'Luxury Gold','/designs/box-luxury.jpg','/designs/box-luxury.pdf','2025-09-06 00:26:49');
/*!40000 ALTER TABLE `packaging_designs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pricing`
--

DROP TABLE IF EXISTS `pricing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pricing` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `material_id` int NOT NULL,
  `min_qty` int NOT NULL,
  `max_qty` int NOT NULL,
  `harga_per_pcs` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `material_id` (`material_id`),
  KEY `idx_product_material` (`product_id`,`material_id`),
  KEY `idx_qty_range` (`min_qty`,`max_qty`),
  CONSTRAINT `pricing_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `pricing_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pricing`
--

LOCK TABLES `pricing` WRITE;
/*!40000 ALTER TABLE `pricing` DISABLE KEYS */;
INSERT INTO `pricing` VALUES (1,1,1,1,50,75000.00,'2025-09-06 00:26:49'),(2,1,1,51,100,70000.00,'2025-09-06 00:26:49'),(3,1,1,101,500,65000.00,'2025-09-06 00:26:49'),(4,2,2,1,25,45000.00,'2025-09-06 00:26:49'),(5,2,2,26,100,40000.00,'2025-09-06 00:26:49'),(6,3,3,1,50,85000.00,'2025-09-06 00:26:49'),(7,3,3,51,200,80000.00,'2025-09-06 00:26:49');
/*!40000 ALTER TABLE `pricing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_produk` varchar(255) NOT NULL,
  `deskripsi` text,
  `gambar_url` varchar(500) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Tumbler Custom','Tumbler stainless steel dengan customization','/images/tumbler.jpg','active','2025-09-06 00:26:49'),(2,'Mug Keramik','Mug keramik premium untuk hadiah','/images/mug.jpg','active','2025-09-06 00:26:49'),(3,'Notebook Custom','Notebook dengan cover custom','/images/notebook.jpg','active','2025-09-06 00:26:49');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `upgrades`
--

DROP TABLE IF EXISTS `upgrades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `upgrades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_upgrade` varchar(255) NOT NULL,
  `deskripsi` text,
  `harga_upgrade` decimal(10,2) NOT NULL,
  `produk_terkait` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `upgrades`
--

LOCK TABLES `upgrades` WRITE;
/*!40000 ALTER TABLE `upgrades` DISABLE KEYS */;
INSERT INTO `upgrades` VALUES (1,'Laser Engraving','Ukiran laser precision',15000.00,'[1, 2, 3]','2025-09-06 00:26:49'),(2,'Emboss','Timbul pada permukaan',10000.00,'[1, 3]','2025-09-06 00:26:49'),(3,'Sablon','Printing dengan tinta khusus',8000.00,'[1, 2]','2025-09-06 00:26:49');
/*!40000 ALTER TABLE `upgrades` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-06 12:44:12
