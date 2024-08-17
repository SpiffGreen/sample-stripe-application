CREATE TABLE `cart` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`products` text,
	`stripe_cart_session` text
);
