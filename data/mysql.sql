DROP TABLE IF EXISTS `sessions` ;
CREATE TABLE `sessions` (
     `id` VARCHAR(40) NOT NULL,
     `last_activity` INT(10) NOT NULL,
     `data` TEXT NOT NULL,
     PRIMARY KEY (`id`)
);
DROP TABLE IF EXISTS `user` ;
CREATE TABLE `user` (
     `uid` int(10) NOT NULL AUTO_INCREMENT,
     `weibo_uid` INT(10) NOT NULL,
     `token` TEXT NOT NULL,
     `weibo_name` VARCHAR(50) NOT NULL,
     `email` VARCHAR(50) NOT NULL,
     `name` VARCHAR(50) NOT NULL,
     PRIMARY KEY (`uid`)
);
DROP TABLE IF EXISTS `game_record` ;
CREATE TABLE `game_record` (
	`name` VARCHAR(50) NOT NULL,
	`time` timestamp DEFAULT CURRENT_TIMESTAMP,
	`distance` varchar(20) NOT NULL
);
