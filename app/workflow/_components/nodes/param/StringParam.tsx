"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParamProps } from "@/types/appnodes";
import { useId, useState } from "react";

function StringParam({ param, value, updateNodeParamValue }: ParamProps) {
  const id = useId();
  const [internalValue, setInternalValue] = useState(
    value === undefined ? "" : value
  );

  return (
    <div className="space-y-1 p-1 w-full">
      <Label htmlFor={id} className="text-xs flex gap-1">
        {param.name}
        {param.required && <p className="text-red-400">*</p>}
      </Label>

      <Input
        type="text"
        id={id}
        value={internalValue}
        className="text-xs"
        placeholder="Entre com o valor aqui."
        onChange={(e) => setInternalValue(e.target.value)}
        onBlur={(e) => updateNodeParamValue(e.target.value)}
      />

      {param.helperText && (
        <p className="text-muted-foreground px-2">{param.helperText}</p>
      )}
    </div>
  );
}

export default StringParam;
