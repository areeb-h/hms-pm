CREATE TABLE `doctor` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`grade` text NOT NULL,
	`team_id` integer,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `patient` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`age` integer,
	`gender` text NOT NULL,
	`ward_id` integer,
	`team_id` integer,
	`is_discharged` integer DEFAULT false,
	`created_at` integer DEFAULT 1764337927330,
	FOREIGN KEY (`ward_id`) REFERENCES `ward`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `team` (
	`id` integer PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`consultant_id` integer,
	`created_at` integer DEFAULT 1764337927330,
	FOREIGN KEY (`consultant_id`) REFERENCES `doctor`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `team_code_unique` ON `team` (`code`);--> statement-breakpoint
CREATE TABLE `treatment_record` (
	`id` integer PRIMARY KEY NOT NULL,
	`patient_id` integer,
	`doctor_id` integer,
	`created_at` integer DEFAULT 1764337927330,
	FOREIGN KEY (`patient_id`) REFERENCES `patient`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`doctor_id`) REFERENCES `doctor`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ward` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`gender_type` text NOT NULL,
	`capacity` integer NOT NULL,
	`created_at` integer DEFAULT 1764337927330
);
