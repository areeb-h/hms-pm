CREATE TABLE `audit_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` integer NOT NULL,
	`user_id` integer,
	`details` text,
	`timestamp` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_treatment_record` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patient_id` integer NOT NULL,
	`doctor_id` integer NOT NULL,
	`notes` text,
	`treatment_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`patient_id`) REFERENCES `patient`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`doctor_id`) REFERENCES `doctor`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_treatment_record`("id", "patient_id", "doctor_id", "treatment_date", "created_at") SELECT "id", "patient_id", "doctor_id", "created_at", "created_at" FROM `treatment_record`;--> statement-breakpoint
DROP TABLE `treatment_record`;--> statement-breakpoint
ALTER TABLE `__new_treatment_record` RENAME TO `treatment_record`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
