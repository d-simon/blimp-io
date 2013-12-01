'use strict';

module.exports = function(mongoose) {
    
    var bcrypt = require('bcrypt');
    var UserSchema = new mongoose.Schema({
            username: { type: String, required: true, unique: true },
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true}
        });

    // Validations
    UserSchema.path('username').validate(function (str) {
            return (typeof str === undefined) ? false : str.length >= 4 && str.length <= 32;
        },
        'Username must be between 4 - 32 characters.'
    );

    UserSchema.path('password').validate(function (str) {
            return (typeof str === undefined) ? false : str.length >= 4 && str.length <= 32;
        },  
        'Password must be between 4 - 32 characters.'
    );

    // Bcrypt middleware
    UserSchema.pre('save', function(next) {
         var user = this;

        if (!user.isModified('password')) {
            return next();
        }

        bcrypt.genSalt(10, function(err, salt) {
                if (err) {
                    return next(err);
                }

                bcrypt.hash(user.password, salt, function(err, hash) {
                        if (err) {
                            return next(err);
                        }
                        user.password = hash;
                        next();
                });
        });
    });

    // Password verification
    UserSchema.methods.comparePassword = function(candidatePassword, callback) {
        bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
                if (err) {
                    return callback(err);
                }
                callback(null, isMatch);
        });
    };

    mongoose.model('User', UserSchema);
};



