'use strict';

module.exports = function(mongoose) {
    
    var BlimpReportSchema = mongoose.Schema({
            _blimp:     { type: mongoose.Schema.Types.ObjectId, ref: 'Blimp', required: true },
            raw: { type: String },
            json: { type: mongoose.Schema.Types.Mixed },
            timestamp:  { type: Number },
            path:       { type: String },
            host:       { type: String },
            ip:         { type: String }, // Regular IP
            ips:        { type: String }, // IP from "X-Forwarded-For"
            user_agent: { type: String }
        });
    
    mongoose.model('BlimpReport', BlimpReportSchema);
};