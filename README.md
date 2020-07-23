# closet-wizard

## Intro
This app makes it easier for you to start your day by putting your entire closet at your fingertips. With just a few clicks, you can figure out what to wear before you even get out of bed. 

You can also use the outfit creation feature to pre-plan outfits for the week or special occasions. You can also save images from online stores to help you visualize how that new shirt might work with your existing wardrobe.

## Built With
Closet Wizard was built with Node.js and Express. It utilizes EJS for HTML rendering and Bulma for CSS.


## How it Works
Users can log-in via Google, which was made possible through the use of Passport.js.  Users must be logged in to access the closet page or they will be redirected to the index. Once a user has logged-in, their email is stored in the users table of the database and they are assigned a unique user ID. If this is a user's first time logging-in, they will be redirected to the "New User" page and asked to enter a display name.

Users can upload images using the Clothing Upload Form at the top of the closet page. File uploading is managed using Filestack and the Filestack Picker.  Once a user uploads an image, Filestack returns a handle that is stored in a hidden input field in the form. When the user submits the form, the data is stored in the clothing table of the database.  Queries in the Express routes locate the data based on the current user's ID and displays it on the page via EJS.

To create an outfit, users can click on the Launch Outfit Creator button and the Outfit Creation Form will display in a modal. All of the user's uploaded images will be listed and sorted by type of clothing.  Users can select one top/full body item, one bottom item, and one pair of shoes.  Once the user names the outfit and submits the form, this data is stored in the outfits table of the database.

## Future Features
Deleting items/outfits
Favoriting outfits
Random outfit suggestion
Adding tags to clothing items based on color, style, or season

## Hurdles
Learning how to implement Filestack and getting it to work in a way that passed the file handle to the form without any input from the user was one of the early hurdles.

My initial plan was to have the clothing and outfit tables communicate to each other as a many-to-many relationship and query on that in order to create the outfit displays, but I was having a difficult time getting my data back from the database in a way that made it possible to render the item images while also clearly separating them into distinct outfits.  

In the interest of getting the application ready on time, I made the choice to add additional columns to the outfits table to store the images for the outfit pieces.  While this limits the possible combinations a user can make, it allows for clear rendering of a completed outfit.  To further improve this, I would like to work more on the many-to-many querying or I could add additional columns to the outfits table to store more pieces.
