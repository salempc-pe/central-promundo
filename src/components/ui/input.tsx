import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  prefixNode?: React.ReactNode;
  suffixNode?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, prefixNode, suffixNode, ...props }, ref) => {
    if (prefixNode || suffixNode) {
      return (
        <div className="relative flex items-center w-full">
          {prefixNode && (
            <div className="absolute left-2 flex items-center pointer-events-none text-slate-400 text-2xs font-mono">
              {prefixNode}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-7 w-full rounded-xs border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 shadow-2xs transition-colors file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
              prefixNode && "pl-6",
              suffixNode && "pr-6",
              className
            )}
            ref={ref}
            {...props}
          />
          {suffixNode && (
            <div className="absolute right-2 flex items-center pointer-events-none text-slate-400 text-2xs font-mono">
              {suffixNode}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-7 w-full rounded-xs border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 shadow-2xs transition-colors file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
