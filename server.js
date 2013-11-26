'use strict';

// Module dependencies.
var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    async = require('async');

var app = express(),
    server = require('http').createServer(app);


// Connect to database
var db = require('./lib/db/mongo');

// Setup Socket IO
var io = require('socket.io').listen(server);


// Bootstrap models
var modelsPath = path.join(__dirname, 'lib/models');
fs.readdirSync(modelsPath).forEach(function (file) {
  require(modelsPath + '/' + file);
});

// Populate empty DB with dummy data
require('./lib/db/dummydata');

// Controllers
var api = require('./lib/controllers/api_module')(mongoose, async, io);

// Express Configuration
app.configure(function(){
    // app.use(express.json());
    // app.use(express.urlencoded());
    // app.use(express.cookieParser('VuczXHzVj2QZoznJP4NraKnb0sbhRkSJ01mUzXnQmA0zDNvu0m1SuwAqTVj4oWJE'));
    // app.use(express.session());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
});

app.configure('development', function(){
  app.use(express.logger('dev'));
  app.use(express.static(path.join(__dirname, '.tmp')));
  app.use(express.static(path.join(__dirname, 'app')));
  app.use(express.errorHandler());
});

app.configure('production', function(){
  app.use(express.favicon(path.join(__dirname, 'public/favicon.ico')));
  app.use(express.static(path.join(__dirname, 'public', { maxAge: 86400000 /*one day*/ })));
});

// Routes

app.get('/api/repopulate', api.repopulate);
app.get('/api/awesomeThings', api.findAll);
app.delete('/api/awesomeThings/:id', api.deleteById)

// Start server
var port = process.env.PORT || 3000;
server.listen(port, function () {
  console.log('Express server listening on port %d in %s mode', port, app.get('env'));
});