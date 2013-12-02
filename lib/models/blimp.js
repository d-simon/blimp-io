'use strict';

module.exports = function(mongoose) {
    
    var BlimpSchema = mongoose.Schema({
            name:       { type: String, required: true, unique: true, index: true },
            apikey:     { type: String, required: true, unique: true, index: true },
            reports:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'BlimpReport' }]
        });

    mongoose.model('Blimp', BlimpSchema);
};