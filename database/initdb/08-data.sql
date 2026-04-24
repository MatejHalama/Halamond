INSERT INTO "Category" ("CategoryID", "parentCategory", "Name")
VALUES
    (1, null, 'Elektronika'),
    (2, 1, 'Počítače'),
    (3, 1, 'Mobily'),
    (4, 1, 'Velká elektronika'),

    (5, null, 'Oblečení'),
    (6, 5, 'Bundy, Mikiny, Trička'),
    (7, 5, 'Kalhoty, Sukně'),
    (8, 5, 'Společenské oblečení'),
    (9, 5, 'Doplňky'),

    (10, null, 'Učebnice, Skripta'),
    (11, 10, 'DBS'),
    (12, 10, 'TNPW'),
    (13, 10, 'PRO'),
    (14, 10, 'ZMI')
;

INSERT INTO "User" ("Email", "Password", "Role", "Username")
VALUES
    -- password is already encrypted
    -- password: Silneheslo1
    ('petr@example.com', '$2a$10$LB5umNd9uNHFG28ueEtXaeAJgRYeQbTPkjhtZU/6sI4JvSeWhIeri', 'user', 'Petr'),
    ('kuba@example.com', '$2a$10$LB5umNd9uNHFG28ueEtXaeAJgRYeQbTPkjhtZU/6sI4JvSeWhIeri', 'user', 'Kuba'),
    ('tereza@example.com', '$2a$10$LB5umNd9uNHFG28ueEtXaeAJgRYeQbTPkjhtZU/6sI4JvSeWhIeri', 'user', 'Tereza'),
    ('pavel@example.com', '$2a$10$LB5umNd9uNHFG28ueEtXaeAJgRYeQbTPkjhtZU/6sI4JvSeWhIeri', 'user', 'Pavel'),
    ('lucie@example.com', '$2a$10$LB5umNd9uNHFG28ueEtXaeAJgRYeQbTPkjhtZU/6sI4JvSeWhIeri', 'user', 'Lucie'),
    ('admin@example.com', '$2a$10$LB5umNd9uNHFG28ueEtXaeAJgRYeQbTPkjhtZU/6sI4JvSeWhIeri', 'admin', 'Admin')
;

INSERT INTO "Listing" ("author", "Title", "Description", "Price", "belongsTo")
VALUES
    (1, 'Samsung Galaxy A35', 'Použitý mobilní telefon v dobrém stavu. Amoled display.', 3300, 3),
    (1, 'Základy HTML', 'Skvělá knížka k předmětu TNPW1', 210, 12),
    (2, 'Společenský oblek', 'Společenský oblek, skoro jako nový, použitý jen 2x.', 1600, 8),
    (2, 'Vše o fungování relačních databází', 'Skvělá knížka k předmětu DBS2', 240, 11),
    (3, 'Malá lednička', 'Málá lednička, akorát pod kuchyňskou linku', 1200, 4),
    (3, 'Sbírka úloh: Derivace, Integrace', 'Učebnice s příklady na procvičení derivací a integrálů.', 190, 14),
    (4, '3D Tiskárna', 'Málá 3D tiskárna s jednou tryskou.', 6400, 4),
    (4, 'Vývoj webových služeb v Jave', 'Skvělá knížka k předmětu PRO2', 3300, 13),
    (5, 'Trička', 'Různá trička, která už mi jen leží ve skříni', 120, 6),
    (5, 'Jak na správnou databázi', 'Skvělá knížka k předmětu DBS', 170, 11)
;

INSERT INTO "Ticket" ("subjectListing", buyer)
VALUES
    (1, 2),
    (4, 3),
    (5, 4),
    (8, 5),
    (10, 1)
;

INSERT INTO "Message" (sender, ticket, "Text")
VALUES
    (2, 1, 'Mám zájem'),
    (3, 2, 'Mám zájem'),
    (4, 3, 'Mám zájem'),
    (5, 4, 'Mám zájem'),
    (1, 5, 'Mám zájem')
;

CALL create_notification(1, 1, 'Nová zpráva k inzerátu Samsung Galaxy A35', '/tickets/1');
CALL create_notification(2, 2, 'Nová zpráva k inzerátu Vše o fungování relačních databází', '/tickets/2');
CALL create_notification(3, 3, 'Nová zpráva k inzerátu Malá lednička', '/tickets/3');
CALL create_notification(4, 4, 'Nová zpráva k inzerátu Vývoj webových služeb v Jave', '/tickets/4');
CALL create_notification(5, 5, 'Nová zpráva k inzerátu Jak na správnou databázi', '/tickets/5');

CALL send_ticket_message(1, 1, 'Můžeme se sejít ve škole a domluvit se');
CALL send_ticket_message(3, 3, 'V podněli nebo pátek odpoledne bývám na koleji, klidně se můžeš pro ledničku zastavit');

CALL close_ticket(1);
CALL close_ticket(3);

INSERT INTO "Rating" ("Rating", reviewed, reviewer)
VALUES
    (5, 1, 2),
    (4, 3, 4)
;

--TODO: comment
--TODO: report