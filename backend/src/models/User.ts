import bcrypt from "bcryptjs";
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "superadmin" | "admin" | "subadmin" | "user";
  profileType?: "internship" | "job";
  address?: string;
  designation?: string;
  documentType?: "citizenship" | "passport" | "driving_license";
  documentFrontImage?: string;
  documentBackImage?: string;
  userCode?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface IUserModel extends Model<IUser> {}

const userSchema = new Schema<IUser, IUserModel>(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["superadmin", "admin", "subadmin", "user"], default: "user" },
    profileType: { type: String, enum: ["internship", "job"], trim: true },
    address: { type: String, trim: true },
    designation: { type: String, trim: true },
    documentType: { type: String, enum: ["citizenship", "passport", "driving_license"], trim: true },
    documentFrontImage: { type: String, trim: true },
    documentBackImage: { type: String, trim: true },
    userCode: { type: String, trim: true, unique: true, sparse: true }
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser, IUserModel>("User", userSchema);

export default User;
