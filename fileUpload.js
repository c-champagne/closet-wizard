require ('dotenv').config()
const client = require('filestack-js').init(process.env.FILESTACK_APIKEY);

const myFile = "./public/images/phOutfit.jpg"

client.upload(myFile).then(
    function(result){
        console.log(result);
    },
    function(error){
        console.log(error);
    }
)

/* document.getElementById("uploadFile").addEventListener("click", function () {
    const options = {
        maxFiles: 5,
        uploadInBackground: false,
        onOpen: () => console.log("opened!"),
        onUploadDone: (res) => console.log (res)
    };
    client.picker(options).open();
}); */

/* document.getElementById("uploadFile").addEventListener("click", function () {
  alert ("Hello")
}); */

function newAlert() {
    alert("Hello!")
}