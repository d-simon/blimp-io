'use strict';

var mongoose = require('mongoose'),
    Thing = mongoose.model('Thing'),
    async = require('async');

exports.findAll = function (req, res) {
    return Thing.find(function (err, things) {
        if (!err) {
            return res.json(things);
        } else {
            return res.send(err);
        }
    });
};

exports.repopulate = function (req, res) {
    Thing.find({}).remove();
    Thing.create({ 
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
            res.send(200);
        } else {
            res.send(err);
        }
    });
};

exports.deleteById = function (req, res) {
    var id = req.params.id;
    Thing.findByIdAndRemove(id, function (err, thing) {
        if (!err) {
            return res.send(200);
        } else {
            return handleError(err);
        }
    
    });
};
