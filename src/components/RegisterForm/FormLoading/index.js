import { Loader2 } from "lucide-react";
import React from "react";

export default function FormLoading() {
  return (
    <div className="flex h-full flex-1 h-64 flex-row items-center justify-center gap-4 text-zinc-300 pt-4">
      <Loader2 className="animate-spin" /> Loading...
    </div>
  );
}
