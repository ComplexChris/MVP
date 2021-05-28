INSERT INTO users (username, password_hash, user_db_id )
VALUES ("demo_user", 'password_here', "demo_db" );


INSERT INTO demo_db (liked_item_id, date_added, list_id) 
VALUES (4, '24may2021', 1);

INSERT INTO single_items (item_name, item_type) 
VALUES ('AC/DC', 'music');

INSERT INTO user_likes (item_name, item_type) SELECT $1, $2 
        WHERE NOT EXISTS( SELECT * FROM single_items WHERE item_name=$1 )