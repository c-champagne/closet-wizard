require ('dotenv').config()

const express = require('express');
const app = express();
const session = require('express-session');
const db = require('./models');
PORT = process.env.PORT;

const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: "ASECRET"
}));

app.use(bodyParser.urlencoded({extended: true}));


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
       console.log(user);
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
app.use(bodyParser.json());


app.get('/', (req,res) => {
    //db.user.create({firstName:'Test', lastName:'Test2', email:'test2@mail.com', password: 'testpw2', avatar:'https://avatars.dicebear.com/api/jdenticon/wowzee.svg'})
    res.render('index.ejs', {
        name: "Test Name"
    })
})

//***********Google log-in route***********
app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
    }
    
));

//Google callback URL
app.get('/auth/google/callback', 
passport.authenticate('google', {failureRedirect: '/'}),
    (req, res) => {
        console.log("This is the callback " + req.user.id)
        return res.redirect("/closet")}
)
//***********end Google routes***********

app.get('/closet', checkAuthenticated, function(req, res) {
    console.log("In closet" + req.user.firstName)
    if (req.user.firstName === null) {
        res.render('newUser')
    } else {
    res.render('closet', {
        name: req.user.firstName,
        email: req.user.email,
        /* email: profile.emails[0].value */         
    })}
})

app.get('/newUser', checkAuthenticated, function(req, res) {
    res.render('newUser', {

    })
})


app.post('/submitUser', function (req, res) {
    console.log(req.body.newName)
    let name = (req.body.newName)
    db.user.update(
        {firstName: name},
        {where: {id: req.user.id}})
        .then(() => res.redirect("/closet"))
})

app.listen(PORT, function(){
    console.log(`Listening on ${PORT}..`)
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        console.log("Yes, checkAuthenticated")
        return next()
    }
    console.log("No, checkAuthenticated")
    res.redirect('/')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        console.log("Yes, checkNotAuth")
       return res.redirect('/closet')
    }
    console.log("No, checkNotAuth")
    next()
}