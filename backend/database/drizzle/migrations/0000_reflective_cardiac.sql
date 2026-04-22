CREATE TABLE `contexts` (
	`id` varchar(255) NOT NULL,
	`prompt` text NOT NULL DEFAULT (''),
	`presentation_id` varchar(255),
	CONSTRAINT `contexts_id` PRIMARY KEY(`id`),
	CONSTRAINT `contexts_presentation_id_unique` UNIQUE(`presentation_id`)
);
--> statement-breakpoint
CREATE TABLE `edit_access` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`presentation_id` varchar(255) NOT NULL,
	`expires_at` timestamp,
	CONSTRAINT `edit_access_id` PRIMARY KEY(`id`),
	CONSTRAINT `edit_access_user_id_presentation_id_unique` UNIQUE(`user_id`,`presentation_id`)
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` varchar(255) NOT NULL,
	`context_id` varchar(255) NOT NULL,
	`storage_key` text NOT NULL,
	`mime_type` text NOT NULL,
	`file_type` text NOT NULL,
	`size_bytes` bigint NOT NULL,
	`original_name` text NOT NULL,
	CONSTRAINT `files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `presentations` (
	`id` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `presentations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `slides` (
	`id` varchar(255) NOT NULL,
	`presentation_id` varchar(255) NOT NULL,
	`content` text NOT NULL DEFAULT (''),
	`slide_order` int NOT NULL,
	CONSTRAINT `slides_id` PRIMARY KEY(`id`),
	CONSTRAINT `slides_presentation_id_slide_order_unique` UNIQUE(`presentation_id`,`slide_order`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(255) NOT NULL,
	`username` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `contexts` ADD CONSTRAINT `contexts_presentation_id_presentations_id_fk` FOREIGN KEY (`presentation_id`) REFERENCES `presentations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `edit_access` ADD CONSTRAINT `edit_access_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `edit_access` ADD CONSTRAINT `edit_access_presentation_id_presentations_id_fk` FOREIGN KEY (`presentation_id`) REFERENCES `presentations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `files` ADD CONSTRAINT `files_context_id_contexts_id_fk` FOREIGN KEY (`context_id`) REFERENCES `contexts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `presentations` ADD CONSTRAINT `presentations_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `slides` ADD CONSTRAINT `slides_presentation_id_presentations_id_fk` FOREIGN KEY (`presentation_id`) REFERENCES `presentations`(`id`) ON DELETE cascade ON UPDATE no action;