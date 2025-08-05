import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    /**
     * This line defines a field named 'blog' in the schema, which is of type
     * ObjectId. It references the "blog" collection, establishing a relationship
     * between this schema and the blog documents.
     */
    blog: { type: mongoose.Schema.Types.ObjectId, ref: "blog", required: true },
    name: { type: String, required: true },
    content: { type: String, required: true },
    isApproved: { type: Boolean, default: false },
    /*The 'timestamps' option is set to true, 
      which automatically adds 'createdAt' and 'updatedAt' fields to the schema.
 */
  },
  { timestamps: true }
);

const Comment = mongoose.model("comment", commentSchema);

export default Comment;
