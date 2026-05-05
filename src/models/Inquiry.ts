import mongoose, { Schema, Model, models } from "mongoose";

export type InquiryStatus = "NEW" | "REPLIED" | "CLOSED";

export interface IInquiry {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  message: string;
  status: InquiryStatus;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema<IInquiry>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["NEW", "REPLIED", "CLOSED"],
      default: "NEW",
      index: true,
    },
    source: { type: String, default: "landing-page" },
  },
  { timestamps: true },
);

export const Inquiry: Model<IInquiry> =
  (models.Inquiry as Model<IInquiry>) ||
  mongoose.model<IInquiry>("Inquiry", InquirySchema);
