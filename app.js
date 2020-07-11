require ('dotenv').config()

const express = require('express');
const db = require('./models');
const app = express();
PORT = process.env.PORT;




app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(__dirname + '/public'));


app.get('/', (req,res) => {
    //db.user.create({firstName:'Test', lastName:'Test2', email:'test2@mail.com', password: 'testpw2', avatar:'https://avatars.dicebear.com/api/jdenticon/wowzee.svg'})
    res.render('index.ejs', {
        name: "Test Name"
    })
})

app.listen(PORT, function(){
    console.log(`Listening on ${PORT}..`)
})