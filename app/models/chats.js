var mongoose = require('mongoose');
var chatSchema = mongoose.Schema({
     email         : String,
     message       : String,
     date          : { type: Date, default: Date.now }
});
// create the model for chat and expose it to our app
module.exports = mongoose.model('Chat', chatSchema);
