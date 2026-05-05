import { tool } from "ai";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Inquiry } from "@/models/Inquiry";

/**
 * Public-safe tool. Lets a landing-page visitor submit a contact-us
 * inquiry directly from the Iris chat instead of opening the modal.
 *
 * The inquiry lands in the same collection as the contact form, so it
 * shows up in the Admin > Inquiries page automatically.
 */
export const submitInquiryTool = tool({
  description:
    "Submit a contact-us / get-in-touch inquiry from the visitor. Use this only after you have collected the visitor's name, email, and a clear message describing what they want. Always confirm with the visitor before submitting.",
  inputSchema: z.object({
    name: z
      .string()
      .min(2)
      .max(80)
      .describe("Full name of the visitor"),
    email: z.string().email().describe("Visitor's email address"),
    message: z
      .string()
      .min(10)
      .max(2000)
      .describe(
        "What the visitor wants to ask or share with the team. At least 10 characters.",
      ),
  }),
  execute: async ({ name, email, message }) => {
    try {
      await connectDB();
      const created = await Inquiry.create({
        name,
        email,
        message,
        source: "iris-chat",
      });
      return {
        ok: true,
        inquiryId: String(created._id),
        message:
          "Thanks! Your message has been delivered to the team. They typically reply within 1–2 business days.",
      };
    } catch (e) {
      return {
        ok: false,
        error:
          (e as Error).message ||
          "Couldn't submit the inquiry right now. Please try again in a moment.",
      };
    }
  },
});
