import mongoose, { Schema, Model, models } from "mongoose";

export interface ICourse {
  _id: mongoose.Types.ObjectId;
  title: string;
  code: string;
  description?: string;
  mentor: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String, maxlength: 500 },
    mentor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    students: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Course: Model<ICourse> =
  (models.Course as Model<ICourse>) ||
  mongoose.model<ICourse>("Course", CourseSchema);
