CREATE TABLE `analyses` (
	`id` text PRIMARY KEY NOT NULL,
	`contact_id` text NOT NULL,
	`session_id` text NOT NULL,
	`settlement_name` text NOT NULL,
	`analysis_summary` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_analyses_contact_id` ON `analyses` (`contact_id`);--> statement-breakpoint
CREATE INDEX `idx_analyses_session_id` ON `analyses` (`session_id`);--> statement-breakpoint
CREATE INDEX `idx_analyses_created_at` ON `analyses` (`created_at`);--> statement-breakpoint
CREATE TABLE `companies` (
	`id` text PRIMARY KEY NOT NULL,
	`company_name` text NOT NULL,
	`normalized_name` text NOT NULL,
	`website` text,
	`organization_type` text NOT NULL,
	`employee_range` text,
	`city` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_companies_normalized_name` ON `companies` (`normalized_name`);--> statement-breakpoint
CREATE TABLE `consents` (
	`id` text PRIMARY KEY NOT NULL,
	`contact_id` text NOT NULL,
	`consent_type` text NOT NULL,
	`granted` integer NOT NULL,
	`privacy_version` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_consents_contact_id` ON `consents` (`contact_id`);--> statement-breakpoint
CREATE INDEX `idx_consents_type_created_at` ON `consents` (`consent_type`,`created_at`);--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`company_id` text NOT NULL,
	`organization_type` text NOT NULL,
	`job_role` text,
	`phone` text,
	`chatgpt_user_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`source` text NOT NULL,
	`utm_source` text,
	`utm_medium` text,
	`utm_campaign` text,
	`utm_content` text,
	`marketing_consent` integer DEFAULT false NOT NULL,
	`privacy_accepted` integer DEFAULT false NOT NULL,
	`privacy_version` text NOT NULL,
	`last_seen_at` text NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_contacts_email` ON `contacts` (`email`);--> statement-breakpoint
CREATE INDEX `idx_contacts_company_id` ON `contacts` (`company_id`);--> statement-breakpoint
CREATE INDEX `idx_contacts_last_seen_at` ON `contacts` (`last_seen_at`);--> statement-breakpoint
CREATE INDEX `idx_contacts_utm_campaign` ON `contacts` (`utm_campaign`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`contact_id` text,
	`session_id` text NOT NULL,
	`event_name` text NOT NULL,
	`event_properties` text DEFAULT '{}' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_events_contact_id` ON `events` (`contact_id`);--> statement-breakpoint
CREATE INDEX `idx_events_session_id` ON `events` (`session_id`);--> statement-breakpoint
CREATE INDEX `idx_events_name_created_at` ON `events` (`event_name`,`created_at`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`contact_id` text NOT NULL,
	`use_cases` text DEFAULT '[]' NOT NULL,
	`pain_points` text DEFAULT '[]' NOT NULL,
	`project_timeline` text,
	`contact_interest` text,
	`profile_completed` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_profiles_contact_id` ON `profiles` (`contact_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`contact_id` text,
	`source` text NOT NULL,
	`utm_source` text,
	`utm_medium` text,
	`utm_campaign` text,
	`utm_content` text,
	`first_seen_at` text NOT NULL,
	`last_seen_at` text NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_sessions_contact_id` ON `sessions` (`contact_id`);--> statement-breakpoint
CREATE INDEX `idx_sessions_first_seen_at` ON `sessions` (`first_seen_at`);--> statement-breakpoint
PRAGMA optimize;
