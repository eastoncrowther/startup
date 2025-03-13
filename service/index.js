const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const express = require('express');
const app = express();

// The service port
const port = process.argv.length > 2 ? process.argv[2] : 3000;

// JSON body parsing
app.use(express.json());


app.get('*', (req, res) => {
    res.send({msg: 'startup service'});
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});