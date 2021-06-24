const express = require('express');
const { response } = require('express');
const cors = require('cors');
const { max, rows } = require('pg/lib/defaults');
const { time } = require('console');
const fetch = require('node-fetch');

require('dotenv').config() // TODO: ADD THIS LINE

const query_master = {
    test: (x) => console.log(x)
}


class CreateToken{
    constructor(db_name){
        this.session_data = {
            db_name,
            created : Date.now()
        }
        this.max_time = 1.8e+6 / 8;
    }
    isExpired(){
        return (this.timeLeft <=0) ? true : false
    }

    timeLeft(){
        const current_time = Date.now()
        const time_left = (this.session_data.created + this.max_time) - current_time;
        console.log("Time left in session: ", time_left );
        return time_left;
    }
}
function makeToken(length) {
    var result           = [];
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result.push(characters.charAt(Math.floor(Math.random() *
        charactersLength)));
    }
    return result.join('');
}

function Express(){

    // Establish server requirements.
    var DB_ID = "demo_user"
    const path = require('path');
    const express = require('express');
    const app = express();
    const PORT = process.env.PORT || 3000
    const TOKEN_CACHE = {}
    app.use(cors());
    // Add middleware to parse body
    app.use( express.json() )

    // Get the database pool instance
    const db = require('./db/db_configuration');

    // Declare the relative path to the public HTML folder
    app.use(express.static( path.join(__dirname, 'FrontEnd' ) ));

    // app.use((req, res, next)=> {
    //     console.log("SHIT")
    //     console.log("FFFUUUCCKK: ", req.body);
    //     next();
    // })

    const do_fetch = (url, callback) => {
        console.log("URL: ", url);
        fetch( url )
          .then((response) => response.json())
          .then((data) => callback( data ) )
          .catch((err)=>{
              console.log("Error: ", err)
              callback({error:"ERROR"})
            }) ;
      }

    app.listen(PORT, () => {
        console.log(`Server listening on Port ${PORT}\n` );
    });



    app.use((req, res, next)=>{
        console.log("Middleware detected another request!!!");
        const {USER_TOKEN} = req.body;
        //console.log("BODY PASSED: ",  req.body)
        const key_ind = Object.keys(TOKEN_CACHE).indexOf(USER_TOKEN)
        if( key_ind < 0 ){
            // Token not in cache
            // res.end();
            console.log("\nTOKEN NOT FOUND")
        }
        else{
            console.log("User token passed: ", USER_TOKEN);
            if( TOKEN_CACHE[USER_TOKEN].isExpired() ){
                // Token expired
                // res.end();
                console.log("\nEXPIRED TOKEN PASSED")
                res.send("EXPIRED")
            }
            else{
                // Token accepted
                console.log("\nTOKEN ACCEPTED")
                DB_ID = TOKEN_CACHE[USER_TOKEN].session_data.db_name;
            }
        }
        next();
    })

    app.get('/', (req, res)=>{
        console.log("HOME DIRECTORY");
        res.sendFile( path.join(__dirname, "./FrontEnd/index.html") )
    })

    app.post('/api/fetch', (req, res)=>{

        try {
            const cb = (data) => {
                res.status(200)
                res.json(data)
            } // res.send
            const url = req.body.url
            do_fetch( url, cb )
        }
        catch{
            console.log("An error has occured")
        }
    })


    app.get('/debug', (req, res) => {
        //console.log("DB Adress is: ", db);
        //res.send("TEST");
        //const command = "SELECT * FROM single_items"
        console.log("Token Cache: ", TOKEN_CACHE )
        const command = `SELECT * FROM users`
        db.query(command, (err, data) => {
            if (err){res.json(err);}
            res.json(data);
        })
    })

    app.post('/api/check_token', (req, res) => {
        const {USER_TOKEN} = req.body;
        const key_ind = Object.keys(TOKEN_CACHE).indexOf(USER_TOKEN)
        const time_left = (key_ind<0) ? 'Invalid Token: '+USER_TOKEN : TOKEN_CACHE[USER_TOKEN].timeLeft()
        res.send(TOKEN_CACHE[USER_TOKEN]);
        //res.json(time_left);
    })


    app.post('/api/get_user_db', (req, res) => {
        // Gets entire user database. Returns row entries. {}
        //const command = `SELECT * FROM ${DB_ID} `
        const command = ` SELECT item_name, item_type FROM single_items
                        JOIN ${DB_ID} ON item_id=liked_item_id;`
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
        INSERT INTO ${DB_ID} (liked_item_id, date_added, list_id) SELECT $1, $2, 0
        WHERE NOT EXISTS( SELECT * FROM ${DB_ID} WHERE liked_item_id=$1 )
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
        //console.log("Body: ", req.body);

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
        const new_db = "db_"+Math.abs( gen_db )
        // $1 = new_db, $2 = username
        console.log("New DB ID: ", new_db)
        command = `
        CREATE TABLE IF NOT EXISTS ${new_db}(
            ID SERIAL             NOT NULL,
            liked_item_id         INT    NOT NULL,
            date_added            CHAR(50)     NOT NULL,
            list_id               INT
        )`
        db.query(command, (err, data) => {
            if(err){ console.log("Error at signup: ", err) }
            const add_user = `
            INSERT INTO users (username, password_hash, user_db_id ) SELECT $1, $2, $3
            WHERE NOT EXISTS( SELECT * FROM users WHERE username=$1 )
            `

            db.query(add_user, [username, hash, new_db ], (err, data) => {
                res.status( (err) ?  (console.log(`INSERT INTO USERS ERROR: ,`, err), 400) : 200 );
                res.json( (err) ? err : {status:"created"} );
        })
    })
})

    app.post('/api/login_user' , (req, res) => {
        // Gets database ID
        // Login user. Provided correct details, will authenticate and return token.
        const {username, hash} = req.body;
        const command = `SELECT user_db_id FROM users WHERE username=$1 AND password_hash=$2 LIMIT 1;`
        db.query(command, [username, hash],  (err, data) => {
            let db_id, token;
            if (data.rows.length > 0 ){
                db_id = data.rows[0].user_db_id
                token = makeToken(30);
                TOKEN_CACHE[token] = new CreateToken(db_id)
                console.log("DB ID: ", db_id)
                console.log("Token: ", token)
            }
            const content = ( db_id !== undefined ) ? {status:"success", token} : {status:"fail"}
            if(err){ console.log("Error with get db: ", err)  }
            res.status( (err) ? 400 : 200 )
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
        const command = `DELETE FROM ${DB_ID} WHERE liked_item_id=$1`
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
