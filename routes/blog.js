const { BlogPost, validateBlogPost } = require("../models/blog-post");
const auth = require("../middleware/auth");
const router = require("express").Router();
const multer = require("multer");

// Get title, date and id from blog posts
// Sort them by date assending
// For selecting one blog
router.get("/", async (req, res) => {
  const blogPosts = await BlogPost.find({ isPublished: true })
    .sort({ date: -1 })
    .select({ time: 0, blocks: 0, isPublished: 0, version: 0, __v: 0 }); // exclude time, block, version > (editor.js), and __v

  res.send(blogPosts);
});

router.get("/latest", async (req, res) => {
  try {
    const blogPost = await BlogPost.findOne({ isPublished: true })
    .sort({ date: -1 })
    .select({ time: 0, isPublished: 0, version: 0, __v: 0 }); // exclude time, block, version > (editor.js), and __v

    res.send(blogPost);
  } catch (error) {
    
  }
});

// Save blog post
router.post("/", auth, async (req, res) => {
  const { error } = validateBlogPost(req.body);
  if (error) return res.status(400).json({error: error.details[0].message});

  try {
    const blogPost = new BlogPost({
      title: req.body.title,
      isPublished: req.body.isPublished,
      time: req.body.time,
      blocks: req.body.blocks,
      version: req.body.version,
    });
  
    await blogPost.save();
    res.send(blogPost);
  } catch (error) {
    res.status(500).json({error: ""});
  }
});

// Get blog post data
router.get("/:id", async (req, res) => {
  try {
    const blogPost = await BlogPost.findById(req.params.id);
    if (!blogPost) return res.status(404).json({error: "error_msg_blog_post_not_found"});
    res.send(blogPost);
  } catch (error) {
    res.status(500).json({error: "error_msg_internal_error"});
  }
});

// Update blog post
router.put("/:id", auth, async (req, res) => {
  const blog = await BlogPost.findById(req.params.id);
  if (!blog) return res.status(404).json({error: "error_msg_blog_post_not_found"});
  console.log(blog);

  try {
    const blogPost = await BlogPost.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        isPublished: req.body.isPublished,
        time: req.body.time,
        blocks: req.body.blocks,
        version: req.body.version,
      },
      {
        new: true,
      }
    );
    res.send(blogPost);
  } catch (error) {
    return res.status(500).json({error: "error_msg_blog_post_not_found"});
  }
});


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
      cb(null, true);
  } else {
      cb(null, false);
  }
}
const upload = multer({storage: storage, fileFilter: fileFilter});

router.post("/uploadImg", auth, upload.single('image'), (req, res) => {
  try {
    return res.status(200).send({
      success: 1,
      file: {
        url: req.protocol + '://' + req.get('host') + '/' + req.file.path
      }
    });
  } catch (error) {
    res.status(400).json({error: "error_msg_faild_img_upload"});
  }
  
});

module.exports = router;
