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

    app.listen(process.env.PORT, () => {
        console.log(`Server listening on Port ${process.env.PORT}` );
    });

    app.get('/', (req, res)=>{
        res.sendFile( path.join(__dirname, "./FrontEnd/index.html") )
    })

    app.get('/debug', (req, res) => {
        console.log("DB Adress is: ", db);
        //res.send("TEST");
        const command = "SELECT * FROM single_items"
        db.query(command, (err, data) => {
            if (err){res.json(err);}
            res.json(data);
        })
    })

    app.get('/api/get_user_db', (req, res) => {
        // Gets entire user database. Returns row entries. {}
        const command = `SELECT * FROM user_likes `
        db.query(command, (err, data) => {
            res.json( (err) ? err : data.rows );
        })

    })

    app.post('/api/add_like', (req, res) => {
        // Primary method. Used to add entries to 2 tables. 
        // 2 Step process.
        // 1. Add item to 'single_items table
        // 2. Get id of item and add to user likes

        // Add item to single_items table
        console.log("POST Request made");
        console.log("Body: ", req.body);
        const [name, type] = [req.body.Name, req.body.Type];
        const command = `INSERT INTO single_items (item_name, item_type) VALUES ($1, $2)`
        db.query(command, [name, type], (err, data) => {
            if (err){
                console.log(err);
                res.send(err)
            }
            //res.json( (err) ? err : data );
            else{
                // No issues adding item. Proceed to getting id and adding to user table
                const get_id = `SELECT item_id FROM single_items WHERE item_name=$1 LIMIT 1;`
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

if(true){
    Express();
}


//  SELECT item_id FROM single_items WHERE item_name='AC/DC' LIMIT 1;