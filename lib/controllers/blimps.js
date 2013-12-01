'use strict';

module.exports = function(mongoose, async, io) {
    var routes = {};

    routes.findAll = function (req, res) {
        return mongoose.model('Blimp').find({}, function (err, resource) {
            if (!err) {
                return res.json(resource);
            } else {
                res.send(400);
                return res.send(err);
            }
        });
    };

    routes.findById = function (req, res) {
        var id = req.params.id;
        mongoose.model('Blimp').findById(id, function (err, resource) {
            if (!err) {
                return res.json(resource);
            } else {
                res.send(400);
                return res.send(err);
            }
        
        });
    };

    routes.createNew = function (req, res) {
        var moniker = require('moniker'),
            monikGen = moniker.generator([moniker.adjective, moniker.noun]),
            name = monikGen.choose(),
            hat = require('hat'),
            uniqueKey = hat();
            
        mongoose.model('Blimp').create(
            {
                name: name,
                apikey: uniqueKey
            },
            function (err, resource) {
                if (!err) {
                    io.sockets.emit('data:update:blimps');
                    return res.json(resource);
                } else {
                    res.send(400);
                    return res.send(err);
                }
            }
        );
    };

    routes.updateById = function (req, res) {
        if (typeof req.body._id !== undefined) {
            delete req.body._id;
        }
        mongoose.model('Blimp').update({ _id: req.params.id }, req.body, function (err, resource) {
            if (!err) {
                io.sockets.emit('data:update:blimps');
                return res.json(resource);
            } else {
                res.send(400);
                return res.send(err);
            }
        
        });
    };

    routes.deleteById = function (req, res) {
        var id = req.params.id;
        mongoose.model('Blimp').findByIdAndRemove(id, function (err, resource) {
            if (!err) {
                io.sockets.emit('data:update:blimps');
                return res.send(200);
            } else {
                res.send(400);
                return res.send(err);
            }
        
        });
    };

    return routes;
};


