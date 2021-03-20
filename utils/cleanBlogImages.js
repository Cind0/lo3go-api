var path = require("path");
var fs = require("fs");
const { BlogPost } = require("../models/blog-post");

module.exports = async function cleanBlogImages() {
  const directoryPath = process.cwd() + "/public/blog";

  let blogImages = [];
  let uploadedImages = [];
  let imagesToDelete = [];

  try {
    const blogPosts = await BlogPost.find().select({
      blocks: 1,
    });
    if (!blogPosts) {
      console.warn("No blog posts");
    } else {
      blogPosts.forEach((item) => {
        item.blocks.forEach((blogItem) => {
          if (blogItem.type === "image") {
            const fullPath = blogItem.data.file.url;
            const start = fullPath.indexOf("/blog") + 6;
            const imgName = fullPath.substring(start, fullPath.length);

            blogImages.push(imgName);
          }
        });
      });
      fs.readdirSync(directoryPath).forEach((img) => {
        uploadedImages.push(img);
      });

      uploadedImages.forEach((img) => {
        console.log(img);
        if (!blogImages.includes(img)) {
          imagesToDelete.push(img);
        }
      });

      imagesToDelete.forEach((img) => {
        const imgPath = process.cwd() + "/public/blog/" + img;

        fs.unlink(imgPath, (err) => {
          if (err) console.warn(err);
          console.log(`${img} was deleted`);
        });
      });
    }
  } catch (error) {
    console.warn(error);
  }
};
