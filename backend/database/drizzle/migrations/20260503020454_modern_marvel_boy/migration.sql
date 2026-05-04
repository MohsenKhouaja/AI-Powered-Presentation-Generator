CREATE TABLE `contexts` (
	`id` varchar(255) PRIMARY KEY,
	`prompt` text NOT NULL DEFAULT (''),
	`presentation_id` varchar(255),
	CONSTRAINT `contexts_presentation_id_unique` UNIQUE INDEX(`presentation_id`)
);
--> statement-breakpoint
CREATE TABLE `edit_access` (
	`id` varchar(255) PRIMARY KEY,
	`user_id` varchar(255) NOT NULL,
	`presentation_id` varchar(255) NOT NULL,
	`expires_at` timestamp,
	CONSTRAINT `edit_access_user_id_presentation_id_unique` UNIQUE INDEX(`user_id`,`presentation_id`)
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` varchar(255) PRIMARY KEY,
	`context_id` varchar(255) NOT NULL,
	`storage_key` text NOT NULL,
	`mime_type` text NOT NULL,
	`file_type` text NOT NULL,
	`size_bytes` bigint NOT NULL,
	`original_name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `presentations` (
	`id` varchar(255) PRIMARY KEY,
	`title` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now())
);
--> statement-breakpoint
CREATE TABLE `slides` (
	`id` varchar(255) PRIMARY KEY,
	`presentation_id` varchar(255) NOT NULL,
	`content` text NOT NULL DEFAULT (''),
	`slide_order` int NOT NULL,
	CONSTRAINT `slides_presentation_id_slide_order_unique` UNIQUE INDEX(`presentation_id`,`slide_order`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(255) PRIMARY KEY,
	`username` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	CONSTRAINT `username_unique` UNIQUE INDEX(`username`),
	CONSTRAINT `email_unique` UNIQUE INDEX(`email`)
);
--> statement-breakpoint
ALTER TABLE `contexts` ADD CONSTRAINT `contexts_presentation_id_presentations_id_fkey` FOREIGN KEY (`presentation_id`) REFERENCES `presentations`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `edit_access` ADD CONSTRAINT `edit_access_user_id_users_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `edit_access` ADD CONSTRAINT `edit_access_presentation_id_presentations_id_fkey` FOREIGN KEY (`presentation_id`) REFERENCES `presentations`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `files` ADD CONSTRAINT `files_context_id_contexts_id_fkey` FOREIGN KEY (`context_id`) REFERENCES `contexts`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `presentations` ADD CONSTRAINT `presentations_user_id_users_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `slides` ADD CONSTRAINT `slides_presentation_id_presentations_id_fkey` FOREIGN KEY (`presentation_id`) REFERENCES `presentations`(`id`) ON DELETE CASCADE;