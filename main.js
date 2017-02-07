/**
 * main.js - Pinata database REST API
 * licencing pending
 */

var express    = require('express'),
    path       = require('path'),
    bodyParser = require('body-parser'),
    cookie     = require('cookie-parser');
    app        = express(),
    pg         = require('pg')
    morgan     = require('morgan');
    jwt        = require('jsonwebtoken');

app.set('port', (process.env.PORT || 5000));
app.set('secret', (process.env.SECRET || 'postgres'));
app.set('dburl', (process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/pinata_legacy'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookie());

app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));

var pinata = require('./model.js');
var user   = require('./saleman.js');
//var auth   = require('./auth.js');
app.use('/api/pinata', pinata);
app.use('/api/user', user);

var server = app.listen(app.get('port'), function() {
    console.log("Listening to port %s", server.address().port);
});
