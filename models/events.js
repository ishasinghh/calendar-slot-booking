const mongoose = require('mongoose');

const eventschema = new mongoose.Schema({
    topic: {
        type: String,
        required : true
    },
    location:{
        type: String
    },
    description:{
        type: String
    },
    startDate:{
        type : Date, default: Date.now 
    },
    endDate:{
        type : Date, default: Date.now   
    },
    duration:{
        type: Number
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

module.exports = new mongoose.model('event', eventschema);