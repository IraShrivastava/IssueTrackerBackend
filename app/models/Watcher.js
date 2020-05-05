'use strict'

const mongoose = require('mongoose');
 const Schema = mongoose.Schema;

let WatcherSchema = new Schema({  
    watcherId: 
    {
        type: String,
        index: true,
    },
    issueId: { type: String },
    userId: {type: String},
    userName: {type: String }

})

module.exports= mongoose.model('watcher', WatcherSchema);