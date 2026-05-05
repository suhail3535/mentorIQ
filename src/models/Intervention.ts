import mongoose, { Schema, Model, models } from "mongoose";

export type InterventionStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
export type InterventionPriority = "LOW" | "MEDIUM" | "HIGH";

export interface IInterventionAction {
  description: string;
  dueDate?: Date;
  completed: boolean;
}

export interface IIntervention {
  _id: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  course?: mongoose.Types.ObjectId;
  mentor: mongoose.Types.ObjectId;
  reason: string;
  plan: string;
  actions: IInterventionAction[];
  priority: InterventionPriority;
  status: InterventionStatus;
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ActionSchema = new Schema<IInterventionAction>(
  {
    description: { type: String, required: true, maxlength: 280 },
    dueDate: { type: Date },
    completed: { type: Boolean, default: false },
  },
  { _id: false },
);

const InterventionSchema = new Schema<IIntervention>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    course: { type: Schema.Types.ObjectId, ref: "Course" },
    mentor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true, maxlength: 500 },
    plan: { type: String, required: true, maxlength: 2000 },
    actions: [ActionSchema],
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED"],
      default: "OPEN",
      index: true,
    },
    aiGenerated: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Intervention: Model<IIntervention> =
  (models.Intervention as Model<IIntervention>) ||
  mongoose.model<IIntervention>("Intervention", InterventionSchema);
