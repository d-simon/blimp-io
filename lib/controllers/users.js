'use strict';

module.exports = function(mongoose, async, io) {
    var routes = {},
    emitUpdate = function () {
            passportSocketIo
                .filterSocketsByUser(io, function (user) {
                    return user.logged_in === true;
                })
                .forEach(function (socket) {
                    socket.emit('data:update:users');
                });
        };

    routes.findAll = function (req, res, next) {
        return mongoose.model('User').find({}, function (err, resource) {
            if (err) {
               return next(err);
            } else {
                var users = [];
                for (var i = 0; i < resource.length; i++) {
                    users.push({ _id: resource[i]._id, username: resource[i].username, email: resource[i].email });
                };
                return res.json(users);
            }
        });
    };

    routes.findById = function (req, res, next) {
        var userid = req.params.userid;
        mongoose.model('User').findById(userid, function (err, resource) {
            if (err) {
               return next(err);
            } else if (!resource) {
                return res.send(404);
            } else {
                return res.json({ _id: resource._id, username: resource.username, email: resource.email });
            }
        
        });
    };

    routes.createNew = function (req, res, next) {
        mongoose.model('User').create(req.body, function (err, resource) {
            if (err) {
               return next(err);
            } else {
                emitUpdate();
                return res.json({ _id: resource._id, username: resource.username, email: resource.email });
            }
        });
    };

    routes.updateById = function (req, res, next) {
        if (typeof req.body._id !== undefined) {
            delete req.body._id;
        }
        var userid = req.params.id;
        mongoose.model('User').update({ _id: userid }, req.body, function (err, resource) {
            if (err) {
               return next(err);
            } else {
                emitUpdate();
                return res.json({ _id: resource._id, username: resource.username, email: resource.email });
            }
        });
    };

    routes.deleteById = function (req, res, next) {
        var userid = req.params.userid;
        mongoose.model('User').findByIdAndRemove(userid, function (err, resource) {
           if (err) {
               return next(err);
            } else {
                emitUpdate();
                return res.send(200);
            }
        });
    };

    return routes;
};


