"use client";

import { ParamProps } from "@/types/appnodes";

function BrowserInstanceParam({ param }: ParamProps) {
  // console.log(param);

  return <p className="text-xs">{param.name}</p>;
}

export default BrowserInstanceParam;
