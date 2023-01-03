if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
mongoose.set("strictQuery", true);

mongoose.connect(process.env.DB_URL);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 200; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const location = `${cities[random1000].city}, ${cities[random1000].state}`;
    const geoData = await geocoder
      .forwardGeocode({
        query: location,
        limit: 1,
      })
      .send();
    const camp = new Campground({
      location,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url: "https://res.cloudinary.com/dmizrqx8s/image/upload/v1672213203/YelpCamp/zb5oddlzr9zuhirgvpbv.png",
          filename: "YelpCamp/zb5oddlzr9zuhirgvpbv",
        },
      ],
      author: "63b1881d7cb3a7817153b0b7",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore sapiente cupiditate deleniti iusto deserunt autem iure dolores quisquam possimus repudiandae. Reiciendis adipisci ullam earum dolores optio. Quasi debitis quidem non",
      price,
      geometry: geoData.body.features[0].geometry,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
