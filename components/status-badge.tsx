import { TowStatus } from "@/lib/types";
import { getStatusTone } from "@/lib/utils";

export function StatusBadge({ status }: { status: TowStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusTone(status)}`}>
      {status}
    </span>
  );
}
