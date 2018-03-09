var express = require('express');
var events = require('events');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var morgan= require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var User            = require('./app/models/users');
var Chat            = require('./app/models/chats');
var configDB = require('./config/database.js');
//database configuration
mongoose.connect(configDB.url); //this will connect the app to the desired databae
//configuring passport
require('./config/passport')(passport);
require('./config/chat');
//setting up the express application
app.use(morgan('dev')); //log every request
app.use(cookieParser()); //read cookies which is helpful for the authorisation
app.use(bodyParser()); //getting the info from the html forms
app.set('view engine', 'ejs'); //using ejs for templating
//requirements for passport
app.use(session({ secret: 'thisischatapp' })); //session secret
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
//handling Event emitter
var eventEmitter = new events.EventEmitter();
// Evenetlistener
eventEmitter.on('save-msg', function(data){
  var chatModel = new Chat({
    email: data.User,
    message: data.Msg
  });
  chatModel.save(function (err) {
    if (err) {
        console.log(err.message);
    } else {
        console.log("Message Inserted successfully");
    }
  });
});


//routes
require('./app/routes.js')(app, passport);
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.ejs');
});
io.on('connection', function(socket){


//socket.broadcast.emit('chat message', 'A new user has just joined the chat');
  socket.on('user',function(data){
    console.log(data+ " came online");
    socket.broadcast.emit('chat message', data+" came online");
    // you can allocate variables in socket.
    socket.user = data;
  });
  socket.on('chat message', function(msg){
    io.emit('chat message', socket.user+' : '+msg);
    var data = {"User":socket.user,"Msg":msg}
    eventEmitter.emit('save-msg',data);

  });
  socket.on('disconnect',function(){
     console.log("some user left the chat");
     socket.broadcast.emit('chat message', socket.user+" left the chat");
  }); //end socket disconnected
});
http.listen(3000, function(){
  console.log('listening on *:3000');
});
