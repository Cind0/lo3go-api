const { BlogPost, validateBlogPost } = require("../models/blog-post");
const auth = require("../middleware/auth");
const router = require("express").Router();
const multer = require("multer");

// Get title, date and id from blog posts
// Sort them by date assending
// For selecting one blog
router.get("/all-published", async (req, res) => {
  try {
    const blogPosts = await BlogPost.find({ isPublished: true })
      .sort({ pubDate: -1 })
      .select({
        time: 0,
        blocks: 0,
        date: 0,
        isPublished: 0,
        version: 0,
        __v: 0,
      }); // exclude time, block, version > (editor.js), and __v
    return res.json(blogPosts);
  } catch (error) {
    return res.status(500).json({ error: "error_msg_something_went_wrong" });
  }
});

router.get("/latest", async (req, res) => {
  try {
    const blogPost = await BlogPost.findOne({ isPublished: true })
      .sort({ pubDate: -1 })
      .select({ time: 0, version: 0, __v: 0 }); // exclude time, block, version > (editor.js), and __v

    return res.json(blogPost);
  } catch (error) {
    return res.status(404).json({ error: "error_msg_blog_post_not_found" });
  }
});

// Get blog post data
router.get("/find/:id", async (req, res) => {
  try {
    const blogPost = await BlogPost.findOne({
      _id: req.params.id,
      isPublished: true,
    });
    // if (!blogPost) {
    //   return res.status(404).json({ error: "error_msg_blog_post_not_found" });
    // }
    return res.json(blogPost);
  } catch (error) {
    return res.status(404).json({ error: "error_msg_blog_post_not_found" });
  }
});

router.get("/all", auth, async (req, res) => {
  try {
    const blogPosts = await BlogPost.find()
      .sort({ date: -1 })
      .select({ time: 0, blocks: 0, date: 0, version: 0, __v: 0 }); // exclude time, block, version > (editor.js), and __v
    return res.json(blogPosts);
  } catch (error) {
    return res.status(500).json({ error: "error_msg_something_went_wrong" });
  }
});

router.get("/toedit/:id", auth, async (req, res) => {
  try {
    const blogPost = await BlogPost.findOne({
      _id: req.params.id,
    });
    // if (!blogPost) {
    //   return res.status(404).json({ error: "error_msg_blog_post_not_found" });
    // }
    return res.json(blogPost);
  } catch (error) {
    return res.status(404).json({ error: "error_msg_blog_post_not_found" });
  }
});

// Save blog post
router.post("/", auth, async (req, res) => {
  const { error } = validateBlogPost(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const blogPost = new BlogPost({
      title: req.body.title,
      isPublished: req.body.isPublished,
      pubDate: req.body.pubDate,
      time: req.body.time,
      blocks: req.body.blocks,
      version: req.body.version,
    });

    await blogPost.save();
    return res.json(blogPost);
  } catch (error) {
    return res.status(500).json({ error: "error_msg_something_went_wrong" });
  }
});

// Update blog post
router.put("/:id", auth, async (req, res) => {
  try {
    await BlogPost.findById(req.params.id);
  } catch (error) {
    return res.status(404).json({ error: "error_msg_blog_post_not_found" });
  }

  const { error } = validateBlogPost(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const blogPost = await BlogPost.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        isPublished: req.body.isPublished,
        pubDate: req.body.pubDate,
        time: req.body.time,
        blocks: req.body.blocks,
        version: req.body.version,
      },
      {
        new: true,
      }
    );
    return res.json(blogPost);
  } catch (error) {
    return res.status(500).json({ error: "error_msg_something_went_wrong" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    await BlogPost.findById(req.params.id);
  } catch (error) {
    return res.status(404).json({ error: "error_msg_blog_post_not_found" });
  }

  try {
    const blogPost = await BlogPost.findByIdAndDelete(req.params.id);
    blogPost.deleteBlogImages(blogPost);
    return res.json({ status: "blog_post_deleted" });
  } catch (error) {
    return res.json({ error: "error_msg_something_went_wrong" });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/blog");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname + "-" + uniqueSuffix);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

router.post("/uploadImg", auth, upload.single("image"), (req, res) => {
  try {
    return res.status(200).json({
      success: 1,
      file: {
        url: req.protocol + "://" + req.get("host") + "/" + req.file.path,
      },
    });
  } catch (error) {
    return res.status(400).json({ error: "error_msg_faild_img_upload" });
  }
});

module.exports = router;
