import Link from "next/link";
import { Brain } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { APP, AUTHOR } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)]/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:px-6 md:flex-row lg:px-8">
        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
            <Brain className="h-3.5 w-3.5" />
          </span>
          <span>
            © {new Date().getFullYear()} {APP.name}. Developed by{" "}
            <span className="font-medium text-[var(--foreground)]">
              {AUTHOR.name}
            </span>
            .
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={AUTHOR.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <GithubIcon className="h-4 w-4" />
          </Link>
          <Link
            href={AUTHOR.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <LinkedinIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
