'use strict';

module.exports = function(mongoose, async, io) {
    var routes = {};

    routes.findAll = function (req, res) {
        return mongoose.model('User').find({}, function (err, resource) {
            if (!err) {
                var users = [];
                for (var i = 0; i < resource.length; i++) {
                    users.push({ _id: resource[i]._id, username: resource[i].username, email: resource[i].email });
                };
                return res.json(users);
            } else {
                res.send(400);
                return res.send(err);
            }
        });
    };

    routes.findById = function (req, res) {
        var id = req.params.id;
        mongoose.model('User').findById(id, function (err, resource) {
            if (!err) {
                return res.json({ _id: resource._id, username: resource.username, email: resource.email });
            } else {
                res.send(400);
                return res.send(err);
            }
        
        });
    };

    routes.createNew = function (req, res) {
        mongoose.model('User').create(req.body, function (err, resource) {
            if (!err) {
                io.sockets.emit('data:update:users');
                return res.json({ _id: resource._id, username: resource.username, email: resource.email });
            } else {
                res.send(400);
                return res.send(err);
            }
        });
    };

    routes.updateById = function (req, res) {
        if (typeof req.body._id !== undefined) {
            delete req.body._id;
        }
        mongoose.model('User').update({ _id: req.params.id }, req.body, function (err, resource) {
            if (!err) {
                io.sockets.emit('data:update:users');
                return res.json({ _id: resource._id, username: resource.username, email: resource.email });
            } else {
                res.send(400);
                return res.send(err);
            }
        
        });
    };

    routes.deleteById = function (req, res) {
        var id = req.params.id;
        mongoose.model('User').findByIdAndRemove(id, function (err, resource) {
            if (!err) {
                io.sockets.emit('data:update:users');
                return res.send(200);
            } else {
                res.send(400);
                return res.send(err);
            }
        
        });
    };

    return routes;
};


