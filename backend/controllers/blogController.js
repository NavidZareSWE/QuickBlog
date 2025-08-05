import fs from "fs";
import imagekit from "../config/ImageKit.js";
import Blog from "../models/Blog.js";
import mongoose from "mongoose";

export const addBlog = async (req, res) => {
  const session = await mongoose.startSession();
  let uploadedImageId = null;

  try {
    session.startTransaction();

    const { title, subTitle, description, category, isPublished } = JSON.parse(
      req.body.blog,
    );
    const image = req.file;

    if (!title || !description || !category || !image)
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });

    const fileBuffer = fs.readFileSync(image.path);

    // Upload Image to Imagekit
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: image.originalname,
      extensions: [
        {
          name: "google-auto-tagging",
          maxTags: 5,
          minConfidence: 95,
        },
      ],
      folder: "/blogs",
      checks: `"file.size" < "5mb"`,
    });

    uploadedImageId = response.fileId;

    const optimizedImageURL = imagekit.url({
      path: response.filePath,
      transformation: [
        { quality: `auto` },
        { format: `webp` },
        { width: `1280` },
      ],
    });

    await Blog.create(
      [
        {
          title,
          subTitle,
          description,
          category,
          image: optimizedImageURL,
          isPublished,
        },
      ],
      { session },
    );

    // Commit the transaction
    await session.commitTransaction();

    return res
      .status(201)
      .json({ success: true, message: "Blog added successfully." });
  } catch (error) {
    // Abort the transaction
    await session.abortTransaction();

    if (uploadedImageId) {
      try {
        await imagekit.deleteFile(uploadedImageId);
        console.log(
          "🧹 Image deletion successful! Cleaned up uploaded image due to database error",
        );
      } catch (cleanupError) {
        console.error("Failed to cleanup uploaded image:", cleanupError);
      }
    }

    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true });
    res.status(200).json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findById(blogId);
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });

    res.status(200).json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBlogById = async (req, res) => {
  try {
    const { id } = req.body;
    await Blog.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const togglePublish = async (req, res) => {
  try {
    const { id } = req.body;
    const blog = await Blog.findById(id);
    blog.isPublished = !blog.isPublished;
    await blog.save();
    res.status(200).json({ success: true, message: "Blog Status Updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
