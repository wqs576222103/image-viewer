/*
 Navicat Premium Dump SQL

 Source Server         : 123456
 Source Server Type    : MySQL
 Source Server Version : 80044 (8.0.44)
 Source Host           : localhost:3306
 Source Schema         : imageviewer

 Target Server Type    : MySQL
 Target Server Version : 80044 (8.0.44)
 File Encoding         : 65001

 Date: 25/01/2026 13:04:55
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for categories
-- ----------------------------
CREATE TABLE IF NOT EXISTS `categories`  (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `createTime` datetime NOT NULL,
  `updateTime` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of categories
-- ----------------------------
INSERT INTO `categories` VALUES ('ffdccd01-6c44-4785-bc18-906d07920b18', '婚纱照', '01', '2026-01-25 04:54:47', '2026-01-25 04:54:47');

-- ----------------------------
-- Table structure for images
-- ----------------------------
CREATE TABLE IF NOT EXISTS `images`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `remark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of images
-- ----------------------------
INSERT INTO `images` VALUES ('022a2d6c-4e02-49b1-a4ad-3b0d54fc0d7d', 'DSC08102', '/uploads/614b9cc6-d239-4e72-8d67-af2e8b413f13.jpg', '01', '', '2026-01-25 13:03:07', '2026-01-25 13:03:07');
INSERT INTO `images` VALUES ('0568a079-863d-4566-ae1f-e358c316d6ea', 'DSC08111', '/uploads/0cce0c9b-e588-4705-83c6-844103d5eca3.jpg', '01', '', '2026-01-25 13:03:07', '2026-01-25 13:03:07');
INSERT INTO `images` VALUES ('0bbbe946-3700-4cca-b29e-1f6226a58590', 'DSC07750 拷贝2', '/uploads/84aa2d9b-3524-4f1e-81c8-72e5dc91bebd.jpg', '01', '', '2026-01-25 13:02:17', '2026-01-25 13:02:17');
INSERT INTO `images` VALUES ('0e40886c-41f0-4105-96e9-b9780ba57373', 'DSC07901_(2)', '/uploads/8fd5fee1-9d6e-497f-b05a-f4f658183d33.jpg', '01', '', '2026-01-25 13:02:49', '2026-01-25 13:02:49');
INSERT INTO `images` VALUES ('1924c625-4559-452d-a461-ed5ed1dd1e85', 'DSC07792', '/uploads/ab8d911b-b768-4385-a404-8aac08f6ffbe.jpg', '01', '', '2026-01-25 13:02:48', '2026-01-25 13:02:48');
INSERT INTO `images` VALUES ('1a418fe2-642b-4d69-87c0-81b544f2d22d', 'DSC08032', '/uploads/85d7430f-1714-4059-b47d-bdfd5ff3c633.jpg', '01', '', '2026-01-25 13:02:50', '2026-01-25 13:02:50');
INSERT INTO `images` VALUES ('1aeda9c7-8de1-4981-a6cd-2fd65d8a3f06', 'DSC07915_(3)', '/uploads/c9e0818a-30b1-4135-ad7c-6cfdfefe66c4.jpg', '01', '', '2026-01-25 13:02:49', '2026-01-25 13:02:49');
INSERT INTO `images` VALUES ('2a3a8c04-06ff-4795-94a6-2155938f84f6', 'DSC08077', '/uploads/4797f789-f941-489b-b708-f114333ec092.jpg', '01', '', '2026-01-25 13:03:07', '2026-01-25 13:03:07');
INSERT INTO `images` VALUES ('34097553-6e63-4172-b06b-212a11e4224c', 'DSC08023_(2)', '/uploads/9bd20663-427a-435b-8064-1d47e3e68f03.jpg', '01', '', '2026-01-25 13:02:50', '2026-01-25 13:02:50');
INSERT INTO `images` VALUES ('35f94d22-f642-4a98-b840-ffeaf0f5b638', 'DSC07780', '/uploads/5d834281-6da1-4bc2-a3ff-621ed82a1b57.jpg', '01', '', '2026-01-25 13:02:17', '2026-01-25 13:02:17');
INSERT INTO `images` VALUES ('3f498760-0ade-4512-948d-c56272ca38d9', 'DSC07783', '/uploads/d9ac4b86-dad0-46d8-b728-200a97346e40.jpg', '01', '', '2026-01-25 13:02:17', '2026-01-25 13:02:17');
INSERT INTO `images` VALUES ('43dd9b91-1ee3-4f5c-ab33-730dfb963eb2', 'DSC08068', '/uploads/ada37ca7-2c78-4b59-a181-af791c6078dc.jpg', '01', '', '2026-01-25 13:02:50', '2026-01-25 13:02:50');
INSERT INTO `images` VALUES ('62955053-c9c5-4c58-84e2-13a2d706582a', 'DSC07702_(2)', '/uploads/79c33717-2971-40e8-9743-28d865470e61.jpg', '01', '', '2026-01-25 13:02:16', '2026-01-25 13:02:16');
INSERT INTO `images` VALUES ('6f5e059e-a6f6-40e7-8698-aa518ca4de45', 'DSC07671_(2)', '/uploads/4243af6f-916c-4df7-97fd-eececbd8f282.jpg', '01', '', '2026-01-25 13:02:16', '2026-01-25 13:02:16');
INSERT INTO `images` VALUES ('753d587c-9696-4fcb-857d-e693e2378123', 'DSC07986', '/uploads/f32caedd-efa0-424f-aacc-87f82c282afa.jpg', '01', '', '2026-01-25 13:02:50', '2026-01-25 13:02:50');
INSERT INTO `images` VALUES ('7cf3eafb-bd46-405d-b6e3-e93f1ff59adc', 'DSC08122', '/uploads/df8b350a-8633-4fea-a205-34b3c16192a9.jpg', '01', '', '2026-01-25 13:03:08', '2026-01-25 13:03:08');
INSERT INTO `images` VALUES ('92038f44-6b88-4da6-b480-3d76f167d7fc', 'DSC08099', '/uploads/b00f301a-a953-439b-96d9-5ffd63e30119.jpg', '01', '', '2026-01-25 13:03:07', '2026-01-25 13:03:07');
INSERT INTO `images` VALUES ('9a7f4b39-2087-40b4-865c-729f11e15ec6', 'DSC07830', '/uploads/72d4fb5d-701a-49ba-aa3b-86a94eb8a628.jpg', '01', '', '2026-01-25 13:02:49', '2026-01-25 13:02:49');
INSERT INTO `images` VALUES ('a463dd94-7862-48cd-ac0d-6689c06a93e1', 'DSC07598_(2)', '/uploads/372ffbd0-726d-4a20-b95b-240d81d60ec2.jpg', '01', '', '2026-01-25 13:02:15', '2026-01-25 13:02:15');
INSERT INTO `images` VALUES ('acf1852c-bf2b-4479-aa27-3758f5a19b34', 'DSC07868', '/uploads/8d637991-f3e5-4191-9235-9766ee25dbe3.jpg', '01', '', '2026-01-25 13:02:49', '2026-01-25 13:02:49');
INSERT INTO `images` VALUES ('be134acb-2851-4721-b4e6-dafe01565755', 'DSC07709', '/uploads/ad629114-6d36-4b70-a6ff-77de27a31db7.jpg', '01', '', '2026-01-25 13:02:16', '2026-01-25 13:02:16');
INSERT INTO `images` VALUES ('dfbfe90b-1e45-4b5b-8a07-4de75a628566', 'DSC07713', '/uploads/7ee82b02-927e-4f28-8d5a-5c184b8148eb.jpg', '01', '', '2026-01-25 13:02:16', '2026-01-25 13:02:16');
INSERT INTO `images` VALUES ('e0a0b0b0-487a-4adf-921c-22fa6baeda99', 'DSC08113', '/uploads/661f5079-b5eb-4c26-b32f-0c27527bdae1.jpg', '01', '', '2026-01-25 13:03:08', '2026-01-25 13:03:08');
INSERT INTO `images` VALUES ('e3848b3e-3b39-44ff-9597-884507158d0c', 'DSC08126_(3)', '/uploads/edb3f8e5-fc3b-4922-94c7-7ad5e089dc81.jpg', '01', '', '2026-01-25 13:03:20', '2026-01-25 13:03:20');
INSERT INTO `images` VALUES ('e408da50-fa6d-4c92-bb99-9f914a4fa8fd', 'DSC07665_(2)', '/uploads/c389c4b8-16f2-4e0e-988d-bb5177af454f.jpg', '01', '', '2026-01-25 13:02:16', '2026-01-25 13:02:16');
INSERT INTO `images` VALUES ('ecab7868-0baf-447e-894e-f93602b9e2d1', 'DSC08109', '/uploads/3aa29176-eaae-4ecd-a0ad-4b63ab4b65ba.jpg', '01', '', '2026-01-25 13:03:07', '2026-01-25 13:03:07');
INSERT INTO `images` VALUES ('f3627727-cfd5-41ff-b618-990740555fa0', 'DSC08072', '/uploads/e1144470-4177-40a9-b5a3-ee95e4cc41a3.jpg', '01', '', '2026-01-25 13:03:03', '2026-01-25 13:03:03');
INSERT INTO `images` VALUES ('f704cbc6-9e96-4782-b04b-6e7b721dec75', 'DSC08073', '/uploads/8b8ccaa0-3db1-4b56-a0e0-f188e03112f8.jpg', '01', '', '2026-01-25 13:03:06', '2026-01-25 13:03:06');

-- ----------------------------
-- Table structure for users
-- ----------------------------
CREATE TABLE  IF NOT EXISTS `users`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `salt` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `createTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin', '456789asd', NULL, '2026-01-25 11:59:03', '2026-01-25 11:59:03');

SET FOREIGN_KEY_CHECKS = 1;
