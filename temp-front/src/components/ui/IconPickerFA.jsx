// src/components/ui/IconPickerFA.jsx
import { useMemo, useRef, useState, useEffect } from "react";
import clsx from "clsx";
// One import to rule them all (includes /webfonts)
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function IconPickerFA({
  label = "Icon",
  value = "",
  onChange,
  placeholder = "fa-solid fa-house",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef(null);

  useEffect(() => {
    function handle(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const ICONS = useMemo(
    () => [
      { n: "Dashboard", c: "fa-solid fa-gauge" },
      { n: "Home", c: "fa-solid fa-house" },
      { n: "Users", c: "fa-solid fa-users" },
      { n: "User settings", c: "fa-solid fa-user-gear" },
      { n: "Settings", c: "fa-solid fa-gear" },
      { n: "Tools", c: "fa-solid fa-wrench" },
      { n: "Bell", c: "fa-solid fa-bell" },
      { n: "Shield", c: "fa-solid fa-shield-halved" },
      { n: "Lock", c: "fa-solid fa-lock" },
      { n: "Key", c: "fa-solid fa-key" },
      { n: "Box", c: "fa-solid fa-box" },
      { n: "Boxes", c: "fa-solid fa-boxes-stacked" },
      { n: "Folder", c: "fa-solid fa-folder" },
      { n: "Table", c: "fa-solid fa-table" },
      { n: "List", c: "fa-solid fa-list" },
      { n: "Clipboard", c: "fa-solid fa-clipboard" },
      { n: "Chart Up", c: "fa-solid fa-chart-line" },
      { n: "Chart Pie", c: "fa-solid fa-chart-pie" },
      { n: "Arrow Right", c: "fa-solid fa-arrow-right" },
      { n: "Rocket", c: "fa-solid fa-rocket" },
      { n: "Bell Slash", c: "fa-solid fa-bell-slash" },
      { n: "Database", c: "fa-solid fa-database" },
      { n: "Code", c: "fa-solid fa-code" },
      { n: "Sliders", c: "fa-solid fa-sliders" },
    ],
    []
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return ICONS;
    return ICONS.filter(
      (it) => it.n.toLowerCase().includes(term) || it.c.toLowerCase().includes(term)
    );
  }, [q, ICONS]);

  const handlePick = (cls) => {
    onChange?.(cls);
    setOpen(false);
  };

  return (
    <div className="form-control" ref={wrapRef}>
      {label ? (
        <div className="label">
          <span className="label-text">{label}</span>
        </div>
      ) : null}

      <div className="relative">
        {/* preview on the left */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70 pointer-events-none">
          <i
            className={clsx(value || "fa-solid fa-circle-question", "not-italic")}
            aria-hidden="true"
          />
        </div>

        {/* input */}
        <input
          type="text"
          className={clsx(
            "input input-bordered w-full pl-10 pr-20 rounded-lg",
            disabled && "input-disabled"
          )}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setOpen(true)}
          disabled={disabled}
        />

        {/* controls */}
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
          {value ? (
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => onChange?.("")}
              title="Clear"
            >
              Clear
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={() => setOpen((v) => !v)}
            title="Pick icon"
          >
            Pick
          </button>
        </div>

        {/* dropdown */}
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-base-300 bg-base-100 shadow-xl p-2">
            <input
              type="text"
              className="input input-bordered input-sm w-full mb-2"
              placeholder="Search icons…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />

            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-64 overflow-auto pr-1">
              {filtered.map((it) => (
                <button
                  key={it.c}
                  type="button"
                  className={clsx(
                    "btn btn-ghost btn-sm h-10 min-h-0 border border-transparent hover:border-base-300",
                    value === it.c && "btn-active"
                  )}
                  onClick={() => handlePick(it.c)}
                  title={`${it.n} (${it.c})`}
                >
                  <i className={clsx(it.c, "not-italic")} aria-hidden="true" />
                </button>
              ))}
              {!filtered.length && (
                <div className="col-span-full opacity-60 text-sm px-2 py-1">No matches</div>
              )}
            </div>

            <div className="mt-2 text-xs opacity-70">
              Tip: You can also paste any FA class like <code>fa-solid fa-user</code>.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
