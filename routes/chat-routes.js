const router = require('express').Router();
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const passport = require('passport')
const redis = require('redis');

const authCheck = (req, res, next) => {
    if(!req.user){
        res.redirect('/auth/login');
    } else {
        next();
    }
};

router.get('/', authCheck, (req, res) => {
    res.render('chat', { user: req.user });
});



const redisClient = redis.createClient({
    host : 'localhost',
    port : 6379
});

const chatroomName = 'SaviorChat';

const expressSession = require('express-session');
const RedisStore = require('connect-redis')(expressSession);
const socketIOSession = require("socket.io.session");

const sessionStore = new RedisStore({
  client: redisClient,
  unset: "destroy"
});
const settings = {
  store: sessionStore,
  secret: "supersecret",
  cookie: { "path": '/', "httpOnly": true, "secure": false,  "maxAge": null }
}

app.use(expressSession(settings));
io.use(socketIOSession(settings).parser);

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }

  res.redirect('/login');
}

// require('dotenv').config()

// app.use(session({
//   secret: 'supersecret'
// }));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user,done)=>{
    done(null,user);
});

passport.deserializeUser((user,done)=>{
    done(null,user);
});


// app.post("/chats", async (req, res) => {
//     try {
//         var chats = new chat(req.body)
//         await chats.save()
//         res.sendStatus(200)
//     } catch (error) {
//         res.sendStatus(500)
//         console.error(error)
//     }
// })
// passport.use(new FacebookStrategy({
//   clientID: process.env.FACEBOOK_ID,
//   clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
//   callbackURL: `http://localhost:3000/auth/facebook/callback`
// }, (accessToken, refreshToken, profile, cb)=>{
//       return cb(null,{profile:profile,accessToken:accessToken});
//   }
// )); 

// app.get('/auth/facebook/callback',
//   passport.authenticate('facebook', { failureRedirect: '/login' }),
//   function(req, res) {
//     // Successful authentication, redirect home.
//     res.redirect('/');
// });

// app.use(express.static(__dirname + '/public'));

// app.get('/login', (req, res) => {
//   res.sendFile(__dirname + '/views/login.html');
// });

// app.get('/', isLoggedIn, (req, res) => {
//   console.log('this is from express', req.user);
//   res.sendFile(__dirname + '/views/index.html');
// });

// io.on('connection', function(socket){
//   // THIS IS THE POINT WHERE...
//   console.log('a user has connected to our socket.io server');
//   console.log('this is from socket.io', socket.session.passport);
  
//   if (!socket.session.passport) {
//     socket.emit('unauthorized')
//   } else {
//     const user = socket.session.passport.user;

//     redisClient.lrange(chatroomName, 0, 20, (err, messages) => {
//       if (err) {
//         console.log(err);
//         io.emit('chat error', 'SORRY! Something\'s wrong :(');
//         return;
//       }
//       messages.reverse();
//       socket.emit('initial messages', messages);
//     });

//     socket.on('chat message', function(msg){
//       const wholeMessage = user.profile.displayName + ": " + msg;

//       redisClient.lpush(chatroomName, wholeMessage, (err) => {
//         if (err) {
//           console.log(err);
//           io.emit('chat error', 'SORRY! Something\'s wrong :(');
//           return;
//         }
//         io.emit('chat message', wholeMessage);
//       })
//     });

//     socket.on('I NEED MORE', function(count) {
//       console.log(-count-20, -count);
//       redisClient.lrange(chatroomName, count, count + 20, (err, messages) => {
//         console.log(messages);
//         if (err) {
//           console.log(err);
//           io.emit('chat error', 'SORRY! Something\'s wrong :(');
//           return;
//         }
//         socket.emit('your messages', messages);
//       });
//     });
//   }
// });

module.exports = router;