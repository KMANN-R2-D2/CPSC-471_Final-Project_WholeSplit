CREATE DATABASE  IF NOT EXISTS `wholesplitdb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `wholesplitdb`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: wholesplitdb
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `administrators`
--

DROP TABLE IF EXISTS `administrators`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administrators` (
  `SSN` varchar(15) NOT NULL,
  `FName` varchar(50) DEFAULT NULL,
  `LName` varchar(50) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Password` varchar(255) NOT NULL,
  `Role` varchar(50) DEFAULT 'Admin',
  PRIMARY KEY (`SSN`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administrators`
--

LOCK TABLES `administrators` WRITE;
/*!40000 ALTER TABLE `administrators` DISABLE KEYS */;
INSERT INTO `administrators` VALUES ('111-222-333','Admin','User','admin@wholesplit.com','admin123','Admin');
/*!40000 ALTER TABLE `administrators` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favourites`
--

DROP TABLE IF EXISTS `favourites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favourites` (
  `UserID` int NOT NULL,
  `ProductID` int NOT NULL,
  `DateAdded` date DEFAULT NULL,
  PRIMARY KEY (`UserID`,`ProductID`),
  KEY `ProductID` (`ProductID`),
  CONSTRAINT `favourites_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`),
  CONSTRAINT `favourites_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `products` (`ProductID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favourites`
--

LOCK TABLES `favourites` WRITE;
/*!40000 ALTER TABLE `favourites` DISABLE KEYS */;
/*!40000 ALTER TABLE `favourites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locations` (
  `PostalCode` varchar(10) NOT NULL,
  `City` varchar(100) DEFAULT NULL,
  `Province` varchar(100) DEFAULT NULL,
  `Street` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`PostalCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES ('M5V 2H1','Toronto','ON','789 CN Tower Way'),('T2H 0K5','Calgary','AB','456 Real Ave'),('T3T 0E3','Calgary','AB','123 Fake St'),('V6B 1P1','Vancouver','BC','101 Ocean View Dr');
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `membershipholders`
--

DROP TABLE IF EXISTS `membershipholders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `membershipholders` (
  `MembershipID` varchar(50) NOT NULL,
  `UserID` int NOT NULL,
  `MembershipStore` varchar(100) DEFAULT NULL,
  `MembershipExpirationDate` date DEFAULT NULL,
  PRIMARY KEY (`MembershipID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `membershipholders_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `membershipholders`
--

LOCK TABLES `membershipholders` WRITE;
/*!40000 ALTER TABLE `membershipholders` DISABLE KEYS */;
INSERT INTO `membershipholders` VALUES ('MEMB001',1,'Costco Calgary North','2026-12-31'),('MEMB002',3,'Costco Calgary South','2026-06-30'),('MEMB003',5,'Costco Vancouver West','2026-09-15');
/*!40000 ALTER TABLE `membershipholders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `participates_in`
--

DROP TABLE IF EXISTS `participates_in`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `participates_in` (
  `UserID` int NOT NULL,
  `PostID` int NOT NULL,
  `QuantityRequested` int DEFAULT NULL,
  `CalculatedShareCost` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`UserID`,`PostID`),
  KEY `PostID` (`PostID`),
  CONSTRAINT `participates_in_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`),
  CONSTRAINT `participates_in_ibfk_2` FOREIGN KEY (`PostID`) REFERENCES `posts` (`PostID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `participates_in`
--

LOCK TABLES `participates_in` WRITE;
/*!40000 ALTER TABLE `participates_in` DISABLE KEYS */;
INSERT INTO `participates_in` VALUES (1,1,10,2.50),(2,1,5,1.25),(3,2,4,5.33),(4,3,5,3.33);
/*!40000 ALTER TABLE `participates_in` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `PostID` int NOT NULL AUTO_INCREMENT,
  `GroupID` int DEFAULT NULL,
  `ProductID` int DEFAULT NULL,
  `QuantityRequested` int DEFAULT NULL,
  `DatePosted` date DEFAULT NULL,
  `Status` varchar(30) DEFAULT 'Open',
  PRIMARY KEY (`PostID`),
  KEY `GroupID` (`GroupID`),
  KEY `ProductID` (`ProductID`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`GroupID`) REFERENCES `splitgroups` (`GroupID`),
  CONSTRAINT `posts_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `products` (`ProductID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (1,1,4,10,'2026-04-18','Member Joined'),(2,2,2,4,'2026-04-18','Member Joined'),(3,3,1,5,'2026-04-18','Member Required');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `ProductID` int NOT NULL,
  `ProductName` varchar(100) DEFAULT NULL,
  `Brand` varchar(100) DEFAULT NULL,
  `BulkSize` decimal(10,2) DEFAULT NULL,
  `BulkAmount` int DEFAULT NULL,
  PRIMARY KEY (`ProductID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Toilet Paper','Kirkland Signature',30.00,30),(2,'Paper Towels','Kirkland Signature',12.00,12),(3,'Laundry Detergent','Tide',5000.00,1),(4,'Bottled Water','Kirkland Signature',500.00,40),(5,'Organic Milk','Kirkland Signature',1000.00,3),(6,'Peanut Butter','Kirkland Signature',1000.00,2),(7,'Mixed Nuts','Kirkland Signature',1130.00,1),(8,'Olive Oil','Kirkland Signature',3000.00,2);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `splitgroups`
--

DROP TABLE IF EXISTS `splitgroups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `splitgroups` (
  `GroupID` int NOT NULL AUTO_INCREMENT,
  `StoreID` int DEFAULT NULL,
  `CreatorUserID` int DEFAULT NULL,
  `DateCreated` date DEFAULT NULL,
  `Status` varchar(30) DEFAULT 'Open',
  PRIMARY KEY (`GroupID`),
  KEY `StoreID` (`StoreID`),
  KEY `CreatorUserID` (`CreatorUserID`),
  CONSTRAINT `splitgroups_ibfk_1` FOREIGN KEY (`StoreID`) REFERENCES `stores` (`StoreID`),
  CONSTRAINT `splitgroups_ibfk_2` FOREIGN KEY (`CreatorUserID`) REFERENCES `users` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `splitgroups`
--

LOCK TABLES `splitgroups` WRITE;
/*!40000 ALTER TABLE `splitgroups` DISABLE KEYS */;
INSERT INTO `splitgroups` VALUES (1,1,1,'2026-04-18','Open'),(2,2,3,'2026-04-18','Open'),(3,1,2,'2026-04-18','Open');
/*!40000 ALTER TABLE `splitgroups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stocks`
--

DROP TABLE IF EXISTS `stocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stocks` (
  `StoreID` int NOT NULL,
  `ProductID` int NOT NULL,
  `Price` decimal(10,2) DEFAULT NULL,
  `LastUpdated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`StoreID`,`ProductID`),
  KEY `ProductID` (`ProductID`),
  CONSTRAINT `stocks_ibfk_1` FOREIGN KEY (`StoreID`) REFERENCES `stores` (`StoreID`),
  CONSTRAINT `stocks_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `products` (`ProductID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stocks`
--

LOCK TABLES `stocks` WRITE;
/*!40000 ALTER TABLE `stocks` DISABLE KEYS */;
INSERT INTO `stocks` VALUES (1,1,19.99,'2026-04-19 00:00:50'),(1,2,15.99,'2026-04-19 00:00:50'),(1,3,24.99,'2026-04-19 00:00:50'),(1,4,9.99,'2026-04-19 00:00:50'),(1,5,12.99,'2026-04-19 00:00:50'),(1,6,14.99,'2026-04-19 00:00:50'),(1,7,22.99,'2026-04-19 00:00:50'),(1,8,19.99,'2026-04-19 00:00:50'),(2,1,19.99,'2026-04-19 00:00:50'),(2,2,15.99,'2026-04-19 00:00:50'),(2,3,24.99,'2026-04-19 00:00:50'),(2,4,9.99,'2026-04-19 00:00:50'),(2,5,12.99,'2026-04-19 00:00:50'),(2,6,14.99,'2026-04-19 00:00:50'),(2,7,22.99,'2026-04-19 00:00:50'),(2,8,19.99,'2026-04-19 00:00:50'),(3,1,19.99,'2026-04-19 00:00:50'),(3,2,15.99,'2026-04-19 00:00:50'),(3,3,24.99,'2026-04-19 00:00:50'),(3,4,9.99,'2026-04-19 00:00:50'),(3,5,12.99,'2026-04-19 00:00:50'),(3,6,14.99,'2026-04-19 00:00:50'),(3,7,22.99,'2026-04-19 00:00:50'),(3,8,19.99,'2026-04-19 00:00:50'),(4,1,19.99,'2026-04-19 00:00:50'),(4,2,15.99,'2026-04-19 00:00:50'),(4,3,24.99,'2026-04-19 00:00:50'),(4,4,9.99,'2026-04-19 00:00:50'),(4,5,12.99,'2026-04-19 00:00:50'),(4,6,14.99,'2026-04-19 00:00:50'),(4,7,22.99,'2026-04-19 00:00:50'),(4,8,19.99,'2026-04-19 00:00:50');
/*!40000 ALTER TABLE `stocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stores`
--

DROP TABLE IF EXISTS `stores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stores` (
  `StoreID` int NOT NULL,
  `Name` varchar(100) DEFAULT NULL,
  `PostalCode` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`StoreID`),
  KEY `PostalCode` (`PostalCode`),
  CONSTRAINT `stores_ibfk_1` FOREIGN KEY (`PostalCode`) REFERENCES `locations` (`PostalCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stores`
--

LOCK TABLES `stores` WRITE;
/*!40000 ALTER TABLE `stores` DISABLE KEYS */;
INSERT INTO `stores` VALUES (1,'Costco Calgary North','T3T 0E3'),(2,'Costco Calgary South','T2H 0K5'),(3,'Costco Toronto East','M5V 2H1'),(4,'Costco Vancouver West','V6B 1P1');
/*!40000 ALTER TABLE `stores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `FName` varchar(50) DEFAULT NULL,
  `LName` varchar(50) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `PasswordHash` varchar(255) NOT NULL DEFAULT '',
  `PreferredPaymentMethod` varchar(50) DEFAULT NULL,
  `PreferredShoppingDay` varchar(20) DEFAULT NULL,
  `PreferredSplitLocation` varchar(255) DEFAULT NULL,
  `PostalCode` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`),
  KEY `PostalCode` (`PostalCode`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`PostalCode`) REFERENCES `locations` (`PostalCode`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Peter','Parker','peter@example.com','fd82f0e95c8034cfeacd4fb4d2853d50749364f1c98f780158aa3196fed7d0d7','Credit Card','Saturday',NULL,'T3T 0E3'),(2,'Mary','Jane','mj@example.com','6120ac744907caa62f236bd2695b50478c7fdf17fffb928ac84507ad330b2be8','Debit Card','Sunday',NULL,'T3T 0E3'),(3,'Bruce','Wayne','bruce@example.com','27ce79d3b1bd765583512a200dfca08a15d0e579a94c1c2a3f91b95eabb90ff1','Credit Card','Saturday',NULL,'T2H 0K5'),(4,'Clark','Kent','clark@example.com','fbca4e68cdaad261c2c4980041ccabe93d41406118b46d37023f8d804bca485b','Debit Card','Monday',NULL,'M5V 2H1'),(5,'Diana','Prince','diana@example.com','afc466a3368ecd5720833b670fa0d40e376d6c9dc6f61406e3ee496892f2f1e5','Credit Card','Friday',NULL,'V6B 1P1');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-18 21:52:39
