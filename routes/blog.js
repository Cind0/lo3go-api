const {BlogPost, validateBlogPost} = require('../models/blog-post'); 
const mongoose = require('mongoose');
const router = require('express').Router();

// Get title, date and id from blog posts
// Sort them by date assending
// For selecting one blog
router.get('/', async (req, res) => {
  const blogPost = await BlogPost
  .find({isPublished: true})
  .sort({ date: 1 })
  .select({ time: 0, isPublished: 0, blocks: 0, version: 0, __v: 0 }); // exclude time, block, version > (editor.js), and __v 

  res.send(blogPost);
});

router.post('/', async (req, res) => {
  const { error } = validateBlogPost(req.body);
  if ( error ) return res.status(400).send( error.details[0].message );
  
  let blogPost = new BlogPost ({
    title: req.body.title,
    isPublished: req.body.isPublished,
    time: req.body.time,
    blocks: req.body.blocks,
    version: req.body.version,
  });

  blogPost = await blogPost.save();
  res.send(blogPost);
});

// Get blog post data
router.get('/:id', async (req, res) => {
  try {
    const blogPost = await BlogPost.findById(req.params.id)
    .select({ time: 0, isPublished: 0, blocks: 1, version: 0, __v: 0 });

    res.send(blogPost);
  } catch (error) {
    return res.status(404).send('error_msg_blog_post_not_found');
  }
});

// Update blog post
router.put('/:id', async (req, res) => {
  const { error } = validateBlogPost(req.body);
  if ( error ) return res.status(400).send( error.details[0].message );

  try {
    const blogPost = await BlogPost.findByIdAndUpdate(req.params.id, { 
      title: req.body.title,
      isPublished: req.body.isPublished,
      time: req.body.time,
      blocks: req.body.blocks,
      version: req.body.version,
     }, {
      new: true
    });
    res.send(blogPost);
  } catch (error) {
    return res.status(404).send('error_msg_blog_post_not_found');
  }

});

module.exports = router;