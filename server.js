const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require("cors");

const users = require("./routes/api/users");
const messages = require("./routes/api/messages");

const app = express();


// var http = require('http').Server(app)
// var io = require('socket.io')(http)

// Port that the webserver listens to
const port = process.env.PORT || 5000;

const server = app.listen(port, () =>
  console.log(`Server running on port ${port}`)
);

const io = require("socket.io").listen(server);

io.on('connection', (socket)=>{
  /*from server side we will emit 'display' event once the user starts typing
  so that on the client side we can capture this event and display 
  '<data.user> is typing...' */
  socket.on('typings', (data)=>{
    console.log(socket.id);
    if(data.typing==true){
      io.emit('display', data)
      //  console.log(socket.id);
      //  socket.broadcast.to(socket.id).emit('display', data);
    }
    else{
      io.emit('display', data)
      //  socket.broadcast.to(socket.id).emit('display', data);
    }
  })
}) 

// Body Parser middleware to parse request bodies
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

// CORS middleware
app.use(cors());

// Database configuration
const db = require("./config/keys").mongoURI;

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Successfully Connected"))
  .catch((err) => console.log(err));

// Passport middleware
app.use(passport.initialize());
// Passport config
require("./config/passport")(passport);

// Assign socket object to every request
app.use(function (req, res, next) {
  req.io = io;
  next();
});

// Routes
app.use("/api/users", users);
app.use("/api/messages", messages);

if (process.env.NODE_ENV === 'production') {
  // Exprees will serve up production assets
  app.use(express.static('client/build'));

  
  // app.get('*', (req, res) => {
  //   res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  // });
}

// Express serve up index.html file if it doesn't recognize route
const path = require('path');
app.get('*', (request, response) => {
	response.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});