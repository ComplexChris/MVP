const express = require('express');
const cors = require('cors');
const { response } = require('express');


require('dotenv').config() // TODO: ADD THIS LINE

function Express(){

    // Establish server requirements. 
    const express = require('express');
    const app = express();

    // Add middleware to parse body
    app.use( express.json() )
    //const db = require('./db/db_configuration');

    // Declare the relative path to the public HTML folder
    app.use(express.static('FrontEnd'));    

    app.listen(process.env.PORT, () => {
        console.log(`Server listening on Port ${process.env.PORT}` );
    });

    app.get('/home', (req, res) => {
        console.log("Home")
    })
    app.get('/api/students', (req, res) => {
        db.query('SELECT * FROM student', (err, data) => {
            res.json(data.rows);
        })
    })

}

if(true){
    Express();
}