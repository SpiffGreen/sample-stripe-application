CREATE TABLE `payment_intents` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`amont` integer NOT NULL,
	`payment_intent` text,
	`status` text
);
