/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ParamProps } from "@/types/appnodes";
import { useEffect, useId, useState } from "react";

function StringParam({
  param,
  value,
  updateNodeParamValue,
  disabled,
}: ParamProps) {
  const id = useId();
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [internalValue, value]);

  let Component: any = Input;
  if (param.variant === "textarea") Component = Textarea;

  return (
    <div className="space-y-1 p-1 w-full">
      <Label htmlFor={id} className="text-xs flex gap-1">
        {param.name}
        {param.required && <p className="text-red-400">*</p>}
      </Label>

      <Component
        id={id}
        value={internalValue}
        disabled={disabled}
        className="text-xs"
        placeholder="Entre com o valor aqui."
        onChange={(e: any) => setInternalValue(e.target.value)}
        onBlur={(e: any) => updateNodeParamValue(e.target.value)}
      />

      {param.helperText && (
        <p className="text-muted-foreground px-2">{param.helperText}</p>
      )}
    </div>
  );
}

export default StringParam;
