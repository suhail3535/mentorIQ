import mongoose, { Schema, Model, models } from "mongoose";

export type UserRole = "ADMIN" | "MENTOR" | "STUDENT";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["ADMIN", "MENTOR", "STUDENT"],
      default: "STUDENT",
      index: true,
    },
    avatar: { type: String },
    bio: { type: String, maxlength: 280 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const User: Model<IUser> =
  (models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema);
