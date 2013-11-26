'use strict';

module.exports = function(mongoose, async, io) {
    var routes = {};

    routes.findAll = function (req, res) {
        return mongoose.model('Thing').find(function (err, things) {
            if (!err) {
                return res.json(things);
            } else {
                return res.send(err);
            }
        });
    };

    routes.repopulate = function (req, res) {
        //mongoose.model('Thing').find({}).remove();
        mongoose.model('Thing').create({ 
            name : 'HTML5 Boilerplate',
            info : 'HTML5 Boilerplate is a professional front-end template for building fast, robust, and adaptable web apps or sites.',
            awesomeness: 10
        }, {
            name : 'AngularJS',
            info : 'AngularJS is a toolset for building the framework most suited to your application development.',
            awesomeness: 10
        }, {
            name : 'Karma',
            info : 'Spectacular Test Runner for JavaScript.',
            awesomeness: 10
        }, {
            name : 'Express',
            info : 'Flexible and minimalist web application framework for node.js.',
            awesomeness: 10
        }, {
            name : 'MongoDB + Mongoose',
            info : 'An excellent document database. Combined with Mongoose to simplify adding validation and business logic.',
            awesomeness: 10
        }, function(err) {
            if (!err) {
                console.log('finished populating things');
                io.sockets.emit('awesomeThings:updated');
                res.send(200);
            } else {
                res.send(err);
            }
        });
    };

    routes.deleteById = function (req, res) {
        var id = req.params.id;
        mongoose.model('Thing').findByIdAndRemove(id, function (err, thing) {
            if (!err) {
                io.sockets.emit('awesomeThings:updated');
                return res.send(200);
            } else {
                return handleError(err);
            }
        
        });
    };

    return routes;
};


