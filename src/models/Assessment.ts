import mongoose, { Schema, Model, models } from "mongoose";

export interface IScore {
  student: mongoose.Types.ObjectId;
  marks: number;
  remarks?: string;
}

export interface IAssessment {
  _id: mongoose.Types.ObjectId;
  title: string;
  course: mongoose.Types.ObjectId;
  mentor: mongoose.Types.ObjectId;
  type: "QUIZ" | "ASSIGNMENT" | "EXAM" | "PROJECT";
  totalMarks: number;
  date: Date;
  scores: IScore[];
  createdAt: Date;
  updatedAt: Date;
}

const ScoreSchema = new Schema<IScore>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    marks: { type: Number, required: true, min: 0 },
    remarks: { type: String, maxlength: 280 },
  },
  { _id: false },
);

const AssessmentSchema = new Schema<IAssessment>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    mentor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["QUIZ", "ASSIGNMENT", "EXAM", "PROJECT"],
      default: "QUIZ",
    },
    totalMarks: { type: Number, required: true, min: 1 },
    date: { type: Date, default: Date.now },
    scores: [ScoreSchema],
  },
  { timestamps: true },
);

export const Assessment: Model<IAssessment> =
  (models.Assessment as Model<IAssessment>) ||
  mongoose.model<IAssessment>("Assessment", AssessmentSchema);
