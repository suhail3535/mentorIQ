"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Trash2, Inbox, Mail, Eye } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { apiFetch } from "@/lib/fetcher";
import { formatDate, getInitials } from "@/lib/utils";

interface InquiryRow {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: "NEW" | "REPLIED" | "CLOSED";
  source?: string;
  createdAt: string;
}

const STATUS_VARIANT: Record<string, "warning" | "primary" | "success"> = {
  NEW: "warning",
  REPLIED: "primary",
  CLOSED: "success",
};

export default function InquiriesPage() {
  const [status, setStatus] = useState("");
  const url = `/api/inquiries${status ? `?status=${status}` : ""}`;
  const { data, isLoading, mutate } = useSWR<InquiryRow[]>(url, apiFetch);

  const [viewing, setViewing] = useState<InquiryRow | null>(null);

  async function updateStatus(id: string, newStatus: InquiryRow["status"]) {
    try {
      await apiFetch(`/api/inquiries/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success("Status updated");
      mutate();
      if (viewing && viewing._id === id) {
        setViewing({ ...viewing, status: newStatus });
      }
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this inquiry?")) return;
    try {
      await apiFetch(`/api/inquiries/${id}`, { method: "DELETE" });
      toast.success("Inquiry deleted");
      if (viewing?._id === id) setViewing(null);
      mutate();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Inquiries"
        description="Messages submitted via the public 'Get in touch' form."
      />

      <Card className="mb-4">
        <CardContent className="flex items-center gap-3 p-4">
          <span className="text-sm text-[var(--muted-foreground)]">
            Filter by status
          </span>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 w-40 text-xs"
          >
            <option value="">All</option>
            <option value="NEW">New</option>
            <option value="REPLIED">Replied</option>
            <option value="CLOSED">Closed</option>
          </Select>
          <span className="ml-auto text-xs text-[var(--muted-foreground)]">
            {data?.length ?? 0} total
          </span>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--muted)]/40 text-left text-xs uppercase text-[var(--muted-foreground)]">
              <tr>
                <th className="px-5 py-3">From</th>
                <th className="px-5 py-3">Message</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Received</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    className="px-5 py-6 text-center text-[var(--muted-foreground)]"
                    colSpan={5}
                  >
                    Loading…
                  </td>
                </tr>
              )}

              {!isLoading && (data?.length ?? 0) === 0 && (
                <tr>
                  <td className="px-5 py-12 text-center" colSpan={5}>
                    <Inbox className="mx-auto mb-2 h-8 w-8 text-[var(--muted-foreground)]" />
                    <p className="text-sm text-[var(--muted-foreground)]">
                      No inquiries yet.
                    </p>
                  </td>
                </tr>
              )}

              {data?.map((i) => (
                <tr
                  key={i._id}
                  className="border-b border-[var(--border)] transition-colors last:border-0 hover:bg-[var(--muted)]/30"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-cyan-500 to-sky-500 text-xs font-semibold text-white">
                        {getInitials(i.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium">{i.name}</div>
                        <a
                          href={`mailto:${i.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:underline"
                        >
                          <Mail className="h-3 w-3" />
                          {i.email}
                        </a>
                      </div>
                    </div>
                  </td>

                  <td className="max-w-xs px-5 py-3">
                    <p className="line-clamp-2 text-[var(--muted-foreground)]">
                      {i.message}
                    </p>
                  </td>

                  <td className="px-5 py-3">
                    <Select
                      value={i.status}
                      onChange={(e) =>
                        updateStatus(
                          i._id,
                          e.target.value as InquiryRow["status"],
                        )
                      }
                      className="h-8 w-32 text-xs"
                    >
                      <option value="NEW">New</option>
                      <option value="REPLIED">Replied</option>
                      <option value="CLOSED">Closed</option>
                    </Select>
                  </td>

                  <td className="px-5 py-3 text-[var(--muted-foreground)]">
                    {formatDate(i.createdAt)}
                  </td>

                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="View message"
                        onClick={() => setViewing(i)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete inquiry"
                        onClick={() => remove(i._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="Inquiry details"
        description={viewing ? `From ${viewing.name}` : undefined}
      >
        {viewing && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={STATUS_VARIANT[viewing.status]}>
                {viewing.status}
              </Badge>
              <span className="text-xs text-[var(--muted-foreground)]">
                {formatDate(viewing.createdAt)}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs text-[var(--muted-foreground)]">Email</div>
              <a
                href={`mailto:${viewing.email}`}
                className="inline-flex items-center gap-1.5 text-sm text-indigo-500 hover:underline"
              >
                <Mail className="h-3.5 w-3.5" />
                {viewing.email}
              </a>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs text-[var(--muted-foreground)]">
                Message
              </div>
              <p className="whitespace-pre-line rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-3 text-sm">
                {viewing.message}
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <Select
                value={viewing.status}
                onChange={(e) =>
                  updateStatus(
                    viewing._id,
                    e.target.value as InquiryRow["status"],
                  )
                }
                className="h-9 w-40 text-xs"
              >
                <option value="NEW">Mark as New</option>
                <option value="REPLIED">Mark as Replied</option>
                <option value="CLOSED">Mark as Closed</option>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    window.location.href = `mailto:${viewing.email}?subject=Re: Your MentorIQ inquiry`;
                  }}
                >
                  <Mail className="h-4 w-4" />
                  Reply
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => remove(viewing._id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
