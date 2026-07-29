if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

console.log(process.env.CLOUD_NAME);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js"); 
const session = require("express-session");
const MongoStore = require('connect-mongo').default;
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy= require("passport-local");
const passportLocalMongoose= require("passport-local-mongoose");
const User = require("./Models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;


const dns = require("node:dns/promises");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

async function main() {
    try {
        await mongoose.connect(process.env.ATLASDB_URL);
        console.log("MongoDB Connected Successfully");
    } catch(err) {
        console.log("MongoDB Error:", err);
    }
}

main();


app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "views"));
app.use(express.urlencoded({ extended : true}));
app.use(methodOverride("_method"));
app.engine("ejs" , ejsMate);
app.use(express.static(path.join(__dirname, "public")));


const secret = process.env.SECRET;

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: secret,
    touchAfter: 24 * 3600,
});

store.on("error" , (err) =>{
    console.log("ERROR in MONGO SESSION STORE", err);
})


const sessionOptions = {
    store, 
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};


app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate())); 

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.get("/" , (req , res) => {
//     res.send("HI!! I am root");
// });




app.use((req , res , next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


app.use("/listings" , listingRouter);
app.use("/listings/:id/reviews" , reviewRouter);
app.use("/" , userRouter);

app.get("/coming-soon", (req, res) => {
    res.render("listings/comingSoon.ejs");
});



app.all("*" , (req , res , next) => {
    next(new ExpressError(404 , "Page not found!"));
});


app.use((err ,req , res, next) => {
    let { statusCode = 500 ,  message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs" , { err , success: [] , error: [] , currUser: req.user || null})
    // res.status(statusCode).send(message);
    
});

app.listen(8080 , () => {
    console.log("listening to port");
});