
const {Pool} = require('pg'); 



console.log("DATABASE URL: ", process.env.DATABASE_URL)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'dev' ? false : {
        rejectUnauthorized: false
    }
});

module.exports = pool 

