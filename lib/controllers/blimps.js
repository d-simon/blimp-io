'use strict';

module.exports = function(mongoose, async, io, passportSocketIo) {
    var routes = {},
        emitUpdate = function () {
            passportSocketIo
                .filterSocketsByUser(io, function (user) {
                    return user.logged_in === true;
                })
                .forEach(function (socket) {
                    socket.emit('data:update:blimps');
                });
        };

    routes.findAll = function (req, res, next) {
        return mongoose.model('Blimp').find({}, function (err, resource) {
            if (err) {
                return next(err);
            } else {
                return res.json(resource);
            }
        });
    };

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
        var bname = req.params.bname;
        mongoose.model('Blimp').findOne({ name: bname }, function (err, resource) {
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
                    emitUpdate();
                    return res.json(resource);
                }
            }
        );
    };

    routes.updateById = function (req, res, next) {
        if (typeof req.body._id !== undefined) {
            delete req.body._id;
        }
        var bid = req.params.bid;
        mongoose.model('Blimp').update({ _id: bid }, req.body, function (err, resource) {
            if (err) {
                return next(err);
            } else {
                emitUpdate();
                return res.json(resource);
            }
        });
    };

    routes.deleteById = function (req, res, next) {
        var bid = req.params.bid;
        mongoose.model('Blimp').findByIdAndRemove(bid, function (err, resource) {
            if (err) {
                return next(err);
            } else {
                emitUpdate();
                return res.send(200);
            }
        });
    };

    return routes;
};


