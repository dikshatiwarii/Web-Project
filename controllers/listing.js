const Listing = require("../Models/listing");

module.exports.index = async (req , res) =>{
    const listings = await Listing.find({});        
    res.render("listings/index.ejs" , { listings });
};

module.exports.home = async (req , res) =>{        
    res.render("listings/home.ejs");
};


module.exports.renderNewForm = async(req ,res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async(req ,res) =>{
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews" , 
        populate: {path: "author"},})
        .populate("owner");


    if(!listing){
        req.flash("error" , "Listing requested does not exist"); 
    }
    res.render("listings/show.ejs" , { listing });
}

module.exports.createListing = async(req , res , next) =>{
    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url, "..", filename);
        const newListing = new Listing(req.body.listing); 
        newListing.owner = req.user._id;
        newListing.image = {url, filename};
        await newListing.save();
        req.flash("success" , "New Listing created");
        res.redirect("/listings/explore");
}

module.exports.renderEditForm = async(req ,res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    let originalImageUrl = listing.image.url;
    originalImageUrl.replace("/upload" , "/upload/w_250");

    res.render("listings/edit.ejs" , { listing , originalImageUrl });
}

module.exports.updateListing = async (req , res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id , {...req.body.listing});

    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
    }
    req.flash("success" , "Listing updated");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async(req , res) =>{
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success" , "Listing deleted");
    res.redirect("/listings/explore");
}