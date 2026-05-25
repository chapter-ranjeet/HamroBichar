import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICertificate extends Document {
  certificateId: string;
  name: string;
  age: number;
  designation: string;
  role?: string;
  issueDate: Date;
  expiryDate?: Date;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface ICertificateModel extends Model<ICertificate> {}

const certificateSchema = new Schema<ICertificate, ICertificateModel>(
  {
    certificateId: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0 },
    designation: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

const Certificate = mongoose.model<ICertificate, ICertificateModel>("Certificate", certificateSchema);

export default Certificate;