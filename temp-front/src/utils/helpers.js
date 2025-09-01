/**
 * Converts a camelCase or snake_case string into a human-readable title.
 * @param {string} key The string to humanize.
 * @returns {string} The humanized string.
 */
export function humanize(key) {
  return String(key)
    .replace(/[_\-]+/g, " ")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

/**
 * Safely renders a cell value, handling null/undefined and booleans.
 * @param {*} v The value to render.
 * @returns {string | JSX.Element} The rendered value.
 */
export function safeCell(v) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}

/**
 * Formats import metadata for display.
 * @param {object} meta Import metadata object.
 * @returns {object | null} Formatted stats or null.
 */
export function formatImportMeta(meta) {
  if (!meta) return null;
  const { startedAt, finishedAt, added, updated, skipped, errors } = meta;
  let duration = null;
  if (startedAt && finishedAt) {
    const ms = Math.max(0, new Date(finishedAt) - new Date(startedAt));
    duration = ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(2)} s`;
  }
  return { duration, added, updated, skipped, errors };
}

/**
 * A custom hook to detect clicks outside of a component.
 * @param {object} ref A React ref to the component.
 * @param {function} onOutside The function to call when an outside click is detected.
 */
export function useOutside(ref, onOutside) {
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onOutside?.();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside]);
}