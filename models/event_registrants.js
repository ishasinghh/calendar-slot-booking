const mongoose = require('mongoose');

const eventRegistrantsSchema = new mongoose.Schema({
    eventID:{
        type: String,
        required: true
    },
    userID:{
        type: String,
        required: true
    },
    status:{
        type: String
    }
}
);

module.exports = new mongoose.model('event_registrants', eventRegistrantsSchema);