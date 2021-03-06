'use strict';

module.exports = function(mongoose, async, io, passportSocketIo) {

    var routes = {};

    routes.findAll = function (req, res, next) {
        return mongoose.model('BlimpReport').find({}, function (err, resource) {
            if (err) {
                return next(err);
            } else if (!resource) {
                return res.send(404);
            } else {
                return res.json(resource);
            }
        });
    };

    routes.findById = function (req, res, next) {
        var rid = req.params.rid;
        if(mongoose.model('BlimpReport').isObjectId(rid)) {
            mongoose.model('BlimpReport').findById(rid, function (err, resource) {
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

    routes.findAllByBlimp = function (req, res, next) {
        if (req.query.identifier && req.query.identifier == 'name') {
            routes.findAllByBlimpName(req, res, next);
        } else {
            routes.findAllByBlimpId(req, res, next);
        }
    };

    routes.findAllByBlimpId = function (req, res, next) {
        var bid = req.params.bid;
        if(mongoose.model('BlimpReport').isObjectId(bid)) {
            return mongoose.model('BlimpReport').find({ _blimp: bid}, function (err, resource) {
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

    routes.findAllByBlimpName = function (req, res, next) {
        var bid = req.params.bid;
        if(bid) {
            mongoose.model('Blimp').findOne({ name: bid }, function (err, resource) {
                if (err) {
                    return next(err);
                } else if (!resource) {
                    return res.send(404);
                } else {
                    return mongoose.model('BlimpReport').find({ _blimp: resource._id}, function (err, resource) {
                        if (err) {
                            return next(err);
                        } else if (!resource) {
                            return res.send(404);
                        } else {
                            return res.json(resource);
                        }
                    });
                }
            });
            
        } else {
            return res.send(400);
        }
    };

    routes.createNew = function (req, res, next) {
        var apikey = req.body.apikey,
            createReport = function (blimp) {
                mongoose.model('BlimpReport')
                    .create(
                        {
                            _blimp:     blimp._id,
                            raw: JSON.stringify(req.body),
                            json: req.body,
                            timestamp:  Math.round(new Date().getTime() / 1000), // Unix Timestamp
                            path:       req.originalUrl,
                            host:       req.host,
                            ip:         req.ip, // Regular IP
                            ips:        req.ips, // IP from "X-Forwarded-For"
                            user_agent: req.useragent
                        },
                        function (err, resource) {
                            if (err) {
                                return next(err);
                            } else {
                                passportSocketIo.forEachAuthedSocket(function (socket) { socket.emit('data:update:reports'); });
                                return res.send(resource);
                            }
                        }
                    );
            };

        if (apikey) {
            return mongoose.model('Blimp').findOne({ apikey: apikey }, function (err, resource) {
                if (err) {
                    return next(err);
                } else if (resource) {
                    return createReport(resource);
                }
                return res.send(403); // Forbidden - Invalid Api Key
            });
        }
        return res.send(400); // Bad Request - No Api Key
    };


    return routes;
};