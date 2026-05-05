"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactModal } from "@/components/contact-modal";

export function LandingHeroCTA() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href="/login">
          <Button variant="gradient" size="lg" className="w-full sm:w-auto">
            Sign in to your workspace
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Button
          variant="outline"
          size="lg"
          className="w-full sm:w-auto"
          onClick={() => setOpen(true)}
        >
          <MessageSquareText className="h-4 w-4" />
          Get in touch
        </Button>
      </div>
      <p className="mt-6 text-xs text-[var(--muted-foreground)]">
        Mentor and Student accounts are provisioned by your workspace Admin.
      </p>
      <ContactModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function LandingFooterCTA() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size="lg"
        className="bg-white text-indigo-600 hover:bg-white/90"
        onClick={() => setOpen(true)}
      >
        Get in touch
        <ArrowRight className="h-4 w-4" />
      </Button>
      <ContactModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
