import { Loader2Icon } from "lucide-react";
import React from "react";

function loading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2Icon size={36} className="animate-spin stroke-primary" />
    </div>
  );
}

export default loading;
