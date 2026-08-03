const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../Models/listing");
const {isLoggedIn , isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer  = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


router
.route("/explore")
.get(wrapAsync(listingController.index))
.post(
    isLoggedIn ,
    upload.single('listing[image]'),
    validateListing ,
    wrapAsync(listingController.createListing)
)

router
.route("/")
.get(wrapAsync(listingController.home))


//new 
router.get("/new" , 
    isLoggedIn ,
    wrapAsync(listingController.renderNewForm));
    


router
.route("/:id")
    .get( 
    wrapAsync(listingController.showListing))
    .put(
    isLoggedIn, 
    isOwner , 
    upload.single('listing[image]'),
    validateListing , 
    wrapAsync(listingController.updateListing))
    .delete( 
    isLoggedIn, 
    isOwner, 
    wrapAsync(listingController.destroyListing));




//edit
router.get("/:id/edit" ,
    isLoggedIn, 
    isOwner , 
    wrapAsync(listingController.renderEditForm));




module.exports = router;
