INSERT INTO "User" ("Email", "Password", "Role", "Username")
VALUES
    -- password is already encrypted
    -- password: Silneheslo1
    ('user@example.com', '$2a$10$LB5umNd9uNHFG28ueEtXaeAJgRYeQbTPkjhtZU/6sI4JvSeWhIeri', 'user', 'Petr'),
    ('admin@example.com', '$2a$10$LB5umNd9uNHFG28ueEtXaeAJgRYeQbTPkjhtZU/6sI4JvSeWhIeri', 'admin', 'Pavel')
;
