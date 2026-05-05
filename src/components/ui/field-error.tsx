import { AlertCircle } from "lucide-react";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="mt-1 flex items-center gap-1 text-xs font-medium text-red-500"
    >
      <AlertCircle className="h-3 w-3" />
      {message}
    </p>
  );
}
