require ('dotenv').config()

const express = require('express');
const db = require('./models');
const app = express();
PORT = process.env.PORT;

app.set('view engine', 'ejs');
app.set('views', 'views');

//Passport
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
       // callbackURL: 'http://localhost:3000/auth/google/callback',
       callbackURL: "/auth/google/callback",
       proxy: true 
    },
    function(accessToken, refreshToken, profile, done) {
       console.log(profile.emails[0].value);
       console.log(profile.name.givenName);
        db.user.findOrCreate({ 
            where: {email: profile.emails[0].value}})
            .then(user => {
                return done(null, user)
            })
            .catch(e => {
                return done(e)
            })
    } 
   ));
   
   app.use(passport.initialize());
   app.use(passport.session());
   
   
   
   passport.serializeUser((user, done) => {
       //console.log(user);
       let localUser = [user]
       done(null, user[0].id);
   });
   
   passport.deserializeUser((user, done) => {
       console.log('The user is ' + user);
       db.user.findByPk(user)
       .then(function(user){
           done(null, user);
       })
       .catch(e => {
           return done(e)
       })
   });

app.use(express.static(__dirname + '/public'));


app.get('/', (req,res) => {
    //db.user.create({firstName:'Test', lastName:'Test2', email:'test2@mail.com', password: 'testpw2', avatar:'https://avatars.dicebear.com/api/jdenticon/wowzee.svg'})
    res.render('index.ejs', {
        name: "Test Name"
    })
})

//***********Google log-in route***********
app.get('/auth/google', checkNotAuthenticated,passport.authenticate('google', {
    scope: ['profile', 'email']
    }
    
));

//Google callback URL
app.get('/auth/google/callback', checkNotAuthenticated, 
passport.authenticate('google', {failureRedirect: '/'}),
    (req, res) => {
        console.log(req.body)
        return res.redirect("/closet")
    }
)
//***********end Google routes***********

app.get('/closet', checkAuthenticated, function(req, res) {
    res.render('closet', {
        email: req.user.email           
    })
})

app.listen(PORT, function(){
    console.log(`Listening on ${PORT}..`)
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
       return res.redirect('/closet')
    }
    next()
}