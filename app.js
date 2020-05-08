const mongoose = require('mongoose');
const express = require('express');
const app = express();

// Include blog routes 
const blog = require('./routes/blog');

// Connect to DB
mongoose.connect('mongodb://localhost/lo3go', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB...'))
  .catch(() => console.error('Could not connect to MongoDB...'));

// include build-in middleware - bodyParser
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Init blog routes
app.use('/api/blog-posts', blog);



const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening on port ${port}`));