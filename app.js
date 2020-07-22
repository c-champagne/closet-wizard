require ('dotenv').config()

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
       // callbackURL: 'http://localhost:3000/auth/google/callback',
       callbackURL: "/auth/google/callback",
       proxy: true 
    },
    function(accessToken, refreshToken, profile, done) {
       /* console.log(profile.emails[0].value);
       console.log(profile.name.givenName); */
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
       /* console.log(user); */
       let localUser = [user]
       done(null, user[0].id);
   });
   
   passport.deserializeUser((user, done) => {
       /* console.log('The user is ' + user); */
       db.user.findByPk(user)
       .then(function(user){
           done(null, user);
       })
       .catch(e => {
           return done(e)
       })
   });
//End Passport
const client = require('filestack-js').init(process.env.FILESTACK_APIKEY);
/* const options = {
    maxFiles: 5,
    uploadInBackground: false,
    onOpen: () => console.log("opened!"),
    onUploadDone: (res) => console.log (res.filesUploaded[0].handle),
    onFileUploadFailed: () => console.log('failed'),}
const picker = client.picker(options); */

/* const form = document.getElementById('pick-form');
const fileInput = document.getElementById('fileupload');
const btn = document.getElementById('picker');
const nameBox = document.getElementById('nameBox');
const urlBox = document.getElementById('urlBox');

btn.addEventListener('click', function (e) {
    e.preventDefault();
    picker.open();
})

form.addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Submitting' + fileInput.value);
});

function updateForm (result) {
    const fileData = result.filesUploaded[0];
    fileInput.value = fileData.url;
} */



app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());


app.get('/', (req,res) => {
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
        console.log("This is the callback " + req.user.id)
        return res.redirect("/closet")}
)
//***********end Google routes***********

app.get('/closet', checkAuthenticated, function(req, res) {
    console.log("In closet" + req.user.firstName)
    if (req.user.firstName === null) {
        res.render('newUser')
    } else {
        db.clothing.findAll({
            where: {user_id: [req.user.id]}
        })
        .then((results) => {
            /* console.log(results) */
            let i;
            let allImg = [];
            let userClothes = results;
            for (i = 0; i< results.length; i++) {
                allImg.push(results[i].image)
            }
            /* console.log(allImg) */
            res.render('closet', {
                name: req.user.firstName,
                title: "Clothes",
                imgOne: allImg,
                clothing: userClothes
                /* userClothing: "test" */
            })
        })
    }
})

app.get('/newUser', checkAuthenticated, function(req, res) {
    res.render('newUser', {
    })
})

app.post('/submitUser', function (req, res) {
   /*  console.log(req.body.newName) */
    let name = (req.body.newName)
    db.user.update(
        {firstName: name},
        {where: {id: req.user.id}})
     db.clothing.create({name:"placeholder", user_id:req.user.id})
        .then(() => res.redirect("/closet"))
})

app.post('/submitImage', function (req, res) {
    /* console.log('submitted')
    console.log(req.body)
    console.log("Here is " + res) */
    let clothingName = (req.body.clothingName)
    let clType = (req.body.clType)
    let itemHandle = 'https://www.filestackapi.com/api/file/' + (req.body.fsHandle)
    db.clothing.create({name:clothingName, type:clType, image:itemHandle, user_id:req.user.id})
    .then(() => res.redirect("/closet"))
    /* console.log("Item handle is " + itemHandle) */
    
})

app.post('/submitOutfit', function (req, res) {
   /*  console.log('submitted')
    console.log(req.body)
    console.log("Here is " + res) */
    console.log("submit", req.body);
    let outfitName = (req.body.outfitName);
    let outfitTop = (req.body.topFull);
    let outfitBottom = (req.body.bottom);
    let outfitShoes = (req.body.shoes);
    db.outfit.create({name:outfitName, user_id:req.user.id, top:outfitTop, bottom:outfitBottom, shoes:outfitShoes})
    /* .then((results) => {
        console.log((results))
         for (i=0; i<clothes.length; i++) {
            db.clothingOutfit.create({clothing_id:clothes[i], outfit_id: results.id})
        }       
    }) */
    .then(() => res.redirect("/closet/outfits"))
    
})

app.get('/closet/clothes', function (req, res) {
    db.clothing.findAll({
        where: {user_id: [req.user.id]}
    })
    .then((results) => {
        let userClothes = results;
        res.render('closet', {
            name: req.user.firstName,
            title: "Clothes",
            imgOne: allImg,
            clothing: userClothes
        })
    })
    
})

/* app.get('/closet/outfits', function (req, res) {
    db.clothing.findAll({
        where: {user_id: [req.user.id]}
    })
    .then((results) => {
        let userClothes = results;
        db.outfit.findAll({
            raw: true,
            where: {user_id: [req.user.id]}
        })
        console.log("Outfits:", results.id) 
        let userOutfits = [];
        for (i=0; i < results.length; i++) {
            userOutfits.push(results[i].id)
        }
        console.log("IDs", userOutfits) 
        db.clothingOutfit.findAll({
            raw: true,
            where: {
                outfit_id: {
                    [Sequelize.Op.in]: userOutfits
                }
            }
        })
    .then((results) => {
        console.log("Joins:", results) 
        db.clothing.findAll({
            where: {id: [results.clothing_id]}
        })
        res.render('outfits', {
            name: req.user.firstName,
            clothing: userClothes,
            outfits:
        }) 
        })
})
}) */

/* app.get('/closet/outfits', function (req, res) {
    db.clothing.findAll({
        where: {user_id: [req.user.id]}
    })
        .then((results) => {
            let userClothes = results;
        })
    db.outfit.findAll({
        where: {user_id: [req.user.id]}
    })
    .then((results) => {
        res.render('outfits', {
            name: req.user.firstName,
            clothing: userClothes
        })
    })
}) */

app.get('/closet/outfits', function (req, res) {
     db.clothing.findAll({
        where: {user_id: [req.user.id]}
    })
    .then((results) => {
        let userClothes = results;
        let renderImages = [];
         db.outfit.findAll({
             
             /* include: [{
                 model: db.clothing,
                 attributes: ['name', 'image'],
                 where: {user_id: [req.user.id]}
             }] */
             where: {user_id: [req.user.id]}
         })
         .then((results) => {
             let userOutfits = results;
             res.render('outfits', {
                name: req.user.firstName,
                clothing: userClothes,
                outfits: userOutfits
         })
        /* .then((results) => {
            for(i=0; i < results.length; i++) {
                results[i].clothings.forEach(element => renderImages.push(element.image))
            }
            
            }) */ 
        /* console.log("What is this", renderImages)
        console.log("CO", results[0].clothings[0]) */
    })
        }) 
    }) 


app.listen(process.env.PORT, function(){
    console.log(`Listening on ${process.env.PORT}..`)
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

