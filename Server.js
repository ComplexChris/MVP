


require('dotenv').config() // TODO: ADD THIS LINE

function Express(){
    const express = require('express');
    const app = express();
    //const db = require('./db/db_configuration');

    app.use(express.static('FrontEnd'));

    app.get('/api/students', (req, res) => {
        db.query('SELECT * FROM student', (err, data) => {
            res.json(data.rows);
        })
    })

    app.listen(process.env.PORT, () => {
        console.log(`listening on Port ${process.env.PORT}` );
    });
}

if(true){
    Express();
}