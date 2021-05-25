DROP TABLE IF EXISTS users;
CREATE TABLE users(
   ID SERIAL PRIMARY KEY     NOT NULL,
   username              TEXT    NOT NULL,     -- Must be unique
   display_name          TEXT    NOT NULL,    -- What will be shown on the
   password_hash         CHAR(50)     NOT NULL,
   user_db_id               INT
);

-----------------------------------------

DROP TABLE IF EXISTS user_likes;
CREATE TABLE user_likes(
   ID SERIAL             NOT NULL,
   liked_item_id         INT    NOT NULL,
   date_added            CHAR(50)     NOT NULL,
   list_id               INT
);

-----------------------------------------

DROP TABLE IF EXISTS single_items;
CREATE TABLE single_items(
   item_ID SERIAL PRIMARY KEY     NOT NULL,
   item_name              TEXT    NOT NULL,
   item_type          TEXT    NOT NULL
);
