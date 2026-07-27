ALTER TABLE `slides` ADD `content` text;
UPDATE `slides` SET `content` = '' WHERE `content` IS NULL;
ALTER TABLE `slides` MODIFY COLUMN `content` text NOT NULL;
