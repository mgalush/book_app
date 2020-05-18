'use strict';

const express = require('express');
const superagent = require('superagent');
require('dotenv').config();

const PORT = process.env.port || 3000;
const app = express();

// form configs
app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));

// server config
app.set('view engine', 'ejs');



app.listen(PORT, () => console.log(PORT));