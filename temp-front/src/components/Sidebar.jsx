import { NavLink } from "react-router-dom";
import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { useFormik, FormikProvider } from "formik";
import InputField from "./fields/InputField";
import { menuTree as staticMenu } from "../lib/menu";
import { useDynamicMenu } from "../hooks/useDynamicMenu";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import IconRenderer from "./ui/IconRenderer";

// flatten leaves for search
function flatten(tree) {
  const out = [];
  const walk = (node, parents = []) => {
    if (Array.isArray(node.children) && node.children.length) {
      node.children.forEach((c) => walk(c, [...parents, node.label]));
    } else {
      out.push({
        label: node.label,
        path: node.path ?? "#",
        breadcrumbs: parents,
        full: [...parents, node.label].join(" / "),
      });
    }
  };
  (tree || []).forEach((n) => walk(n));
  return out;
}

export default function Sidebar({ collapsed, setCollapsed }) {
  const { tree: dynamicTree } = useDynamicMenu();
  const activeTree = dynamicTree?.length ? dynamicTree : staticMenu;

  // search
  const [q, setQ] = useState("");
  const flat = useMemo(() => flatten(activeTree), [activeTree]);
  const fuse = useMemo(
    () => new Fuse(flat, { keys: ["label", "full"], threshold: 0.35, ignoreLocation: true }),
    [flat]
  );
  const results = useMemo(
    () => (q.trim() ? fuse.search(q.trim()).map((r) => r.item) : []),
    [q, fuse]
  );

  const searchForm = useFormik({ initialValues: { q: "" }, onSubmit: () => {} });

  return (
    <aside
      className={`h-full bg-base-200 border-r border-base-300 shadow-md transition-all duration-200
                  ${collapsed ? "w-16" : "w-60"} flex flex-col overflow-hidden
                  [&_summary::-webkit-details-marker]:hidden [&_summary::marker]:hidden`}
    >
      {/* 2-line clamp helper for labels (no external CSS needed) */}
      <style>{`
        .twoline{
          display:-webkit-box;
          -webkit-line-clamp:2;
          -webkit-box-orient:vertical;
          overflow:hidden;
          word-break:break-word;
          line-height:1.15;
        }
      `}</style>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-base-200/95 backdrop-blur border-b border-base-300">
        <div className="flex items-center justify-between mb-2 px-3 py-2">
          {/* This is the corrected line */}
          <div className="flex-1 flex justify-center">
            {!collapsed ? <span className="font-semibold"><img className="h-12 w-12" src="/logo.png" alt="Logo" /></span> : <span className="w-4" />}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Search */}
        
        {!collapsed && (
          <FormikProvider value={searchForm}>
            <div className="px-3 pb-2">
              <InputField
                name="q"
                label="Search menu"
                floating
                muteFocus
                labelBgClass="bg-base-200"
                className="mb-0"
                onChange={(e) => {
                  searchForm.handleChange(e);
                  setQ(e.target.value);
                }}
              />
            </div>
          </FormikProvider>
        )}
      </div>

      {/* Content */}
      <div className="px-2 pb-4 overflow-y-auto flex-1">
        {collapsed ? (
          <CollapsedIcons menu={activeTree} onPick={() => setCollapsed(false)} />
        ) : q.trim() ? (
          <SearchResults results={results} />
        ) : (
          <ControlledTree tree={activeTree} /> // <-- Use the new component
        )}
      </div>
    </aside>
  );
}

/* Collapsed icon rail */
function CollapsedIcons({ menu, onPick }) {
  return (
    <ul className="menu gap-1 py-2">
      {(menu || []).map((node) => {
        const Icon = node.Icon;     // from static menu
        const fa = node.icon || null; // from dynamic
        return (
          <li key={node.label} className="tooltip tooltip-right" data-tip={node.label}>
            <button className="btn btn-ghost btn-square" onClick={onPick}>
              <IconRenderer Icon={Icon} fa={fa} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function SearchResults({ results }) {
  if (!results.length) return <div className="opacity-70 px-2 py-1">No matches</div>;
  return (
    <ul className="menu gap-0.5">
      {results.map((item) => (
        <li key={item.full}>
          <NavLink to={item.path} className="block w-full px-2 py-1.5 rounded-md hover:bg-base-300/50">
            <div className="text-xs opacity-60 twoline">{item.breadcrumbs.join(" › ")}</div>
            <div className="font-medium twoline">{item.label}</div>
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

// Top-level wrapper for the controlled tree
function ControlledTree({ tree }) {
    const [openItem, setOpenItem] = useState(null);

    const handleToggle = (label) => {
        setOpenItem(openItem === label ? null : label);
    };

    return <Tree tree={tree} depth={0} openItem={openItem} onToggle={handleToggle} />;
}

/* Nested tree with icons */
function Tree({ tree, depth = 0, openItem, onToggle }) {
  return (
    <ul className="space-y-0.5">
      {(tree || []).map((node) => {
        const hasKids = Array.isArray(node.children) && node.children.length > 0;
        const Icon = node.Icon;          // static menu support
        const fa = node.icon || null;    // dynamic FA string
        const isOpen = openItem === node.label;

        if (hasKids) {
          return (
            <li key={`${node.label}-${depth}`}>
              <details className="group" open={isOpen}>
                <summary
                  className="list-none h-8 flex items-center gap-2 px-2 rounded-md cursor-pointer
                             hover:bg-base-300/50 select-none
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  onClick={(e) => {
                    e.preventDefault(); // <-- Prevent native behavior
                    onToggle(node.label);
                  }}
                >
                  <IconRenderer Icon={depth === 0 ? Icon : undefined} fa={fa} />
                  <span className="twoline flex-1 min-w-0 font-medium" title={node.label}>
                    {node.label}
                  </span>
                  <ChevronDown className="ml-2 w-4 h-4 text-base-content/60 transition-transform group-open:rotate-180" />
                </summary>

                <div className="ml-3 pl-3 border-l border-base-300/50">
                  <Tree tree={node.children} depth={depth + 1} openItem={openItem} onToggle={onToggle} />
                </div>
              </details>
            </li>
          );
        }

        const disabled = !node.path || node.path === "#";
        return (
          <li key={`${node.label}-${node.path || "no-path"}`} className="relative">
            {disabled ? (
              <span
                className="relative flex items-center gap-2 w-full pl-2 pr-2 py-1.5 rounded-md opacity-60
                           before:content-[''] before:absolute before:left-0.5 before:top-1/2 before:-translate-y-1/2
                           before:w-3 before:border-t before:border-base-300/50"
              >
                <IconRenderer fa={fa} />
                <span className="twoline flex-1 min-w-0" title={node.label}>{node.label}</span>
              </span>
            ) : (
              <NavLink
                to={node.path}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 w-full pl-2 pr-2 py-1.5 rounded-md
                   hover:bg-base-300/40 focus-visible:outline-none
                   focus-visible:ring-2 focus-visible:ring-primary/30
                   before:content-[''] before:absolute before:left-0.5 before:top-1/2 before:-translate-y-1/2
                   before:w-3 before:border-t before:border-base-300/50
                   ${isActive ? "text-primary font-medium after:absolute after:left-0 after:top-1 after:bottom-1 after:w-[3px] after:bg-primary after:rounded-full" : ""}`
                }
              >
                <IconRenderer fa={fa} />
                <span className="twoline flex-1 min-w-0" title={node.label}>{node.label}</span>
              </NavLink>
            )}
          </li>
        );
      })}
    </ul>
  );
}