/* Drop Types */
/* warning: this may broke some parts of database */

DROP TYPE IF EXISTS "listing_state" CASCADE
;

DROP TYPE IF EXISTS "ticket_state" CASCADE
;

DROP TYPE IF EXISTS "user_role" CASCADE
;

DROP TYPE IF EXISTS "user_state" CASCADE
;

/* Create Types */

CREATE TYPE "listing_state" AS ENUM
(
	'draft',
	'active',
	'sold',
	'deleted',
	'blocked'
)
;

CREATE TYPE "ticket_state" AS ENUM
(
	'open',
	'closed'
)
;

CREATE TYPE "user_role" AS ENUM
(
	'admin',
	'user'
)
;

CREATE TYPE "user_state" AS ENUM
(
	'active',
	'blocked'
)
;
