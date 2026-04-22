import mongoose, { Document, Model, Schema } from "mongoose";

export interface IComment extends Document {
  articleSlug: string;
  name: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ICommentModel extends Model<IComment> {}

const commentSchema = new Schema<IComment, ICommentModel>(
  {
    articleSlug: { type: String, required: true, index: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    message: { type: String, required: true, trim: true, maxlength: 1000 }
  },
  { timestamps: true }
);

const Comment = mongoose.model<IComment, ICommentModel>("Comment", commentSchema);

export default Comment;
