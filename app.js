const express = require('express');
const cookieSession = require('cookie-session');
const passport = require('passport');
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');
const chatRoutes = require('./routes/chat-routes');
const discoverRoutes = require('./routes/discover-routes');
const passportSetup = require('./config/passport-setup');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const mongoClient = require('mongodb');

const session = require('express-session');
const RedisStore = require("connect-redis")(session);

const app = express();
const http = require('http').Server(app); 
const socket = require('socket.io'); 
// set view engine
app.set('views', __dirname + '/views');
app.set('view engine', "ejs");
app.engine('ejs', require('ejs').__express);
app.use(express.static(__dirname + '/public'));

// set up session cookies
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [keys.session.cookieKey]
}));

app.use(express.static('public'));

//Set up session
sess = session({
    secret: 'secret',
    store: new RedisStore({}),
    saveUninitialized: true,
    resave: true
});

app.use(sess);

var io = require('socket.io').listen(http);
io.on('connection', function (socket) {
    console.log('made connection',socket.id)
    socket.emit('message', { message: 'welcome to the chat' });
    
    socket.on('chat', function (data) {
        io.sockets.emit('message', data);
    });
});

// io.use(function(socket, next) {
//     sess(socket.request, socket.request.res, next);
//     console.log('socket')
// });

// initialize passport
app.use(passport.initialize());
app.use(passport.session());


// connect to mongodb
mongoose.connect(keys.mongodb.dbURI, () => {
    console.log('connected to mongodb');
});



// set up routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/chat',chatRoutes);
app.use('/discover',discoverRoutes);

// create home route
app.get('/', (req, res) => {
    res.render('home', { user: req.user });
});

http.listen(3000, () => {
    console.log('app now listening for requests on port 3000');
});