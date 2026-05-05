"use client";

import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, MessageSquareText } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { useFormErrors } from "@/hooks/use-form-errors";

const ContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Enter a valid email address"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000),
});
type ContactInput = z.infer<typeof ContactSchema>;

export function ContactModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ContactInput>({
    name: "",
    email: "",
    message: "",
  });
  const { errors, validate, clearField, clear } = useFormErrors(ContactSchema);

  function set<K extends keyof ContactInput>(k: K, v: ContactInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    clearField(k as string);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate(form)) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Could not submit your query");
        return;
      }
      toast.success("Thanks! We'll get back to you shortly.");
      setForm({ name: "", email: "", message: "" });
      clear();
      onClose();
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Get in touch"
      description="Tell us about yourself and how we can help. We'll reply via email."
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="c-name">Name</Label>
          <Input
            id="c-name"
            placeholder="Jane Doe"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            invalid={!!errors.name}
          />
          <FieldError message={errors.name} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-email">Email</Label>
          <Input
            id="c-email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            invalid={!!errors.email}
          />
          <FieldError message={errors.email} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-message">How can we help?</Label>
          <Textarea
            id="c-message"
            maxLength={2000}
            placeholder="Tell us about your school, students, or what you'd like to achieve with MentorIQ."
            className="min-h-[120px]"
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            invalid={!!errors.message}
          />
          <div className="flex items-center justify-between">
            <FieldError message={errors.message} />
            <span className="ml-auto text-xs text-[var(--muted-foreground)]">
              {form.message.length}/2000
            </span>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="gradient" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <MessageSquareText className="h-4 w-4" />
                Send message
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
