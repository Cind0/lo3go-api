const config = require("config");
const cors = require("cors");
const mongoose = require("mongoose");
const express = require("express");
const app = express();

const cleanBlogImages = require("./utils/cleanBlogImages");

// Include blog routes
const blog = require("./routes/blog");
// const users = require("./routes/users");
const auth = require("./routes/auth");

if (!config.get("jwtPrivateKey")) {
  console.error("FATAL ERROR: jwtPrivateKey is not defined.");
  process.exit(1);
}

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

// Connect to DB
mongoose
  .connect("mongodb://localhost/lo3go", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB..."))
  .catch(() => console.error("Could not connect to MongoDB..."));

// include build-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// expose folder for pictures
app.use("/public", express.static("public"));
app.use(cors({ origin: config.get("origin") }));

// Init routes
app.use("/api/blog", blog);
// app.use("/api/users", users);
app.use("/api/auth", auth);

setInterval(cleanBlogImages, 1000 * 60 * 60 * 24 * 7);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening on port ${port}`));
