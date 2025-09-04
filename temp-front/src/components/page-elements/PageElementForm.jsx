// src/components/page-elements/PageElementForm.jsx

import { useState, useMemo, useEffect } from "react";
import { FormikProvider, useFormik, Form } from "formik";
import * as Yup from "yup";

import Button from "../ui/Button";
import InputField from "../fields/InputField";
import { Link as LinkIcon, ArrowLeft } from "lucide-react";

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
function ExistsChip({ exists }) {
  const base =
    "badge badge-sm inline-flex items-center align-middle leading-none px-2 py-[2px] rounded-full whitespace-nowrap relative -top-px";
  return (
    <span className={`${base} ${exists ? "badge-warning" : "badge-success"}`}>
      {exists ? "Exists" : "Available"}
    </span>
  );
}

function IconInput({ name, label, value, placeholder = "fa-solid fa-house", formik }) {
  const [open, setOpen] = useState(false);
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
              <div className="relative">
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
                                formik.setFieldValue(name, it.c);
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

/* ---------------- main component ---------------- */
export default function PageElementForm({
  onSubmit,
  onCancel,
  allMenus,
  submenusByMenu,
  isLoading,
}) {
  const [menuLocked, setMenuLocked] = useState(false);
  const [subLocked, setSubLocked] = useState(false);

  // Reset locks when form is reinitialized
  useEffect(() => {
    setMenuLocked(false);
    setSubLocked(false);
  }, []);

  const menuOptions = useMemo(() => {
    if (!allMenus) return [];
    return allMenus.map((m) => ({ label: m.name, value: m.name }));
  }, [allMenus]);

  const subOptions = useMemo(() => {
    return (menuName) => {
      if (!submenusByMenu) return [];
      const m = submenusByMenu.get(menuName);
      if (!m) return [];
      return [...m.keys()].map((s) => ({ label: s, value: s }));
    };
  }, [submenusByMenu]);

  const existsMenu = (name) => !!allMenus?.find((m) => m.name === name);
  const existsSub = (menu, sub) => {
    const m = submenusByMenu?.get(menu);
    return !!(m && m.has(sub));
  };

  const formik = useFormik({
    initialValues: {
      page_name: "",
      path: "",
      menu_name: "",
      menu_icon: "",
      sub_menu_name: "",
      sub_menu_icon: "",
      page_icon: "",
      status: true,
    },
    validationSchema: Schema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
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
        await onSubmit(payload, { resetForm });
      } catch (e) {
        console.error("Save failed:", e);
      } finally {
        setSubmitting(false);
      }
    },
    enableReinitialize: true,
  });

  // Automatically update menu_icon when menu_name changes
  useEffect(() => {
    if (menuLocked) return;
    const found = allMenus?.find((m) => m.name === formik.values.menu_name);
    if (found?.icon) {
      formik.setFieldValue("menu_icon", found.icon);
    } else if (!formik.values.menu_icon) {
      formik.setFieldValue("menu_icon", "");
    }
  }, [formik.values.menu_name, allMenus, menuLocked]);

  // Automatically update sub_menu_icon when sub_menu_name changes
  useEffect(() => {
    if (subLocked) return;
    const icon = submenusByMenu?.get(formik.values.menu_name)?.get(formik.values.sub_menu_name);
    if (icon) {
      formik.setFieldValue("sub_menu_icon", icon);
    } else if (!formik.values.sub_menu_icon) {
      formik.setFieldValue("sub_menu_icon", "");
    }
  }, [formik.values.menu_name, formik.values.sub_menu_name, submenusByMenu, subLocked]);

  return (
    <div className='p-t4'>
      <div className="flex items-center space-x-2">
        <Button
          variant="icon"
          type="button"
          onClick={onCancel}
          className="p-1 -ml-2 mt-1 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={24} />
        </Button>
        <h1 className='text-2xl font-bold mt-2'>
          Add Page
        </h1>
      </div>
      <p className="opacity-70 mb-16">Create or modify a menu, sub-menu, or page.</p>

      {isLoading ? (
        <div className="animate-pulse h-24">Loading suggestions…</div>
      ) : (
        <FormikProvider value={formik}>
          <Form className='grid grid-cols-1 md:grid-cols-2 gap-4' onSubmit={formik.handleSubmit}>
            {/* Parent Menu Section */}
            <div className="md:col-span-full">
              <h3 className="font-semibold text-lg leading-tight mb-8">Parent Menu</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-200 pb-4">
                <InputField
                  name="menu_name"
                  label="Menu Name"
                  placeholder="e.g. Main, Settings"
                  dropdown
                  options={menuOptions}
                  onSelect={(opt) => {
                    formik.setFieldValue("menu_name", opt.value);
                    const found = allMenus?.find((m) => m.name === opt.value);
                    if (found?.icon) formik.setFieldValue("menu_icon", found.icon);
                  }}
                  help={
                    !formik.values.menu_name ? (
                      "Pick an existing menu or type a new one."
                    ) : existsMenu(formik.values.menu_name) ? (
                      <span className="inline-flex items-center gap-2">
                        <span>This matches an</span>
                        <ExistsChip exists={true} />
                        <span>menu.</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <span>New menu will be created —</span>
                        <ExistsChip exists={false} />
                      </span>
                    )
                  }
                />
                <IconInput
                  name="menu_icon"
                  label="Menu Icon (optional)"
                  value={formik.values.menu_icon}
                  formik={formik}
                />
              </div>
            </div>

            {/* Sub-menu Section */}
            <div className="md:col-span-full">
              <h3 className="font-semibold text-lg leading-tight mt-4 mb-8">Sub-menu</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-200 pb-4">
                <InputField
                  name="sub_menu_name"
                  label="Sub-menu Name (optional)"
                  placeholder={formik.values.menu_name ? "Pick or type…" : "Pick a Menu first"}
                  disabled={!formik.values.menu_name}
                  dropdown
                  options={subOptions(formik.values.menu_name)}
                  onSelect={(opt) => {
                    formik.setFieldValue("sub_menu_name", opt.value);
                    const icon = submenusByMenu?.get(formik.values.menu_name)?.get(opt.value);
                    if (icon) formik.setFieldValue("sub_menu_icon", icon);
                  }}
                  help={
                    !formik.values.menu_name ? (
                      "Choose a Menu to see its Sub-menus."
                    ) : !formik.values.sub_menu_name ? (
                      "Pick an existing sub-menu or type a new one."
                    ) : existsSub(formik.values.menu_name, formik.values.sub_menu_name) ? (
                      <span className="inline-flex items-center gap-2">
                        <span>This matches an</span>
                        <ExistsChip exists={true} />
                        <span>sub-menu.</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <span>New sub-menu will be created —</span>
                        <ExistsChip exists={false} />
                      </span>
                    )
                  }
                />
                <IconInput
                  name="sub_menu_icon"
                  label="Sub-menu Icon (optional)"
                  value={formik.values.sub_menu_icon}
                  formik={formik}
                />
              </div>
            </div>

            {/* Page Section */}
            <div className="md:col-span-full">
              <h3 className="font-semibold text-lg leading-tight mt-4 mb-8">Page</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
                <InputField
                  name="page_name"
                  label="Page Name"
                />
                <InputField
                  name="path"
                  label={<><LinkIcon className="inline-block h-3.5 w-3.5 -mt-0.5 mr-1 opacity-70" />Path</>}
                  placeholder="/users"
                  required
                  help="Must start with a slash, e.g. /users or /settings/profile."
                />
                <IconInput
                  name="page_icon"
                  label="Page Icon (optional)"
                  value={formik.values.page_icon}
                  formik={formik}
                />
              </div>
            </div>

            {/* Actions: Status on the left, Save/Reset on the right */}
            <div className='flex w-full justify-between mt-4 col-span-full'>
              <div className="flex items-center gap-3">
                <label className="text-sm font-sans font-medium opacity-80">Status</label>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={formik.values.status}
                  onChange={(e) => formik.setFieldValue("status", e.target.checked)}
                />
                <span className="opacity-80">{formik.values.status ? "Active" : "Inactive"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button intent="cancel" type='button' onClick={onCancel} disabled={formik.isSubmitting}>
                  Cancel
                </Button>
                <Button
                  intent="submit"
                  type='submit'
                  loading={formik.isSubmitting}
                  loadingText='Saving...'
                  disabled={formik.isSubmitting || !formik.isValid}
                >
                  Save
                </Button>
              </div>
            </div>
          </Form>
        </FormikProvider>
      )}
    </div>
  );
}