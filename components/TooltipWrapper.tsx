"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface Props {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "bottom" | "right" | "left";
}
function TooltipWrapper(props: Props) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>{props.children}</TooltipTrigger>
        <TooltipContent side={props.side ? props.side : "bottom"}>
          {props.content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default TooltipWrapper;
