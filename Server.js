const express = require('express');
const { response } = require('express');


require('dotenv').config() // TODO: ADD THIS LINE

const query_master = {
    test: (x) => console.log(x)
}


function Express(){

    // Establish server requirements. 
    const path = require('path');
    const express = require('express');
    const app = express();
    const PORT = process.env.PORT || 3000
    // Add middleware to parse body
    app.use( express.json() )

    // Get the database pool instance
    const db = require('./db/db_configuration');

    // Declare the relative path to the public HTML folder
    console.log("SETTING: ", path.join(__dirname, 'FrontEnd' ) )
    app.use(express.static( path.join(__dirname, 'FrontEnd' ) )); 
    
    // app.use((req, res, next)=> {
    //     console.log("SHIT")
    //     console.log("FFFUUUCCKK: ", req.body);
    //     next();
    // })

    app.listen(PORT, () => {
        console.log(`Server listening on Port ${PORT}\n`, arguments );
    });



    app.get('/', (req, res)=>{
        console.log("HOME DIRECTORY");
        res.sendFile( path.join(__dirname, "./FrontEnd/index.html") )
    })

    app.get('/debug', (req, res) => {
        console.log("DB Adress is: ", db);
        //res.send("TEST");
        //const command = "SELECT * FROM single_items"
        const command = `
        select exists( select item_id from single_items where item_id=$1) as user_exists, 
               exists( select item_id from single_items where item_id=12) as item_exists;
        `
        db.query(command, (err, data) => {
            if (err){res.json(err);}
            res.json(data);
        })
    })

    app.get('/api/get_user_db', (req, res) => {
        // Gets entire user database. Returns row entries. {}
        //const command = `SELECT * FROM user_likes `
        const command = ` SELECT item_name, item_type FROM single_items 
                        JOIN user_likes ON item_id=liked_item_id;`
        db.query(command, (err, data) => {
            res.status( (err) ? (console.log(err), 400) : 200 )
            res.json( (err) ? err : data.rows );
        })

    })

    app.get('/api/exists', (req, res) => {
        // Checks to see if valid entry in Table
        // Requires 2 variables in the body; item and table
        // Returns object { exists: true|false }
        const [item, table] = [req.body.item, req.body.table];
        const command = `select exists( select * from $2 where item_id=$1) as exists`
        db.query(command, [item, table],  (err, data) => {
            res.status( (err) ? (console.log(err), 400) : 200 )
            res.json( (err) ? err : data.rows[0].exists );
        })
    })

    app.post('/api/add_to_user', (req, res) => {
        const [item_id, add_date] = [req.body.item_id, req.body.add_date]
        const command = `
        INSERT INTO user_likes (liked_item_id, date_added, list_id) SELECT $1, $2, 0
        WHERE NOT EXISTS( SELECT * FROM user_likes WHERE liked_item_id=$1 )
        `
        db.query(command, [item_id, add_date],  (err, data) => {
            res.status( (err) ? (console.log(err), 400) : 200 )
            res.json( (err) ? err : {status:'added'} );
        })
    })
    app.post('/api/add_item', (req, res) => {
        // Primary method. Used to add entries to 2 tables. 
        // Multi Step process.
        // 1. Add item to 'single_items table
        // 2. Get id of item and returns id of item


        console.log("POST Request made");
        console.log("Body: ", req.body);

        const [name, type] = [req.body.Name, req.body.Type];
        const command = `
        INSERT INTO single_items (item_name, item_type) SELECT $1, $2 
        WHERE NOT EXISTS( SELECT * FROM single_items WHERE item_name=$1 )
        `
        //const chk_quer = `select exists( select item_id from single_items where id=12)`
        
        db.query(command, [name, type], (err, data) => {
            if (err){
                console.log(err);
                res.send(err)
            }
            else{
                // No issues adding item. Get and return id of new item
                console.log("Success!!!")
                const get_id = `SELECT item_id FROM single_items WHERE item_name=$1 LIMIT 1`
                db.query(get_id, [name],  (err, data) => {
                    res.status( (err) ? (console.log(err), 400) : 200 )
                    res.json( (err) ? err : data.rows[0].item_id );
                })
            }
        })
    })

    app.post('/api/signup_user', (req, res) => {
        // Creates user database
        const {username, hash} = req.body;
        const gen_db =  (hash+username).split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0); 
        const new_db = Math.abs( gen_db )
        // $1 = new_db, $2 = username
        console.log("New DB ID: ", new_db)
        command = `
        CREATE TABLE poop(
            ID SERIAL             NOT NULL,
            liked_item_id         INT    NOT NULL,
            date_added            CHAR(50)     NOT NULL,
            list_id               INT
        )`
        db.query(command, [new_db],  (err, data) => {
            res.status( (err) ? (console.log(err), 400) : 201 )
            res.json( (err) ? err : {status:"created"} );
        })
    })

    app.get('/api/get_db_id' , (req, res) => {
        // Gets database ID
        const {username, hash} = req.body;
        const command = `SELECT user_db_id FROM users where username=$1 AND password_hash=$2 LIMIT 1;`
        db.query(command, [username, hash],  (err, data) => {
            const db_id = data.rows.user_db_id
            console.log("DB ID: ", db_id)
            const content = ( db_id !==undefined ) ? {status:"success", db_id} : {status:"fail"}
            res.status( (err) ? (console.log(err), 400) : 200 )
            res.json( (err) ? err : content);
        })
    })
    

    app.put('/api/save_entry', (req, res) => {
        // Placeholder for future updates
    })

    app.patch('/api/save_entry', (req, res) => {
        // Placeholder only. Not currently in use.
    })

    app.delete('/api/delete_item', (req, res) => {
        const {item_id} = req.body;
        const command = `DELETE FROM user_likes WHERE liked_item_id=$1`
        db.query(command, [item_id],  (err, data) => {
            res.status( (err) ? (console.log(err), 400) : 200 )
            res.json( (err) ? err : {status:'removed'} );
        })
    })

}



if(true){
    Express();
}


//  SELECT item_id FROM single_items WHERE item_name='AC/DC' LIMIT 1;