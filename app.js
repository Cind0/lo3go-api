const config = require("config");
const cors = require("cors");
const mongoose = require("mongoose");
const express = require("express");
const app = express();

// Include blog routes
const blog = require("./routes/blog");
// const users = require("./routes/users");
const auth = require("./routes/auth");

if (!config.get("jwtPrivateKey")) {
  console.error("FATAL ERROR: jwtPrivateKey is not defined.");
  process.exit(1);
}

// Connect to DB
mongoose
  .connect("mongodb://localhost/lo3go", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB..."))
  .catch(() => console.error("Could not connect to MongoDB..."));

// include build-in middleware - bodyParser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static("public"));
app.use(cors());

// Init blog routes
app.use("/api/blog-posts", blog);
// app.use("/api/users", users);
app.use("/api/auth", auth);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening on port ${port}`));
