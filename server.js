'use strict';

// Module dependencies.
var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    async = require('async');

// Setup Express App & Server
var app = express(),
    server = require('http').createServer(app);

// Connect to database
var db = require('./lib/db/mongo');

// Setup Socket IO
var io = require('socket.io').listen(server);

// Read Mongoose Models
var modelsPath = path.join(__dirname, 'lib/models');
fs.readdirSync(modelsPath).forEach(function (file) {
    require(modelsPath + '/' + file)(mongoose);
});

// Setup Passport-Local
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
passport.deserializeUser(function(id, done) {
    mongoose.model('User').findById(id, function (err, user) {
        done(err, user);
    });
});
passport.use(new LocalStrategy({passReqToCallback: true}, function(req, username, password, done) {
    mongoose.model('User').findOne({ username: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        user.comparePassword(password, function(err, isMatch) {
            if (err) return done(err);
            if(isMatch) {
                if (req.body.rememberme === true) {
                    req.session.cookie.expires = false;
                }
                return done(null, user);
            } else {
                return done(null, false, { message: 'Invalid password' });
            }
        });
    });
}));

// Auth Function
function auth (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.send(401);
}


// Express Configuration
app.configure(function(){
	app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.compress())
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.session({ secret: 'vI0GO63jD4%IjP0tagBeW4&5pTOqQo!x' }));
    app.use(passport.initialize());
    app.use(passport.session());
	app.use(app.router);
});

app.configure('development', function(){
    app.use(express.logger('dev'));
    app.use(express.static(path.join(__dirname, '.tmp')));
    app.use(express.static(path.join(__dirname, 'app')));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
    app.use(express.favicon(path.join(__dirname, 'public/favicon.ico')));
    app.use(express.static(path.join(__dirname, 'public'), { maxAge: 86400000 /*one day*/ }));
});



// Controllers
var api = {
        awesomethings: require('./lib/controllers/awesomethings')(mongoose, async, io),
        blimps: require('./lib/controllers/blimps')(mongoose, async, io),
        users: require('./lib/controllers/users')(mongoose, async, io)
    };

// Routes
app.get('/api/loggedin', function(req, res) {
    if (req.isAuthenticated && req.user) {
        res.send({ 
            username: req.user.username,
            email: req.user.email
        });
    } else {
        res.send('0');
    }
    
});
app.post('/api/login', function(req, res) {
    console.log('before authenticate');
    passport.authenticate('local', function(err, user, info) {
        console.log('authenticate callback');
        if (err) { return res.send({'status':'err','message':err.message}); }
        if (!user) { return res.send({'status':'fail','message':info.message}); }
        req.logIn(user, function(err) {
            if (err) { return res.send({'status':'err','message':err.message}); }
            return res.send({'status':'ok'});
        });
    })(req, res);
});
app.post('/api/logout', function(req, res){
    req.logOut();
    res.send(200);
});

app.get('/api/repopulate', auth, api.awesomethings.repopulate);

app.get('/api/awesomeThings', auth, api.awesomethings.findAll);
app.delete('/api/awesomeThings/:id', auth, api.awesomethings.deleteById);

app.get('/api/blimps', auth, api.blimps.findAll);
app.get('/api/blimps/:id', auth, api.blimps.findById);
app.post('/api/blimps', auth, api.blimps.createNew);
app.put('/api/blimps/:id', auth, api.blimps.updateById);
app.delete('/api/blimps/:id', auth, api.blimps.deleteById);

app.get('/api/users', auth, api.users.findAll);
app.get('/api/users/:id', auth, api.users.findById);
app.post('/api/users', auth, api.users.createNew);
app.put('/api/users/:id', auth, api.users.updateById);
app.delete('/api/users/:id', auth, api.users.deleteById);


// Start server
var port = process.env.PORT || 9007;
server.listen(port, function () {
    console.log('Creating default user blimp/blimp .....');
    mongoose.model('User').create({
            username : 'blimp',
            email : 'me@davidsimon.ch',
            password : 'blimp'
        }, function(err) {
            if (!err) {
                console.log('Success: Default user created!');
            } else {
                console.log('Error: Creating default user failed! Does it already exist?')
            }
        });
    console.log('The express server listening on port %d in %s mode', port, app.get('env'));
});