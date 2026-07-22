import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: Props) {
  return (
    <button
      className={clsx(
        "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
        {
          "bg-brand-green text-white hover:bg-brand-dark": variant === "primary",
          "border border-brand-green/30 bg-brand-surface text-brand-dark hover:bg-brand-green/10":
            variant === "secondary",
          "text-brand-dark hover:bg-brand-green/10": variant === "ghost",
        },
        className,
      )}
      {...props}
    />
  );
}
