const mongoose = require("mongoose");
const Joi = require("joi");
const fs = require("fs");
const path = require("path");
// const Joi.objectId = require('joi-objectid')(Joi);

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 150,
  },
  date: { type: Date, default: Date.now },
  isPublished: {
    type: Boolean,
    required: true,
  },
  pubDate: {
    type: Date,
  },
  // time, blocks(content) and version are editor.js saved data
  // these props are needed for editor.js to read the saved data and display it for editing!
  time: {
    type: Number,
    required: true,
  },
  blocks: {
    type: Array,
    required: true,
  },
  version: {
    type: String,
    required: true,
  },
});

blogSchema.methods.deleteBlogImages = function (blog) {
  blog.blocks.forEach((item) => {
    if (item.type === "image") {
      const fullPath = item.data.file.url;
      const start = fullPath.indexOf("/public");
      const imgLocation =
        process.cwd() + fullPath.substring(start, fullPath.length);

      fs.unlink(imgLocation, (err) => {
        if (err) console.warn(err);
        console.log(`${fullPath} was deleted`);
      });
    }
  });
};

const BlogPost = mongoose.model("blog-post", blogSchema);

// Joi validation
// TODO: custom error msg > https://stackoverflow.com/questions/48720942/node-js-joi-how-to-display-a-custom-error-messages
function validateBlogPost(blogPost) {
  const schema = {
    title: Joi.string().min(3).max(150).required(),
    isPublished: Joi.bool()
      .required()
      .error(() => {
        return {
          message: "error_msg_blog_post_published_required",
        };
      }),
    pubDate: Joi.date().allow(null),
    time: Joi.number().required(),
    blocks: Joi.array().min(1).required(),
    version: Joi.string().required(),
  };

  return Joi.validate(blogPost, schema);
}

exports.BlogPost = BlogPost;
exports.validateBlogPost = validateBlogPost;
