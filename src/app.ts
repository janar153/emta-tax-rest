require('dotenv').config();

import express from 'express';

const bodyParser = require('body-parser');
const logger = require('morgan');

const app = express();
const port = process.env.PORT || 3000;

app.enable('trust proxy');
app.set('port', port);

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    let response = {
        "title": "EMTA tax debt checker",
        "description": "Simple EMTA tax debt checker to check Estonia comapnies tax debt and get result in JSON"
    };
    res.json(response);
});

app.use('/tax', require('./routes/tax'));

// @ts-ignore
app.listen(port, err => {
    if(err) {
        return console.error(err);
    }
    return console.log(`Server is running on port ${port}`);
});