'use strict';

module.exports = function(mongoose, async, io, passportSocketIo) {
    
    var routes = {};

    routes.findAll = function (req, res, next) {
        return mongoose.model('Blimp').find({}, function (err, resource) {
            if (err) {
                return next(err);
            } else {
                return res.json(resource);
            }
        });
    };

    routes.find = function (req, res, next) {
        if (req.query.identifier && req.query.identifier == 'name') {
            routes.findByName(req, res, next);
        } else {
            routes.findById(req, res, next);
        }
    }

    routes.findById = function (req, res, next) {
        var bid = req.params.bid;
        if(mongoose.model('Blimp').isObjectId(bid)) {
            mongoose.model('Blimp').findById(bid, function (err, resource) {
                if (err) {
                    return next(err);
                } else if (!resource) {
                    return res.send(404);
                } else {
                    return res.json(resource);
                }
            });
        } else {
            return res.send(400);
        }
    };

    routes.findByName = function (req, res, next) {
        var bid = req.params.bid;
        mongoose.model('Blimp').findOne({ name: bid }, function (err, resource) {
            if (err) {
                return next(err);
            } else if (!resource) {
                return res.send(404);
            } else {
                return res.json(resource);
            }
        });
    };

    routes.createNew = function (req, res, next) {
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
                if (err) {
                    return next(err);
                } else {
                    passportSocketIo.forEachAuthedSocket(function (socket) { socket.emit('data:update:blimps'); });
                    return res.json(resource);
                }
            }
        );
    };

    routes.update = function (req, res, next) {

        var bid = req.params.bid,
            query = { _id: bid };
        
        if (req.query.identifier && req.query.identifier == 'name') {
            query = { name: bid };
        }

        if (typeof req.body._id !== undefined) {
            delete req.body._id;
        }

        mongoose.model('Blimp').update(query, req.body, function (err, resource) {
            if (err) {
                return next(err);
            } else {
                passportSocketIo.forEachAuthedSocket(function (socket) { socket.emit('data:update:blimps'); });
                return res.json(resource);
            }
        });
    };

    routes.delete = function (req, res, next) {
        if (req.query.identifier && req.query.identifier == 'name') {
            routes.deleteByName(req, res, next);
        } else {
            routes.deleteById(req, res, next);
        }
    };

    routes.deleteById = function (req, res, next) {
        var bid = req.params.bid;
        mongoose.model('Blimp').findByIdAndRemove(bid, function (err, resource) {
            if (err) {
                return next(err);
            } else {
                passportSocketIo.forEachAuthedSocket(function (socket) { socket.emit('data:update:blimps'); });
                return res.send(200);
            }
        });
    };

    routes.deleteByName = function (req, res, next) {
        var bid = req.params.bid;
        mongoose.model('Blimp').findByIdAndRemove(bid, function (err, resource) {
            if (err) {
                return next(err);
            } else {
                passportSocketIo.forEachAuthedSocket(function (socket) { socket.emit('data:update:blimps'); });
                return res.send(200);
            }
        });
    };

    return routes;
};


