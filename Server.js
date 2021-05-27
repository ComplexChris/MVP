const express = require('express');
const cors = require('cors');
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
    const PORT = process.env.PORT || 5000
    // Add middleware to parse body
    app.use( express.json() )

    // Get the database pool instance
    const db = require('./db/db_configuration');

    // Declare the relative path to the public HTML folder
    app.use(express.static( path.join(__dirname, 'FrontEnd' ) )); 

    app.use((req, res, next)=> {
        console.log("SHIT")
        console.log("FFFUUUCCKK: ", req.body);
        next();
    })

    app.listen(PORT, () => {
        console.log(`Server listening on Port ${PORT}` );
    });

    app.get('/', (req, res)=>{
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
            res.status( (err) ? 404 : 200 )
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
            res.status( (err) ? 404 : 200 )
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
            res.status( (err) ? 404 : 200 )
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
                    res.status( (err) ? 404 : 200 )
                    res.json( (err) ? err : data.rows[0].item_id );
                })
            }
        })
    })
    

    app.put('/api/save_entry', (req, res) => {
        // Placeholder for future updates
    })

    app.patch('/api/save_entry', (req, res) => {
        // Placeholder only. Not currently in use.
    })

}

function getItemID(item, table_name){
    const command = `SELECT item_id FROM $2 WHERE item_name=$1 LIMIT 1;`
    db.query(command, [item, table_name], (err, data) => {
        res.status( (err) ? 404 : 200 )
        res.json( (err) ? err : data.rows );
    })
}
function addItem(item){

}





if(true){
    Express();
}


//  SELECT item_id FROM single_items WHERE item_name='AC/DC' LIMIT 1;