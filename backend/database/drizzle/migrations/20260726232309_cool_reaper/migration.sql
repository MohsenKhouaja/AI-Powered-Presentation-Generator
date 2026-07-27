CREATE TABLE `presentation_share_links` (
	`id` varchar(255) PRIMARY KEY DEFAULT (UUID()),
	`presentation_id` varchar(255) NOT NULL,
	`token_hash` varchar(64) NOT NULL,
	`expires_at` timestamp,
	`revoked_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `token_hash_unique` UNIQUE INDEX(`token_hash`),
	CONSTRAINT `presentation_share_links_presentation_unique` UNIQUE INDEX(`presentation_id`),
	CONSTRAINT `presentation_share_links_presentation_id_presentations_id_fkey` FOREIGN KEY (`presentation_id`) REFERENCES `presentations`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
RENAME TABLE `edit_access` TO `presentation_access_grants`;--> statement-breakpoint
ALTER TABLE `presentation_access_grants` RENAME INDEX `edit_access_user_id_presentation_id_unique` TO `presentation_access_grants_user_presentation_unique`;--> statement-breakpoint
ALTER TABLE `presentation_access_grants` ADD `permission` enum('viewer','editor') DEFAULT 'editor' NOT NULL;--> statement-breakpoint
ALTER TABLE `presentation_access_grants` ADD `created_at` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `presentation_access_grants` ADD `updated_at` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;
