// src/components/table/DataTable.jsx
import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Columns,
  Database,
  Filter,
  UploadCloud,
  AlertCircle,
  Clock,
} from "lucide-react";
import clsx from "clsx";

/**
 * Reusable DataTable (R&D prototype)
 */
export default function DataTable({
  title,
  data = [],
  columns = undefined,
  searchable = true,
  selection = true,
  showId = false, 
  pageSizeOptions = [10, 25, 50],
  initialPageSize = 10,
  initialSort,
  stickyHeader = true,
  importMeta,
  onSelectionChange,
  filterComponent, // 👈 New prop for the filter menu
}) {
  // ---- columns ----
  const inferredCols = useMemo(() => {
    let cols = [];
    if (columns && columns.length > 0) {
      cols = columns.map((c) =>
        typeof c === "string" ? { key: c, header: humanize(c) } : { header: humanize(c.key), ...c }
      );
    } else {
      const first = data?.[0] || {};
      cols = Object.keys(first).map((k) => ({ key: k, header: humanize(k) }));
    }

    if (showId) {
      cols = [{ key: 'id', header: 'ID', render: (val, row, index) => index + 1, isSortable: false }, ...cols];
    }
    return cols;
  }, [columns, data, showId]);

  const [visibleCols, setVisibleCols] = useState(() => new Set(inferredCols.map((c) => c.key)));
  useEffect(() => { setVisibleCols(new Set(inferredCols.map((c) => c.key))); }, [inferredCols]);
  
  const allColumnsVisible = useMemo(() => {
    return inferredCols.length > 0 && visibleCols.size === inferredCols.length;
  }, [visibleCols, inferredCols]);

  const toggleAllColumns = () => {
    if (allColumnsVisible) {
      setVisibleCols(new Set());
    } else {
      setVisibleCols(new Set(inferredCols.map(c => c.key)));
    }
  };

  // ---- search & sort ----
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(() => initialSort || { key: inferredCols[0]?.key, dir: "asc" });

  const toggleSort = (key) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
    });
  };

  // ---- pagination ----
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [query, pageSize, data]);

  // ---- selection ----
  const [selected, setSelected] = useState(() => new Set());
  useEffect(() => {
    if (onSelectionChange) {
      const rows = data.filter((_, idx) => selected.has(idx));
      onSelectionChange(rows);
    }
  }, [selected, data, onSelectionChange]);

  // ---- filtering ----
  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    const keys = inferredCols.map((c) => c.key);
    return data.filter((row) =>
      keys.some((k) => String(row?.[k] ?? "").toLowerCase().includes(q))
    );
  }, [query, data, inferredCols]);

  // ---- sorting ----
  const sorted = useMemo(() => {
    if (!sort?.key) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a?.[sort.key];
      const bv = b?.[sort.key];
      if (av == null && bv == null) return 0;
      if (av == null) return sort.dir === "asc" ? -1 : 1;
      if (bv == null) return sort.dir === "asc" ? 1 : -1;
      if (typeof av === "number" && typeof bv === "number") {
        return sort.dir === "asc" ? av - bv : bv - av;
      }
      const as = String(av).toLowerCase();
      const bs = String(bv).toLowerCase();
      if (as < bs) return sort.dir === "asc" ? -1 : 1;
      if (as > bs) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sort]);

  // ---- pagination compute ----
  const totalRows = sorted.length;
  const totalCols = inferredCols.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const pageSafe = Math.min(Math.max(page, 1), totalPages);
  const start = (pageSafe - 1) * pageSize;
  const end = start + pageSize;
  const pageRows = sorted.slice(start, end);

  const allVisibleSelected = pageRows.every((_, idx) => selected.has(start + idx)) && pageRows.length > 0;

  const toggleSelectAll = () => {
    const next = new Set(selected);
    if (allVisibleSelected) {
      pageRows.forEach((_, idx) => next.delete(start + idx));
    } else {
      pageRows.forEach((_, idx) => next.add(start + idx));
    }
    setSelected(next);
  };

  const toggleSelectRow = (absIndex) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(absIndex)) next.delete(absIndex);
      else next.add(absIndex);
      return next;
    });
  };

  // ---- column menu ----
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const colBtnRef = useRef(null);
  useOutside(colBtnRef, () => setColMenuOpen(false));

  // ---- details modal ----
  const [detailsOpen, setDetailsOpen] = useState(false);
  const detailsRef = useRef(null);
  useOutside(detailsRef, () => setDetailsOpen(false));
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setDetailsOpen(false); };
    if (detailsOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [detailsOpen]);

  // ---- import meta derived ----
  const importStats = useMemo(() => formatImportMeta(importMeta), [importMeta]);

  return (
    <div className="w-full">
      {/* Top bar: title + search on the LEFT, columns on the RIGHT */}
      <div className="pl-1">
        <div className="mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            {searchable && (
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                <input
                  className="input input-bordered w-full pl-8"
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button
                    className="btn btn-ghost btn-xs absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={() => setQuery("")}
                    type="button"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {filterComponent} {/* 👈 Render the filter component here */}
            {/* Column visibility */}
            <div className="relative" ref={colBtnRef}>
              <button
                className="btn btn-ghost"
                onClick={() => setColMenuOpen((v) => !v)}
                aria-label="Columns"
                title="Show/Hide columns"
                type="button"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Columns</span>
              </button>

              {colMenuOpen && (
                <div className="absolute right-0 z-40 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-xl p-2">
                  <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer border-b border-gray-200 mb-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-success checkbox-sm"
                      checked={allColumnsVisible}
                      onChange={toggleAllColumns}
                    />
                    <span className="text-sm">Select All</span>
                  </label>

                  <div className="max-h-64 overflow-auto">
                    {inferredCols.map((c) => {
                      const checked = visibleCols.has(c.key);
                      return (
                        <label key={c.key} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-success checkbox-sm"
                            checked={checked}
                            onChange={() => {
                              setVisibleCols((prev) => {
                                const next = new Set(prev);
                                if (checked) next.delete(c.key);
                                else next.add(c.key);
                                return next;
                              });
                            }}
                          />
                          <span className="text-sm">{c.header ?? humanize(c.key)}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="table table-auto w-full">
            <thead className={clsx(stickyHeader && "sticky top-0 z-20", "bg-gray-100")}>
              <tr className="text-gray-700 uppercase text-xs leading-normal">
                {selection && (
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                      aria-label="Select page rows"
                    />
                  </th>
                )}
                {inferredCols.map((col) =>
                  !visibleCols.has(col.key) ? null : (
                    <th
                      key={col.key}
                      className={clsx("py-3 px-4 text-left select-none", col.align === "right" && "text-right", col.align === "center" && "text-center")}
                    >
                      <button className="inline-flex items-center gap-1 hover:opacity-80" onClick={() => toggleSort(col.key)} type="button">
                        <span>{col.header ?? humanize(col.key)}</span>
                        <ArrowUpDown className={clsx("h-3.5 w-3.5", sort?.key === col.key && "text-gray-900")} />
                      </button>
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody className="text-gray-800 text-sm">
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={(selection ? 1 : 0) + Array.from(visibleCols).length} className="py-8 text-center text-gray-500">
                    No data
                  </td>
                </tr>
              ) : (
                pageRows.map((row, i) => {
                  const absIndex = start + i;
                  const isSelected = selected.has(absIndex);
                  return (
                    <tr key={absIndex} className="border-b border-gray-100 hover:bg-gray-50">
                      {selection && (
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-success checkbox-sm"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(absIndex)}
                          />
                        </td>
                      )}
                      {inferredCols.map((col) =>
                        !visibleCols.has(col.key) ? null : (
                          <td
                            key={col.key}
                            className={clsx("py-3 px-4", col.align === "right" && "text-right", col.align === "center" && "text-center")}
                            style={{ width: col.width }}
                          >
                            {col.render ? col.render(row[col.key], row, i) : safeCell(row[col.key])}
                          </td>
                        )
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: left = summary, right = pagination + details button */}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-gray-600">
            Showing <b>{pageRows.length}</b> of <b>{totalRows}</b> rows
            {query ? <> (filtered from <b>{data.length}</b>)</> : null}
          </div>

          <div className="flex items-center gap-2">
            <select
              className="select select-bordered select-sm"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>{n} / page</option>
              ))}
            </select>

            <div className="join">
              <button
                className="btn btn-sm join-item"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pageSafe <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="btn btn-sm join-item pointer-events-none">
                Page {pageSafe} / {totalPages}
              </button>
              <button
                className="btn btn-sm join-item"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={pageSafe >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Bottom-right Table details */}
            <button
              className="ml-4 btn btn-ghost btn-sm inline-flex items-center gap-2"
              onClick={() => setDetailsOpen(true)}
              type="button"
              title="View table details"
            >
              <Database className="h-4 w-4" />
              <span>Table details</span>
            </button>
          </div>
        </div>
      </div>
      {/* ===== Modal: Table details ===== */}
      {detailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div ref={detailsRef} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Table details</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setDetailsOpen(false)} type="button">✕</button>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatChip icon={<Database className="h-3.5 w-3.5" />} label="Rows" value={totalRows} />
                <StatChip icon={<Columns className="h-3.5 w-3.5" />} label="Cols" value={totalCols} />
                {query ? <StatChip icon={<Filter className="h-3.5 w-3.5" />} label="Filtered" value={sorted.length} /> : null}
                {selected.size > 0 ? <StatChip icon={<CheckSquare className="h-3.5 w-3.5" />} label="Selected" value={selected.size} /> : null}
                {importStats ? (
                  <>
                    {importStats.duration && <StatChip icon={<Clock className="h-3.5 w-3.5" />} label="Duration" value={importStats.duration} />}
                    {num(importStats.added) > 0 && <StatChip label="Added" tone="success" value={importStats.added} icon={<UploadCloud className="h-3.5 w-3.5" />} />}
                    {num(importStats.updated) > 0 && <StatChip label="Updated" tone="warning" value={importStats.updated} />}
                    {num(importStats.skipped) > 0 && <StatChip label="Skipped" tone="secondary" value={importStats.skipped} />}
                    {num(importStats.errors) > 0 && <StatChip label="Errors" tone="error" value={importStats.errors} icon={<AlertCircle className="h-3.5 w-3.5" />} />}
                  </>
                ) : null}
              </div>

              <div className="overflow-x-auto">
                <table className="table w-full">
                  <tbody className="text-sm">
                    <tr><td className="font-medium w-40">Total rows</td><td>{totalRows}</td></tr>
                    <tr><td className="font-medium">Visible columns</td><td>{Array.from(visibleCols).length} / {totalCols}</td></tr>
                    <tr><td className="font-medium">Current page</td><td>{pageSafe} / {totalPages} (size {pageSize})</td></tr>
                    {query && <tr><td className="font-medium">Search query</td><td><code className="px-1.5 py-0.5 bg-gray-100 rounded">{query}</code></td></tr>}
                    {importStats && (
                      <>
                        <tr><td className="font-medium">Duration</td><td>{importStats.duration ?? "—"}</td></tr>
                        <tr><td className="font-medium">Added / Updated</td><td>{num(importStats.added)} / {num(importStats.updated)}</td></tr>
                        <tr><td className="font-medium">Skipped / Errors</td><td>{num(importStats.skipped)} / {num(importStats.errors)}</td></tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="text-right">
                <button className="btn btn-primary btn-sm" onClick={() => setDetailsOpen(false)} type="button">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------- helpers & small components ----------------- */

function humanize(key) {
  return String(key)
    .replace(/[_\-]+/g, " ")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

function safeCell(v) {
  if (v === null || v === undefined) return <span className="text-gray-400">—</span>;
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}

function num(n) {
  return typeof n === "number" ? n : 0;
}

function formatImportMeta(meta) {
  if (!meta) return null;
  const { startedAt, finishedAt, added, updated, skipped, errors } = meta;
  let duration = null;
  if (startedAt && finishedAt) {
    const ms = Math.max(0, new Date(finishedAt) - new Date(startedAt));
    duration = ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(2)} s`;
  }
  return { duration, added, updated, skipped, errors };
}

function useOutside(ref, onOutside) {
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onOutside?.();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside]);
}

function StatChip({ icon, label, value, tone = "default" }) {
  const toneClass =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : tone === "warning"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : tone === "error"
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : tone === "secondary"
      ? "bg-indigo-50 text-indigo-700 ring-indigo-200"
      : "bg-gray-50 text-gray-700 ring-gray-200";

  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ring-1", toneClass)}>
      {icon ? icon : null}
      <span className="font-medium">{label}</span>
      {value !== undefined ? <span className="opacity-80">{value}</span> : null}
    </span>
  );
}