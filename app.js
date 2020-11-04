require ('dotenv').config()

//Express server setup
const express = require('express');
const app = express();
const session = require('express-session');
const db = require('./models');
const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESS_SECRET
}));

app.use(bodyParser.urlencoded({extended: true}));


//Passport
const passport = require('passport');
const { response } = require('express');
const { Sequelize } = require('sequelize');

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
       callbackURL: "/auth/google/callback",
       proxy: true 
    },
    function(accessToken, refreshToken, profile, done) {
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
       let localUser = [user]
       done(null, user[0].id);
   });
   
   passport.deserializeUser((user, done) => {
       db.user.findByPk(user)
       .then(function(user){
           done(null, user);
       })
       .catch(e => {
           return done(e)
       })
   });
//End Passport

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.render('index.ejs')
})

//***********Google log-in routes***********
app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
    }
    
));

//Google callback URL
app.get('/auth/google/callback', 
passport.authenticate('google', {failureRedirect: '/'}),
    (req, res) => {
        return res.redirect("/closet")}
)
//***********end Google routes***********

app.get('/closet', checkAuthenticated, function(req, res, next) {
    if (req.user.firstName === null) {
        res.render('newUser')
    } else {
        db.clothing.findAll({
            where: {user_id: [req.user.id]}
        })
        .then((results) => {
            let i;
            let allImg = [];
            let userClothes = results;
            for (i = 0; i < results.length; i++) {
                allImg.push(results[i].image)
            }
            res.render('closet', {
                name: req.user.firstName,
                title: "Clothes",
                imgOne: allImg,
                clothing: userClothes
            })
        })
        .catch(e => {
            return next(e)
        })
    }
})

//this page is only visted when the user is signing in for the first time and will be asked to enter a preferred name.
app.get('/newUser', checkAuthenticated, function(req, res) {
    res.render('newUser')
})

app.post('/submitUser', function (req, res, next) {
    let name = (req.body.newName)
    db.user.update(
        {firstName: name},
        {where: {id: req.user.id}})
     db.clothing.create({name:"placeholder", user_id:req.user.id})
        .then(() => res.redirect("/closet"))
        .catch(e => {
            return next(e)
        })
})

//Defining the submitted clothing item and storing it in the clothing table of the db.
app.post('/submitImage', function (req, res, next) {
    let clothingName = (req.body.clothingName)
    let clType = (req.body.clType)
    let clColor = (req.body.clColor)
    let itemHandle = 'https://www.filestackapi.com/api/file/' + (req.body.fsHandle)
    db.clothing.create({name:clothingName, type:clType, colors:clColor, image:itemHandle, user_id:req.user.id})
    .then(() => res.redirect("/closet"))
    .catch(e => {
        return next(e)
    })
    
})

//Defining the submitted outfit and storing it in the outfit table of the db.
app.post('/submitOutfit', function (req, res, next) {
    let outfitName = (req.body.outfitName);
    let outfitTop = (req.body.topFull);
    let outfitBottom = (req.body.bottom);
    let outfitShoes = (req.body.shoes);
    db.outfit.create({name:outfitName, user_id:req.user.id, top:outfitTop, bottom:outfitBottom, shoes:outfitShoes})
    .then(() => res.redirect("/closet/outfits"))
    .catch(e => {
        return next(e)
    })
    
})

app.post('/deleteItem', function (req, res, next) {
    db.clothing.destroy({
        where: {
            id:req.body.itemID
        }
        })
    .then(() => res.redirect("/closet"))
    .catch(e => {
        return next(e)
    })
})

app.post('/deleteOutfit', function (req, res, next) {
    db.outfit.destroy({
        where: {
            id:req.body.outfitID
        }
        })
    .then(() => res.redirect("/closet/outfits"))
    .catch(e => {
        return next(e)
    })
})

app.get('/closet/outfits', checkAuthenticated, function (req, res, next) {
     db.clothing.findAll({
        where: {user_id: [req.user.id]}
    })
    .then((results) => {
        let userClothes = results;
         db.outfit.findAll({

             where: {user_id: [req.user.id]}
         })
         .then((results) => {
             let userOutfits = results;
             res.render('outfits', {
                name: req.user.firstName,
                clothing: userClothes,
                outfits: userOutfits
         })
    })
    .catch(e => {
        return next(e)
    })
        }).catch(e => {
            return next(e)
        }) 
    }) 

app.listen(process.env.PORT, function(){
    console.log(`Listening on ${process.env.PORT}..`)
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/')
}

