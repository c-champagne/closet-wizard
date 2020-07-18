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
            console.log(results[0].image)
            let i;
            let allImg = [];
            for (i = 0; i< results.length; i++) {
                allImg.push(results[i].image)
            }
            console.log(allImg)
            res.render('closet', {
                name: req.user.firstName,
                title: "Clothes",
                imgOne: allImg
                /* userClothing: "test" */
            })
        })
    
    
    
        /* res.render('closet', {
        name: req.user.firstName,
        email: req.user.email,
        title: "Click a tab to begin",
        imgOne: "/images/phShoe.jpg",
        akey: process.env.FILESTACK_APIKEY         
        }) */
    }
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
     db.clothing.create({name:"placeholder", user_id:req.user.id})
        .then(() => res.redirect("/closet"))
})

app.post('/submitImage', function (req, res) {
    /* console.log('submitted')
    console.log(req.body)
    console.log("Here is " + res) */
    let clothingName = (req.body.clothingName)
    let itemHandle = 'https://www.filestackapi.com/api/file/' + (req.body.fsHandle)
    db.clothing.create({name:clothingName, image:itemHandle, user_id:req.user.id})
    .then(() => res.redirect("/closet"))
    /* console.log("Item handle is " + itemHandle) */
    
})

app.get('/closet/clothes', function (req, res) {
    db.clothing.findAll({
        where: {user_id: [req.user.id]}
    })
    .then((results) => {
        console.log(results[0].image)
        let i;
        let allImg = [];
        for (i = 0; i< results.length; i++) {
            allImg.push(results[i].image)
        }
        console.log(allImg)
        res.render('closet', {
            name: req.user.firstName,
            title: "Clothes",
            imgOne: allImg
            /* userClothing: "test" */
        })
    })
    
})

app.get('/closet/outfits', function (req, res) {
    res.render('closet', {
        name: req.user.firstName,
        title: "Outfits",
        imgOne: "/images/phOutfit.jpg"
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

