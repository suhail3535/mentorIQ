import Link from "next/link";
import { Brain } from "lucide-react";
import { APP } from "@/lib/config";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="absolute inset-0 -z-10 bg-grid opacity-[0.18] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,#000_30%,transparent_80%)]" />
      <div className="absolute inset-0 -z-10 bg-radial-fade" />

      <header className="flex items-center justify-between p-4 sm:p-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-md">
            <Brain className="h-5 w-5" />
          </span>
          <span className="text-lg tracking-tight">{APP.name}</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
