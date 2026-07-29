const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/TripNest");
};

main()
.then(() => {
    console.log("connected to DB");
})
.catch((err) => {
    console.log(err);
});

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data.map((obj) => ({...obj , owner : "6a65a963a7e12385765233c8" }));
    await Listing.insertMany(initData.data);
    console.log("data was initialised");
};

initDB();

