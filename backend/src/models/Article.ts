import mongoose, { Document, Model, Schema } from "mongoose";

export interface IArticle extends Document {
  title: string;
  slug: string;
  content: string;
  category: string;
  image?: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IArticleModel extends Model<IArticle> {}

const articleSchema = new Schema<IArticle, IArticleModel>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    content: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    author: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

const Article = mongoose.model<IArticle, IArticleModel>("Article", articleSchema);

export default Article;
