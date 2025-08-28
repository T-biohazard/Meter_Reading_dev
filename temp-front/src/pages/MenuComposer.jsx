// src/pages/MenuComposer.jsx
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import authService from "../services/authService";
import { useAuth } from "../app/AuthContext";
import InputField from "../components/fields/InputField";
import Button from "../components/ui/Button";
import IconPickerFA from "../components/ui/IconPickerFA";
import { FileText, GitBranch, FolderTree, Link as LinkIcon } from "lucide-react";

/* ---------------- validation ---------------- */

const Schema = Yup.object({
  page_name: Yup.string().required("Page name is required."),
  path: Yup.string()
    .matches(
      /^\/[a-zA-Z0-9\-/_]*$/,
      "Path must start with / and use letters, numbers, -, _, and / only."
    )
    .required("Path is required."),
  menu_name: Yup.string().nullable(),
  sub_menu_name: Yup.string().nullable(),
  status: Yup.boolean().default(true),
});

/* ---------------- helper: unique list ---------------- */

const uniq = (arr) => [...new Set(arr.filter(Boolean))];

/* ---------------- page ---------------- */

export default function MenuComposer() {
  const { token } = useAuth();
  const [menuLocked, setMenuLocked] = useState(false);
  const [subLocked, setSubLocked] = useState(false);

  // Pull all existing rows so we can offer type-ahead suggestions and prefill icons
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["menu-page-elements:composer"],
    queryFn: () => authService.listMenuPageElements(token),
    enabled: !!token,
  });

  // Build lookups
  const allMenus = useMemo(() => {
    const map = new Map(); // name -> { name, icon }
    rows.forEach((r) => {
      if (r.menu_name) {
        if (!map.has(r.menu_name)) {
          map.set(r.menu_name, { name: r.menu_name, icon: r.menu_icon || "" });
        } else if (r.menu_icon && !map.get(r.menu_name).icon) {
          map.get(r.menu_name).icon = r.menu_icon;
        }
      }
    });
    return [...map.values()];
  }, [rows]);

  const submenusByMenu = useMemo(() => {
    const map = new Map(); // menu_name -> Map(sub_name -> icon)
    rows.forEach((r) => {
      if (!r.menu_name || !r.sub_menu_name) return;
      if (!map.has(r.menu_name)) map.set(r.menu_name, new Map());
      const inner = map.get(r.menu_name);
      if (!inner.has(r.sub_menu_name)) inner.set(r.sub_menu_name, r.sub_menu_icon || "");
      else if (r.sub_menu_icon && !inner.get(r.sub_menu_name)) inner.set(r.sub_menu_name, r.sub_menu_icon);
    });
    return map;
  }, [rows]);

  // Form initial values
  const initialValues = {
    menu_name: "",
    menu_icon: "",
    sub_menu_name: "",
    sub_menu_icon: "",
    page_name: "",
    page_icon: "",
    path: "",
    status: true, // active by default
  };

  // helpers for exists/available signals
  const existsMenu = (name) => !!allMenus.find((m) => m.name === name);
  const existsSub = (menu, sub) => {
    const m = submenusByMenu.get(menu);
    return !!(m && m.has(sub));
  };

  // Option builders for InputField (dropdown)
  const menuOptions = allMenus.map((m) => ({ label: m.name, value: m.name }));
  const subOptions = (menuName) => {
    const m = submenusByMenu.get(menuName);
    if (!m) return [];
    return [...m.keys()].map((s) => ({ label: s, value: s }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Menu Composer</h1>
        <p className="opacity-70">
          Create or attach a page under an existing <strong>Menu</strong>, optionally inside a <strong>Sub-menu</strong>.
          Icons are Font Awesome class strings (e.g. <code>fa-solid fa-box</code>). Status controls visibility.
        </p>
      </div>

      <div className="card bg-base-100 shadow-xl">
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
                } catch (e) {
                  console.error(e);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ values, setFieldValue, isSubmitting, isValid, handleReset }) => {
                // compute existence flags live
                const menuExists = !!values.menu_name && existsMenu(values.menu_name);
                const submenuExists =
                  !!values.menu_name && !!values.sub_menu_name && existsSub(values.menu_name, values.sub_menu_name);

                // lock behavior: if picked from suggestions, we lock; "Change" button unlocks
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
                  <Form noValidate>
                    {/* Row 1: Menu + menu icon + status */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-5">
                        <InputField
                          name="menu_name"
                          label={
                            <>
                              <FolderTree className="inline-block h-3.5 w-3.5 -mt-0.5 mr-1 opacity-70" />
                              Menu name
                            </>
                          }
                          labelBgClass="bg-base-100"
                          placeholder="e.g. Main, Settings"
                          dropdown={!menuLocked}
                          options={menuOptions}
                          onSelect={(opt) => {
                            setFieldValue("menu_name", opt.value);
                            lockMenu(opt.value);
                          }}
                          required={false}
                          readOnly={menuLocked} // prevent typing when locked
                          help={
                            !values.menu_name
                              ? "Pick existing or type a new menu name."
                              : menuExists
                              ? "This matches an existing menu (locked)."
                              : "New menu will be created."
                          }
                        />
                        {values.menu_name ? (
                          <div className="mt-1 text-xs">
                            {menuExists ? (
                              <span className="badge badge-warning">Exists</span>
                            ) : (
                              <span className="badge badge-success">Available</span>
                            )}
                            {menuLocked && (
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs ml-2"
                                onClick={() => setMenuLocked(false)}
                              >
                                Change
                              </button>
                            )}
                          </div>
                        ) : null}
                      </div>

                      <div className="md:col-span-5">
                        <IconPickerFA
                          label="Menu icon (optional)"
                          value={values.menu_icon}
                          onChange={(v) => setFieldValue("menu_icon", v)}
                          disabled={false}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <div className="form-control">
                          <div className="label">
                            <span className="label-text">Status</span>
                          </div>
                          <label className="label cursor-pointer justify-start gap-3">
                            <input
                              type="checkbox"
                              className="toggle toggle-primary"
                              checked={values.status}
                              onChange={(e) => setFieldValue("status", e.target.checked)}
                            />
                            <span>{values.status ? "Active" : "Inactive"}</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Sub-menu + icon */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-6">
                        <InputField
                          name="sub_menu_name"
                          label={
                            <>
                              <GitBranch className="inline-block h-3.5 w-3.5 -mt-0.5 mr-1 opacity-70" />
                              Sub-menu name (optional)
                            </>
                          }
                          labelBgClass="bg-base-100"
                          placeholder={values.menu_name ? "Pick or type…" : "Pick a Menu first"}
                          disabled={!values.menu_name}
                          dropdown={!subLocked && !!values.menu_name}
                          options={subOptions(values.menu_name)}
                          onSelect={(opt) => {
                            setFieldValue("sub_menu_name", opt.value);
                            lockSub(opt.value);
                          }}
                          help={
                            !values.menu_name
                              ? "Choose a Menu to see its Sub-menus."
                              : !values.sub_menu_name
                              ? "Pick existing or type a new sub-menu."
                              : submenuExists
                              ? "This matches an existing sub-menu (locked)."
                              : "New sub-menu will be created."
                          }
                          readOnly={subLocked}
                        />
                        {values.sub_menu_name ? (
                          <div className="mt-1 text-xs">
                            {submenuExists ? (
                              <span className="badge badge-warning">Exists</span>
                            ) : (
                              <span className="badge badge-success">Available</span>
                            )}
                            {subLocked && (
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs ml-2"
                                onClick={() => setSubLocked(false)}
                              >
                                Change
                              </button>
                            )}
                          </div>
                        ) : null}
                      </div>

                      <div className="md:col-span-6">
                        <IconPickerFA
                          label="Sub-menu icon (optional)"
                          value={values.sub_menu_icon}
                          onChange={(v) => setFieldValue("sub_menu_icon", v)}
                          disabled={false}
                        />
                      </div>
                    </div>

                    {/* Row 3: Page + icon + path */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-5">
                        <InputField
                          name="page_name"
                          label={
                            <>
                              <FileText className="inline-block h-3.5 w-3.5 -mt-0.5 mr-1 opacity-70" />
                              Page name
                            </>
                          }
                          labelBgClass="bg-base-100"
                          required
                        />
                      </div>

                      <div className="md:col-span-7">
                        <IconPickerFA
                          label="Page icon (optional)"
                          value={values.page_icon}
                          onChange={(v) => setFieldValue("page_icon", v)}
                          disabled={false}
                        />
                      </div>

                      <div className="md:col-span-12">
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
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex items-center gap-2">
                      <Button
                        intent="primary"
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        loading={isSubmitting}
                      >
                        Save
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        disabled={isSubmitting}
                      >
                        Reset
                      </Button>
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
