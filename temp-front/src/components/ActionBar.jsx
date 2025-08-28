import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import { filterAllowedActions } from "../lib/policy";
import { useAuth } from "../app/AuthContext";

const variantToClass = {
  primary: "btn btn-primary",
  secondary: "btn btn-secondary",
  outline: "btn btn-outline",
  ghost: "btn btn-ghost",
  destructive: "btn btn-error",
};

export default function ActionBar({ items = [], dense = false, align = "start" }) {
  const { role } = useAuth();
  const allowed = filterAllowedActions(role, items);

  const justify =
    align === "end" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";

  return (
    <div className={twMerge(clsx("flex flex-wrap gap-2", justify, dense && "gap-1"))}>
      {allowed.map((it) => {
        const classes = variantToClass[it.variant || "primary"];
        return (
          <button
            key={it.id}
            className={twMerge(clsx(classes))}
            onClick={it.onClick}
            disabled={!!it.disabled}
            title={it.tooltip}
            type="button"
          >
            {it.icon ? <span className="mr-2">{it.icon}</span> : null}
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
