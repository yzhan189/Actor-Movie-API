var express = require('express');
var fs = require("fs");
var Tool = require('./Tool.js');
var bodyParser = require('body-parser');
var actors = require('./routes/actors');
var movies = require('./routes/movies');

var app = express();

// configure to use bodyParser()
// get data from command line
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// add router to app
app.use('/actors',  actors);
app.use('/movies',  movies);

// server listening on localhost
var server = app.listen(8081,"127.0.0.1", function () {

    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)

})
