PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_patient` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`dob` text,
	`gender` text NOT NULL,
	`ward_id` integer,
	`team_id` integer,
	`is_discharged` integer DEFAULT false,
	`created_at` integer DEFAULT 1764345700056,
	FOREIGN KEY (`ward_id`) REFERENCES `ward`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_patient`("id", "name", "dob", "gender", "ward_id", "team_id", "is_discharged", "created_at") SELECT "id", "name", "dob", "gender", "ward_id", "team_id", "is_discharged", "created_at" FROM `patient`;--> statement-breakpoint
DROP TABLE `patient`;--> statement-breakpoint
ALTER TABLE `__new_patient` RENAME TO `patient`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_team` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`consultant_id` integer,
	`created_at` integer DEFAULT 1764345700055,
	FOREIGN KEY (`consultant_id`) REFERENCES `doctor`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_team`("id", "code", "name", "consultant_id", "created_at") SELECT "id", "code", "name", "consultant_id", "created_at" FROM `team`;--> statement-breakpoint
DROP TABLE `team`;--> statement-breakpoint
ALTER TABLE `__new_team` RENAME TO `team`;--> statement-breakpoint
CREATE UNIQUE INDEX `team_code_unique` ON `team` (`code`);--> statement-breakpoint
CREATE TABLE `__new_treatment_record` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patient_id` integer,
	`doctor_id` integer,
	`created_at` integer DEFAULT 1764345700056,
	FOREIGN KEY (`patient_id`) REFERENCES `patient`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`doctor_id`) REFERENCES `doctor`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_treatment_record`("id", "patient_id", "doctor_id", "created_at") SELECT "id", "patient_id", "doctor_id", "created_at" FROM `treatment_record`;--> statement-breakpoint
DROP TABLE `treatment_record`;--> statement-breakpoint
ALTER TABLE `__new_treatment_record` RENAME TO `treatment_record`;--> statement-breakpoint
CREATE TABLE `__new_ward` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`gender_type` text NOT NULL,
	`capacity` integer NOT NULL,
	`created_at` integer DEFAULT 1764345700055
);
--> statement-breakpoint
INSERT INTO `__new_ward`("id", "name", "gender_type", "capacity", "created_at") SELECT "id", "name", "gender_type", "capacity", "created_at" FROM `ward`;--> statement-breakpoint
DROP TABLE `ward`;--> statement-breakpoint
ALTER TABLE `__new_ward` RENAME TO `ward`;