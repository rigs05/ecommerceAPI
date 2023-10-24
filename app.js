const express = require('express');
const app = express();
const { dbConnect } = require('./database/dbConnect');
const auth = require('./routes/auth');
const public = require('./routes/public');

async function startServer() {
    try {
        await dbConnect();
        console.log("Connected to Database successfully.");

        app.use(express.urlencoded({ extended: false }));
        app.use(express.json());
        
        app.use('/api/auth', auth);
        app.use('/api', public);
        
        
        app.listen(5000, () => {
            console.log("Server listening to port 5000.");
        })
    } catch (err) {
        console.log(err);
    }
}

startServer();
