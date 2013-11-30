'use strict';

module.exports = function(mongoose) {
    
    var BlimpSchema = mongoose.Schema({
            name: { type: String, required: true, unique: true }
        });

    // Validations

    mongoose.model('Blimp', BlimpSchema);
};