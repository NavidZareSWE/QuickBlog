import jwt from "jsonwebtoken";
import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase() ||
      password !== process.env.ADMIN_PASSWORD
    )
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credentials" });

    const token = jwt.sign({ email }, process.env.JWT_SECRET);
    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBlogsAdmin = async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllComments = async (req, res) => {
  try {
    /**
     * The populate method replaces the ObjectId in the 'blog' field
     * with the full blog document it references. This allows access
     * to related blog data, such as title and content, without needing
     * a separate query to fetch the blog document.
     */
    const comments = await Comment.find({})
      .populate("blog")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getDashboard = async (req, res) => {
  try {
    /**
     * The limit method restricts the query to return a maximum of 5
     * documents, fetching only the most recent blog entries.
     */

    const recentBlogs = await Blog.find({}).sort({ createdAt: -1 }).limit(5);
    const blogs = await Blog.countDocuments();
    const comments = await Comment.countDocuments();
    const drafts = await Blog.countDocuments({ isPublished: false });

    const dashboardData = {
      blogs,
      comments,
      drafts,
      recentBlogs,
    };
    res.status(200).json({ success: true, dashboardData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCommentById = async (req, res) => {
  try {
    const { id } = req.body;
    await Comment.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const approveCommentById = async (req, res) => {
  try {
    const { id } = req.body;
    await Comment.findByIdAndUpdate(id, { isApproved: true });
    res
      .status(200)
      .json({ success: true, message: "Comment approved successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
