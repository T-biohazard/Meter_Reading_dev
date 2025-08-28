
// src/pages/Dashboard.jsx
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import authService from "../services/authService";
import { useAuth } from "../app/AuthContext";

import InputField from "../components/fields/InputField";
import Button from "../components/ui/Button";
import IconPickerFA from "../components/ui/IconPickerFA";

import { LayoutList, GitBranch, FileText, Link as LinkIcon } from "lucide-react";

/* ---------------- validation ---------------- */
const Schema = Yup.object({
  page_name: Yup.string().required("Page name is required."),
  path: Yup.string()
    .matches(/^\/[a-zA-Z0-9\-/_]*$/, "Path must start with / and use letters, numbers, -, _, and / only.")
    .required("Path is required."),
  menu_name: Yup.string().nullable(),
  sub_menu_name: Yup.string().nullable(),
  status: Yup.boolean().default(true),
});

/* ---------------- helpers (UI) ---------------- */
function Section({ title, icon: Icon, description, children }) {
  return (
    <section className="border-b border-base-300/70 p-5">
      <div className="mb-4 flex items-start gap-2">
        {Icon ? <Icon className="w-5 h-5 opacity-70 mt-0.5" /> : null}
        <div>
          <h3 className="font-semibold text-lg leading-tight">{title}</h3>
          {description ? <p className="text-sm opacity-70">{description}</p> : null}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function ExistsChip({ exists }) {
  const base =
    "badge badge-sm inline-flex items-center align-middle leading-none px-2 py-[2px] rounded-full whitespace-nowrap relative -top-px";
  return (
    <span className={`${base} ${exists ? "badge-warning" : "badge-success"}`}>
      {exists ? "Exists" : "Available"}
    </span>
  );
}

/* ---- IconInput: uses InputField; emoji button shows on hover OR focus ---- */
function IconInput({ name, label, value, setFieldValue, placeholder = "fa-solid fa-house" }) {
  const [open, setOpen] = useState(false);

  // for the single-field dropdown search inside the modal
  const [showList, setShowList] = useState(false);

  return (
    <div className="relative self-start group">
      <InputField
        name={name}
        label={label}
        labelBgClass="bg-base-100"
        placeholder={placeholder}
        inputClassName="pr-16"
      />

      {/* emoji opener on the right of the input */}
      <button
        type="button"
        aria-label="Pick icon"
        onClick={() => setOpen(true)}
        className={[
          "absolute right-2",
          "top-[0.1rem]",
          "h-8 w-8 rounded-full bg-base-200 hover:bg-base-300",
          "flex items-center justify-center text-base leading-none",
          "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity",
          "shadow-sm",
        ].join(" ")}
      >
        <span>🙂</span>
      </button>

      {/* modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-base-100 rounded-xl shadow-xl w-full max-w-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Choose an icon</h4>
              <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {/* ========= REPLACED BLOCK START (now shows a grid of real icons) ========= */}
              <div className="relative">
                {/* The single reusable input is the search box */}
                <InputField
                  name={name}
                  label="Search icons"
                  labelBgClass="bg-base-100"
                  placeholder={placeholder}
                  inputClassName="pr-3"
                  onFocus={() => setShowList(true)}
                  onBlur={() => setTimeout(() => setShowList(false), 120)}
                />

                {(() => {
                  // same set as your IconPickerFA (name + class) for grid rendering
                  const GRID_ICONS = [
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
                  ];
                  const q = (value || "").toLowerCase().trim();
                  const filtered = (q
                    ? GRID_ICONS.filter(
                        (it) => it.n.toLowerCase().includes(q) || it.c.toLowerCase().includes(q)
                      )
                    : GRID_ICONS
                  ).slice(0, 150);

                  return (
                    showList && (
                      <div className="absolute z-50 left-0 right-0 mt-1 rounded-lg border border-base-300 bg-base-100 shadow-xl p-2">
                        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-64 overflow-auto pr-1">
                          {filtered.map((it) => (
                            <button
                              key={it.c}
                              type="button"
                              className={[
                                "btn btn-ghost btn-sm h-10 min-h-0",
                                "border border-transparent hover:border-base-300",
                                value === it.c ? "btn-active" : "",
                              ].join(" ")}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setFieldValue(name, it.c);
                                setShowList(false);
                              }}
                              title={`${it.n} (${it.c})`}
                            >
                              <i className={`${it.c} not-italic`} aria-hidden="true" />
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
                    )
                  );
                })()}
              </div>
              {/* ========= REPLACED BLOCK END ========= */}

              <div className="text-right">
                <button className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- page ---------------- */
export default function Dashboard() {
  const { token } = useAuth();
  const [menuLocked, setMenuLocked] = useState(false);
  const [subLocked, setSubLocked] = useState(false);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["menu-page-elements:composer"],
    queryFn: () => authService.listMenuPageElements(token),
    enabled: !!token,
  });

  // Build menu + submenu lookups
  const allMenus = useMemo(() => {
    const map = new Map();
    rows.forEach((r) => {
      if (r.menu_name) {
        if (!map.has(r.menu_name)) map.set(r.menu_name, { name: r.menu_name, icon: r.menu_icon || "" });
        else if (r.menu_icon && !map.get(r.menu_name).icon) map.get(r.menu_name).icon = r.menu_icon;
      }
    });
    return [...map.values()];
  }, [rows]);

  const submenusByMenu = useMemo(() => {
    const map = new Map();
    rows.forEach((r) => {
      if (!r.menu_name || !r.sub_menu_name) return;
      if (!map.has(r.menu_name)) map.set(r.menu_name, new Map());
      const inner = map.get(r.menu_name);
      if (!inner.has(r.sub_menu_name)) inner.set(r.sub_menu_name, r.sub_menu_icon || "");
      else if (r.sub_menu_icon && !inner.get(r.sub_menu_name)) inner.set(r.sub_menu_name, r.sub_menu_icon);
    });
    return map;
  }, [rows]);

  // helpers
  const menuOptions = allMenus.map((m) => ({ label: m.name, value: m.name }));
  const subOptions = (menuName) => {
    const m = submenusByMenu.get(menuName);
    if (!m) return [];
    return [...m.keys()].map((s) => ({ label: s, value: s }));
  };
  const existsMenu = (name) => !!allMenus.find((m) => m.name === name);
  const existsSub = (menu, sub) => {
    const m = submenusByMenu.get(menu);
    return !!(m && m.has(sub));
  };

  // initial values
  const initialValues = {
    menu_name: "",
    menu_icon: "",
    sub_menu_name: "",
    sub_menu_icon: "",
    page_name: "",
    page_icon: "",
    path: "",
    status: true,
  };

  return (
    <div className="max-w-none mr-auto">
      <style>{`
        input[name="menu_icon"],
        input[name="sub_menu_icon"],
        input[name="page_icon"] { padding-right: 4rem; }
      `}</style>

      <header className="mb-6">
        <h1 className="text-2xl font-bold">Menu Composer</h1>
        <p className="opacity-70">Create or attach a page under a Menu / Sub-menu. Pick icons and toggle status.</p>
      </header>

      <div className="bg-base-100">
        <div className="card-body">
          {isLoading ? (
            <div className="animate-pulse h-24">Loading suggestions…</div>
          ) : (
            <Formik
              initialValues={initialValues}
              validationSchema={Schema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                try {
                  const payload = {
                    page_name: values.page_name,
                    path: values.path,
                    menu_name: values.menu_name || null,
                    menu_icon: values.menu_icon || null,
                    sub_menu_name: values.sub_menu_name || null,
                    sub_menu_icon: values.sub_menu_icon || null,
                    page_icon: values.page_icon || null,
                    status: values.status ? 1 : 0,
                  };
                  await authService.createMenuPageElement(payload, token);
                  resetForm();
                  setMenuLocked(false);
                  setSubLocked(false);
                } catch (e) {
                  console.error("Create failed:", e);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ values, setFieldValue, isSubmitting, isValid, handleReset }) => {
                const menuExists = !!values.menu_name && existsMenu(values.menu_name);
                const submenuExists =
                  !!values.menu_name && !!values.sub_menu_name && existsSub(values.menu_name, values.sub_menu_name);

                const lockMenu = (name) => {
                  const found = allMenus.find((m) => m.name === name);
                  if (found?.icon) setFieldValue("menu_icon", found.icon);
                  setMenuLocked(true);
                };
                const lockSub = (sub) => {
                  const m = submenusByMenu.get(values.menu_name);
                  const icon = m?.get(sub);
                  if (icon) setFieldValue("sub_menu_icon", icon);
                  setSubLocked(true);
                };

                return (
                  <Form noValidate className="space-y-6">
                    {/* ---------- Parent menu box (2 cols) ---------- */}
                    <Section
                      title="Parent menu"
                      icon={LayoutList}
                      description="Pick existing or type a new parent menu."
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        {/* left */}
                        <div className="space-y-2 self-start">
                          <div className="relative group">
                            <InputField
                              name="menu_name"
                              label="Menu name"
                              labelBgClass="bg-base-100"
                              placeholder="e.g. Main, Settings"
                              dropdown={!menuLocked}
                              options={menuOptions}
                              onSelect={(opt) => {
                                setFieldValue("menu_name", opt.value);
                                lockMenu(opt.value);
                              }}
                              readOnly={menuLocked}
                              inputClassName={menuLocked ? "pr-20" : undefined}
                              help={
                                !values.menu_name ? (
                                  "Pick existing or type a new menu name."
                                ) : menuExists ? (
                                  <span className="inline-flex items-center gap-2">
                                    <span>This matches an</span>
                                    <ExistsChip exists={menuExists} />
                                    <span>menu (locked).</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-2">
                                    <span>New menu will be created —</span>
                                    <ExistsChip exists={false} />
                                  </span>
                                )
                              }
                            />

                            {menuLocked && (
                              <button
                                type="button"
                                className={[
                                  "absolute right-2 top-[0.1rem]",
                                  "btn btn-ghost btn-xs",
                                  "opacity-80 hover:opacity-100",
                                ].join(" ")}
                                onClick={() => setMenuLocked(false)}
                              >
                                Change
                              </button>
                            )}
                          </div>
                        </div>

                        {/* right: icon */}
                        <IconInput
                          name="menu_icon"
                          label="Menu icon (optional)"
                          value={values.menu_icon}
                          setFieldValue={setFieldValue}
                        />
                      </div>
                    </Section>

                    {/* ---------- Sub-menu box (2 cols) ---------- */}
                    <Section
                      title="Sub-menu"
                      icon={GitBranch}
                      description="Choose a Menu to see its Sub-menus, or type a new one."
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        {/* left with SAME inline chip + inside input Change */}
                        <div className="space-y-2 self-start">
                          <div className="relative group">
                            <InputField
                              name="sub_menu_name"
                              label="Sub-menu name (optional)"
                              labelBgClass="bg-base-100"
                              placeholder={values.menu_name ? "Pick or type…" : "Pick a Menu first"}
                              disabled={!values.menu_name}
                              dropdown={!subLocked && !!values.menu_name}
                              options={subOptions(values.menu_name)}
                              onSelect={(opt) => {
                                setFieldValue("sub_menu_name", opt.value);
                                lockSub(opt.value);
                              }}
                              readOnly={subLocked}
                              inputClassName={subLocked ? "pr-20" : undefined}
                              help={
                                !values.menu_name ? (
                                  "Choose a Menu to see its Sub-menus."
                                ) : !values.sub_menu_name ? (
                                  "Pick existing or type a new sub-menu."
                                ) : submenuExists ? (
                                  <span className="inline-flex items-center gap-2">
                                    <span>This matches an</span>
                                    <ExistsChip exists={submenuExists} />
                                    <span>sub-menu (locked).</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-2">
                                    <span>New sub-menu will be created —</span>
                                    <ExistsChip exists={false} />
                                  </span>
                                )
                              }
                            />

                            {subLocked && (
                              <button
                                type="button"
                                className={[
                                  "absolute right-2 top-[0.1rem]",
                                  "btn btn-ghost btn-xs",
                                  "opacity-80 hover:opacity-100",
                                ].join(" ")}
                                onClick={() => setSubLocked(false)}
                              >
                                Change
                              </button>
                            )}
                          </div>
                        </div>

                        {/* right: sub icon */}
                        <IconInput
                          name="sub_menu_icon"
                          label="Sub-menu icon (optional)"
                          value={values.sub_menu_icon}
                          setFieldValue={setFieldValue}
                        />
                      </div>
                    </Section>

                    {/* ---------- Page (child) box ---------- */}
                    <Section
                      title="Page"
                      icon={FileText}
                      description="This is the actual page link that appears under the menu/sub-menu."
                    >
                      {/* 3 fields in a single row on md+ */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                        <div className="space-y-2 self-start">
                          <InputField name="page_name" label="Page name" labelBgClass="bg-base-100" required />
                        </div>


                        
                        <div className="space-y-2 self-start">
                          <InputField
                            name="path"
                            label={
                              <>
                                <LinkIcon className="inline-block h-3.5 w-3.5 -mt-0.5 mr-1 opacity-70" />
                                Path
                              </>
                            }
                            labelBgClass="bg-base-100"
                            placeholder="/users"
                            required
                            help="Must start with a slash, e.g. /users or /settings/profile."
                          />
                          
                        </div>
                        <IconInput
                          name="page_icon"
                          label="Page icon (optional)"
                          value={values.page_icon}
                          setFieldValue={setFieldValue}
                        />
                      </div>
                    </Section>

                    {/* Actions: Status on the left, Save/Reset on the right */}
                    <div className="pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-sans font-medium opacity-80">Status</label>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={values.status}
                          onChange={(e) => setFieldValue("status", e.target.checked)}
                        />
                        <span className="opacity-80">{values.status ? "Active" : "Inactive"}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button intent="primary" type="submit" disabled={!isValid || isSubmitting} loading={isSubmitting}>
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            handleReset();
                            setMenuLocked(false);
                            setSubLocked(false);
                          }}
                          disabled={isSubmitting}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          )}
        </div>
      </div>
    </div>
  );
}


