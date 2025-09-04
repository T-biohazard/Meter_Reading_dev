import { forwardRef } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Reusable Button
 *
 * Props:
 * - intent: "ok" | "cancel" | "submit" | "next" | "back" | "delete" | "save"
 * - variant: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "neutral" | "ghost" | "outline" | "subtle" | "link" | "icon"
 * - toggled: boolean (Adds specific styles for a toggled state, overriding variant)
 * - size: "xs" | "sm" | "md" | "lg" (default: "md")
 * - leftIcon, rightIcon: React components (e.g., from lucide-react)
 * - loading: boolean (shows spinner and disables)
 * - loadingText: string (optional; if provided, shows next to spinner)
 * - block: boolean (full width)
 * - iconOnly: boolean (square icon button; requires aria-label)
 * - joined: boolean (use with daisyUI "join" groups)
 *
 * - to: string (renders <Link>)
 * - href: string (renders <a>)
 * - type: "button" | "submit" | "reset" (default: "button" unless inside form)
 * - disabled: boolean
 * - className: string
 *
 * Usage:
 * <Button intent="submit" type="submit">Submit</Button>
 * <Button variant="outline" leftIcon={Settings}>Settings</Button>
 * <Button to="/next" rightIcon={ArrowRight}>Next</Button>
 * <Button loading loadingText="Saving...">Save</Button>
 * <Button iconOnly aria-label="Add" variant="icon" leftIcon={Plus} />
 * <Button toggled={isToggled}>Toggle Me</Button>
 */

const intentToVariant = {
  ok: "success",
  cancel: "neutral",
  submit: "primary",
  next: "primary",
  back: "neutral",
  delete: "danger",
  save: "primary",
};

const variantClasses = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  success: "btn-success",
  danger: "btn-error",
  warning: "btn-warning",
  info: "btn-info",
  neutral: "btn-neutral",
  ghost: "btn-ghost",
  outline: "btn-outline",
  link: "btn-link",
  subtle: "bg-base-200 border border-base-300 text-base-content hover:bg-base-300",
  icon: "bg-transparent border-none text-gray-600 hover:bg-gray-200",
};

const toggledClasses = {
  on: 'bg-blue-600 text-white hover:bg-blue-700 border-transparent',
  off: 'bg-white text-blue-500 border-2 border-blue-400 hover:bg-gray-50',
};

const sizeClasses = {
  xs: "btn-xs",
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
};

const cx = (...args) => twMerge(clsx(...args));

const Button = forwardRef(
  (
    {
      intent,
      variant,
      toggled,
      size = "md",
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      loading = false,
      loadingText,
      block = false,
      iconOnly = false,
      joined = false,
      to,
      href,
      type,
      disabled,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    // resolve variant via intent alias
    const resolvedVariant =
      intent && !variant && toggled === undefined
        ? intentToVariant[intent] ?? "primary"
        : variant ?? "primary";

    const Comp = to ? Link : href ? "a" : "button";

    const isDisabled = disabled || loading;

    // dev guard for iconOnly
    if (import.meta?.env?.DEV && iconOnly && !rest["aria-label"]) {
      // eslint-disable-next-line no-console
      console.warn(
        "Button (iconOnly) should include an aria-label for accessibility."
      );
    }

    const content = (
      <>
        {loading ? (
          <span className="loading loading-spinner" aria-hidden="true" />
        ) : LeftIcon ? (
          <LeftIcon className="h-4 w-4" aria-hidden="true" />
        ) : null}

        {/* label */}
        {iconOnly ? null : (
          <span className={cx(loading && "ml-2")}>
            {loading && loadingText ? loadingText : children}
          </span>
        )}

        {/* right icon (not during loading) */}
        {!loading && RightIcon ? (
          <RightIcon className={cx("h-4 w-4", iconOnly ? "" : "ml-2")} aria-hidden="true" />
        ) : null}
      </>
    );

    const buttonClasses = cx(
      "btn no-animation", // keep it snappy; daisyUI base
      toggled !== undefined ? toggledClasses[toggled ? 'on' : 'off'] : (variantClasses[resolvedVariant] || variantClasses.primary),
      sizeClasses[size],
      block && "w-full",
      iconOnly && "btn-square",
      joined && "join-item",
      // calm focus (match your input decision: no bold border)
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
      // make disabled cursor consistent for <a>/<Link> too
      isDisabled && "pointer-events-none",
      // small polish
      "whitespace-nowrap",
      className
    );

    return (
      <Comp
        ref={ref}
        to={to}
        href={href}
        type={Comp === "button" ? type ?? "button" : undefined}
        disabled={Comp === "button" ? isDisabled : undefined}
        aria-disabled={Comp !== "button" && isDisabled ? true : undefined}
        className={buttonClasses}
        {...rest}
      >
        {content}
      </Comp>
    );
  }
);

export default Button;