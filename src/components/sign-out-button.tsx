"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { LogOut, Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

interface SignOutButtonProps extends Omit<ButtonProps, "onClick"> {
  showLabel?: boolean;
  callbackUrl?: string;
}

export function SignOutButton({
  showLabel = true,
  callbackUrl = "/",
  variant = "ghost",
  size = "sm",
  className,
  ...rest
}: SignOutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function performSignOut() {
    setLoading(true);
    const t = toast.loading("Signing you out…");
    try {
      await signOut({ redirect: false });
      toast.success("Signed out successfully", { id: t });
      setTimeout(() => {
        window.location.href = callbackUrl;
      }, 600);
    } catch {
      toast.error("Could not sign out. Try again.", { id: t });
      setLoading(false);
    }
  }

  function askConfirm() {
    toast("Sign out of MentorIQ?", {
      description: "You'll need to sign in again to access your dashboard.",
      duration: 8000,
      action: {
        label: "Sign out",
        onClick: () => performSignOut(),
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  }

  return (
    <Button
      variant={variant}
      size={size}
      aria-label="Sign out"
      onClick={askConfirm}
      disabled={loading}
      className={className}
      {...rest}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      {showLabel && <span>{loading ? "Signing out…" : "Sign out"}</span>}
    </Button>
  );
}
