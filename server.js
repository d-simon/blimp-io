'use strict';

/* ---------------------------------------------------------------------------------------------- */
// Dependencies
/* ---------------------------------------------------------------------------------------------- */

var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    MongoStore = require('connect-mongo-store')(express),
    async = require('async'),
    passport = require('passport'),
    passportSocketIo = require("passport.socketio"),
    socketio = require('socket.io'),
    http = require('http'),
    useragent = require('express-useragent');

/* ---------------------------------------------------------------------------------------------- */
// Setup
/* ---------------------------------------------------------------------------------------------- */

// Express
var app = express(),
    server = http.createServer(app);

// Connect to database
var db = require('./lib/db/mongo');

// Setup Socket.io
var io = socketio.listen(server);


/* ---------------------------------------------------------------------------------------------- */
// Setup Passport-Local Authentatication
/* ---------------------------------------------------------------------------------------------- */

var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    mongoose.model('User')
        .findById(id, function (err, user) {
            done(err, user);
        });
});

passport.use(new LocalStrategy({passReqToCallback: true},function(req, username, password, done) {

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

passportSocketIo.forEachAuthedSocket = function (callback) {
    
    this.filterSocketsByUser(io, function (user) {
            return user.logged_in === true;
        })
        .forEach(function (socket) {
            if (callback && typeof(callback) === 'function') {
                callback(socket);
            }
        });
        
};

/* ---------------------------------------------------------------------------------------------- */
// MongoStore Session Storage Configuration
/* ---------------------------------------------------------------------------------------------- */
var uristring =
  process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/blimp-io';

var mongoOptions = { db: { safe: true } };

var mongoStore = new MongoStore(uristring, mongoOptions);

mongoStore.on('connect', function() {
    console.log('mongoStore is ready to use')
})

mongoStore.on('error', function(err) {
    console.log('mongoStore Error: ', err)
})


/* ---------------------------------------------------------------------------------------------- */
// SocketIO Configuration
/* ---------------------------------------------------------------------------------------------- */

io.configure(function () {
    io.set('authorization', passportSocketIo.authorize({
      cookieParser: express.cookieParser,
      key:         'connect.sid',       // the name of the cookie where express/connect stores its session_id
      secret:      'vI0GO63jD4%IjP0tagBeW4&5pTOqQo!x',    // the session_secret to parse the cookie
      store:       mongoStore,        // we NEED to use a sessionstore. no memorystore please
      success:     onAuthorizeSuccess,  // *optional* callback on success - read more below
      fail:        onAuthorizeFail,     // *optional* callback on fail/error - read more below
    }));
});

function onAuthorizeSuccess(data, accept){
    console.log('successful connection to socket.io');

    // The accept-callback still allows us to decide whether to
    // accept the connection or not.
    accept(null, true);
}

function onAuthorizeFail(data, message, error, accept){
    /*if(error) {
        throw new Error(message);
    }*/
    console.log('failed connection to socket.io:', message);

    // We use this callback to log all of our failed connections.
    accept(null, true);
}


/* ---------------------------------------------------------------------------------------------- */
// Express Configuration
/* ---------------------------------------------------------------------------------------------- */

app.configure(function(){
    app.use(useragent.express());
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.compress());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.session({ store: mongoStore, secret: 'vI0GO63jD4%IjP0tagBeW4&5pTOqQo!x' }))
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
    app.use(express.static(path.join(__dirname, 'public'), { maxAge: 60 * 60 * 24 * 365 * 10 }));
});



/* ---------------------------------------------------------------------------------------------- */
// Mongoose Models
/* ---------------------------------------------------------------------------------------------- */

var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

mongoose.plugin(function(schema, opts) {
    schema.statics.isObjectId = function(id) {
       if(id) {
           return checkForHexRegExp.test(id);
       }
       return false;
    };
});

var modelsPath = path.join(__dirname, 'lib/models');
fs.readdirSync(modelsPath)
    .forEach(function (file) {
        require(modelsPath + '/' + file)(mongoose);
    });



/* ---------------------------------------------------------------------------------------------- */
// Auth Routes
/* ---------------------------------------------------------------------------------------------- */

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
    passport.authenticate('local', function(err, user, info) {
        if (err) { return res.send({'status':'err','message':err.message}); }
        if (!user) { return res.send({'status':'fail','message':info.message}); }
        req.logIn(user, function(err) {
            if (err) { return res.send({'status':'err','message':err.message}); }
            return res.send({'status':'ok'});
        });
    })(req, res);
});

app.post('/api/logout', function(req, res){
    req.session.destroy(function (err) {
        res.send(200);
    });
    
});

var auth = function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.send(401);
    };

/* ---------------------------------------------------------------------------------------------- */
// Controllers
/* ---------------------------------------------------------------------------------------------- */

var api = {
        blimps:            require('./lib/controllers/blimps')(mongoose, async, io, passportSocketIo),
        blimpreports:      require('./lib/controllers/blimpreports')(mongoose, async, io, passportSocketIo),
        users:             require('./lib/controllers/users')(mongoose, async, io, passportSocketIo)
    };

/* ---------------------------------------------------------------------------------------------- */
// Routes
/* ---------------------------------------------------------------------------------------------- */
                    
app.get(        '/api/blimps',                              auth, api.blimps.findAll);
app.get(        '/api/blimps/:bid',                         auth, api.blimps.find);
app.post(       '/api/blimps',                              auth, api.blimps.createNew);
app.put(        '/api/blimps/:bid',                         auth, api.blimps.update);
app.delete(     '/api/blimps/:bid',                         auth, api.blimps.delete);


app.post(       '/api/reports',                                   api.blimpreports.createNew);
app.get(        '/api/reports',                             auth, api.blimpreports.findAll);
app.get(        '/api/reports/:logid',                      auth, api.blimpreports.findById);

app.get(        '/api/blimps/:bid/reports',                 auth, api.blimpreports.findByBlimp);
app.get(        '/api/blimps/:bid/reports/:rid',            auth, api.blimpreports.findById);
app.get(        '/api/blimps/:bid/reports/:rid',            auth, api.blimpreports.findById);


app.get(        '/api/users',                               auth, api.users.findAll);
app.get(        '/api/users/:userid',                       auth, api.users.findById);
app.post(       '/api/users',                               auth, api.users.createNew);
app.put(        '/api/users/:userid',                       auth, api.users.updateById);
app.delete(     '/api/users/:userid',                       auth, api.users.deleteById);


/* ---------------------------------------------------------------------------------------------- */
// Start server
/* ---------------------------------------------------------------------------------------------- */

var port = process.env.PORT || 9007;
server.listen(port, function () {
    
    var UserModel = mongoose.model('User');

    UserModel.count(function (err, count) {
        if (!err && count === 0) {
            
            console.log('No Users Found! \nCreating default user blimp/blimp .....');
            
            UserModel.create(
                {
                    username : 'blimp',
                    email : 'blimp@d-s.io',
                    password : 'blimp'
                },
                function(err) {
                    if (!err) {
                        console.log('Success: Default user created!');
                    } else {
                        console.log('Error: Creating default user failed!')
                    }
                }
            );
        }
    });
    
    console.log('The express server listening on port %d in %s mode', port, app.get('env'));
});