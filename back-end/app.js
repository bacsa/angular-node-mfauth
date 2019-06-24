const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const login = require('./routes/login');
const register = require('./routes/register');
const tfa = require('./routes/tfa');
require('./db/db');

const port = process.env.PORT
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.json())

app.use(login);
app.use(register);
app.use(tfa);

app.listen(port, () => {
    console.log('The server started running on http://localhost: ' + port);
});