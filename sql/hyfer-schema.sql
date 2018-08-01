# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: eu-cdbr-west-02.cleardb.net (MySQL 5.6.38-log)
# Database: heroku_6c6605327430ce5
# Generation Time: 2018-08-01 20:24:09 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table events
# ------------------------------------------------------------

DROP TABLE IF EXISTS `events`;

CREATE TABLE `events` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `event_name` varchar(32) COLLATE utf8mb4_bin NOT NULL DEFAULT '',
  `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `username` varchar(32) COLLATE utf8mb4_bin NOT NULL DEFAULT '',
  `notes` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;



# Dump of table group_students
# ------------------------------------------------------------

DROP TABLE IF EXISTS `group_students`;

CREATE TABLE `group_students` (
  `group_id` int(8) NOT NULL,
  `user_id` int(8) NOT NULL,
  PRIMARY KEY (`user_id`,`group_id`),
  KEY `fk_group_id` (`group_id`),
  CONSTRAINT `fk_group_id` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;



# Dump of table groups
# ------------------------------------------------------------

DROP TABLE IF EXISTS `groups`;

CREATE TABLE `groups` (
  `id` int(8) NOT NULL AUTO_INCREMENT,
  `group_name` varchar(50) COLLATE utf8mb4_bin NOT NULL DEFAULT '',
  `starting_date` date NOT NULL,
  `archived` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `group_name` (`group_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;



# Dump of table homework_assignments
# ------------------------------------------------------------

DROP TABLE IF EXISTS `homework_assignments`;

CREATE TABLE `homework_assignments` (
  `id` int(8) NOT NULL AUTO_INCREMENT,
  `group_id` int(8) NOT NULL,
  `module_id` int(8) NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_bin NOT NULL DEFAULT '',
  `assignment_link` varchar(255) COLLATE utf8mb4_bin NOT NULL DEFAULT '',
  `deadline` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;



# Dump of table homework_reviews
# ------------------------------------------------------------

DROP TABLE IF EXISTS `homework_reviews`;

CREATE TABLE `homework_reviews` (
  `id` int(8) NOT NULL AUTO_INCREMENT,
  `submission_id` int(8) NOT NULL,
  `reviewer_id` int(8) NOT NULL,
  `comments` mediumtext COLLATE utf8mb4_bin NOT NULL,
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;



# Dump of table homework_submissions
# ------------------------------------------------------------

DROP TABLE IF EXISTS `homework_submissions`;

CREATE TABLE `homework_submissions` (
  `id` int(8) NOT NULL AUTO_INCREMENT,
  `assignment_id` int(8) NOT NULL,
  `submitter_id` int(8) NOT NULL,
  `github_link` varchar(255) COLLATE utf8mb4_bin NOT NULL DEFAULT '',
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewer` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;



# Dump of table modules
# ------------------------------------------------------------

DROP TABLE IF EXISTS `modules`;

CREATE TABLE `modules` (
  `id` int(8) NOT NULL AUTO_INCREMENT,
  `module_name` varchar(50) COLLATE utf8mb4_bin NOT NULL DEFAULT '',
  `added_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `default_duration` int(2) NOT NULL DEFAULT '3',
  `sort_order` int(4) DEFAULT NULL,
  `git_repo` varchar(50) COLLATE utf8mb4_bin DEFAULT NULL,
  `color` varchar(8) COLLATE utf8mb4_bin DEFAULT NULL,
  `optional` tinyint(1) DEFAULT '0',
  `has_homework` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;



# Dump of table running_module_teachers
# ------------------------------------------------------------

DROP TABLE IF EXISTS `running_module_teachers`;

CREATE TABLE `running_module_teachers` (
  `running_module_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`running_module_id`,`user_id`),
  KEY `fk_user_id_2` (`user_id`),
  CONSTRAINT `fk_running_module_id` FOREIGN KEY (`running_module_id`) REFERENCES `running_modules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_id_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;



# Dump of table running_modules
# ------------------------------------------------------------

DROP TABLE IF EXISTS `running_modules`;

CREATE TABLE `running_modules` (
  `id` int(8) NOT NULL AUTO_INCREMENT,
  `module_id` int(8) NOT NULL,
  `group_id` int(8) NOT NULL,
  `duration` int(8) DEFAULT '3',
  `position` int(8) DEFAULT NULL,
  `notes` mediumtext COLLATE utf8mb4_bin,
  PRIMARY KEY (`id`),
  KEY `fk_module` (`module_id`),
  KEY `fk_group_name` (`group_id`),
  CONSTRAINT `fk_group_name` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_module` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;



# Dump of table students_history
# ------------------------------------------------------------

DROP TABLE IF EXISTS `students_history`;

CREATE TABLE `students_history` (
  `running_module_id` int(8) NOT NULL,
  `user_id` int(8) NOT NULL,
  `week_num` int(8) NOT NULL DEFAULT '0',
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `attendance` tinyint(1) NOT NULL DEFAULT '0',
  `homework` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`user_id`,`running_module_id`,`week_num`),
  KEY `idx_running_module_id` (`running_module_id`),
  CONSTRAINT `sh_fk_running_module_id` FOREIGN KEY (`running_module_id`) REFERENCES `running_modules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sh_fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;



# Dump of table users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int(8) NOT NULL AUTO_INCREMENT,
  `username` varchar(32) COLLATE utf8mb4_bin DEFAULT '',
  `full_name` varchar(145) COLLATE utf8mb4_bin DEFAULT NULL,
  `role` varchar(32) COLLATE utf8mb4_bin DEFAULT NULL,
  `register_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `linkedin_username` varchar(32) COLLATE utf8mb4_bin DEFAULT NULL,
  `email` varchar(32) COLLATE utf8mb4_bin DEFAULT NULL,
  `notes` mediumtext COLLATE utf8mb4_bin,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
