CREATE TABLE `analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`thumbnailId` int NOT NULL,
	`dominantColors` text,
	`textElements` text,
	`composition` text,
	`engagementScore` int,
	`suggestions` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mixes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`sourceThumbIds` text NOT NULL,
	`resultFileKey` varchar(255),
	`resultFileUrl` text,
	`blendingMethod` varchar(100) NOT NULL DEFAULT 'smart',
	`ragSuggestions` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mixes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `thumbnails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`mimeType` varchar(100) NOT NULL DEFAULT 'image/jpeg',
	`fileSize` int NOT NULL,
	`width` int,
	`height` int,
	`analysis` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `thumbnails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `analyses` ADD CONSTRAINT `analyses_thumbnailId_thumbnails_id_fk` FOREIGN KEY (`thumbnailId`) REFERENCES `thumbnails`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mixes` ADD CONSTRAINT `mixes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `thumbnails` ADD CONSTRAINT `thumbnails_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;