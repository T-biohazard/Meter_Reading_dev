// src/pages/MenuBuilder.jsx
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import { Plus, RefreshCw, Pencil, Trash2, Save } from "lucide-react";

import { useAuth } from "../app/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { useMenuAdmin } from "../hooks/useMenuAdmin";
import authService from "../services/authService";

import InputField from "../components/fields/InputField";
import Button from "../components/ui/Button";

/* ---------------- Schema & helpers ---------------- */

const Schema = Yup.object({
  page_name: Yup.string().required("Page name is required."),
  menu_name: Yup.string().nullable(),
  sub_menu_name: Yup.string().nullable(),
  path: Yup.string()
    .matches(/^\/[a-zA-Z0-9\-/_]*$/, "Path must start with / and use letters, numbers, -, _, and / only.")
    .required("Path is required."),
});

const emptyItem = { page_name: "", menu_name: "", sub_menu_name: "", path: "" };

/* ---------------- Modals ---------------- */

function UpsertModal({ open, initial, onClose, onSubmit, saving }) {
  if (!open) return null;

  const initVals = {
    page_name: initial?.page_name ?? "",
    menu_name: initial?.menu_name ?? "",
    sub_menu_name: initial?.sub_menu_name ?? "",
    path: initial?.path ?? "",
  };

  const title = initial?.id ? "Edit menu item" : "Create menu item";

  return (
    <dialog open className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">{title}</h3>
        <Formik
          initialValues={initVals}
          validationSchema={Schema}
          enableReinitialize
          onSubmit={(vals) => onSubmit(vals)}
        >
          {({ isValid, isSubmitting }) => (
            <Form noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField name="page_name" label="Page name" labelBgClass="bg-base-100" required />
                <InputField name="menu_name" label="Menu name (optional)" labelBgClass="bg-base-100" />
                <InputField name="sub_menu_name" label="Sub-menu name (optional)" labelBgClass="bg-base-100" />
                <InputField name="path" label="Path" labelBgClass="bg-base-100" placeholder="/users" required />
              </div>

              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={onClose}>
                  Cancel
                </button>
                <Button
                  intent="primary"
                  type="submit"
                  leftIcon={Save}
                  loading={saving || isSubmitting}
                  disabled={!isValid}
                >
                  Save
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
      {/* No overlay/backdrop to avoid dim screen; if you want dim, uncomment below */}
      {/* <form method="dialog" className="modal-backdrop"><button onClick={onClose}>close</button></form> */}
    </dialog>
  );
}

function ConfirmDeleteModal({ open, item, onCancel, onConfirm, deleting }) {
  if (!open) return null;
  return (
    <dialog open className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Delete menu item</h3>
        <p className="py-2">
          Are you sure you want to delete <b>{item?.page_name}</b> ({item?.path})?
        </p>
        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <Button intent="danger" leftIcon={Trash2} onClick={onConfirm} loading={deleting}>
            Delete
          </Button>
        </div>
      </div>
    </dialog>
  );
}

/* ---------------- Page ---------------- */

export default function MenuBuilder() {
  const qc = useQueryClient();
  const { token } = useAuth();
  const { hasPermission } = usePermissions();
  const { publishNow, refreshMenu, clearMenuCache } = useMenuAdmin();

  const canList = hasPermission("menu-page-elements.index");
  const canCreate = hasPermission("menu-page-elements.store");
  const canUpdate = hasPermission("menu-page-elements.update");
  const canDelete = hasPermission("menu-page-elements.destroy");

  // table filters (basic)
  const [q, setQ] = useState("");

  // Modals
  const [editing, setEditing] = useState(null); // null = closed; object without id = create
  const [deletingItem, setDeletingItem] = useState(null);

  /* ---- Queries ---- */
  const {
    data: rows = [],
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["menu-page-elements"],
    queryFn: () => authService.listMenuPageElements(token),
    enabled: !!token && canList,
  });

  /* ---- Mutations ---- */
  const createMut = useMutation({
    mutationFn: (payload) => authService.createMenuPageElement(payload, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu-page-elements"] });
      setEditing(null);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => authService.updateMenuPageElement(id, payload, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu-page-elements"] });
      setEditing(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => authService.deleteMenuPageElement(id, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu-page-elements"] });
      setDeletingItem(null);
    },
  });

  /* ---- Derived ---- */
  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const term = q.trim().toLowerCase();
    return rows.filter((r) =>
      [
        r.page_name,
        r.menu_name,
        r.sub_menu_name,
        r.path,
      ]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(term))
    );
  }, [rows, q]);

  /* ---- Handlers ---- */
  const openCreate = () => setEditing({ ...emptyItem }); // no id -> create mode
  const openEdit = (row) => setEditing({ ...row }); // has id -> edit mode
  const closeEdit = () => setEditing(null);

  const submitUpsert = (vals) => {
    if (editing?.id) {
      updateMut.mutate({ id: editing.id, payload: vals });
    } else {
      createMut.mutate(vals);
    }
  };

  const confirmDelete = () => {
    if (!deletingItem?.id) return;
    deleteMut.mutate(deletingItem.id);
  };

  /* ---- Render ---- */
  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Menu Builder</h1>

        <div className="flex items-center gap-2">
          <div className="join">
            <button className="btn join-item" onClick={refreshMenu} title="Re-fetch from server">
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
              <span className="ml-1 hidden sm:inline">Refresh</span>
            </button>
            <button className="btn join-item" onClick={clearMenuCache} title="Clear local cache">
              Clear cache
            </button>
            <button className="btn join-item btn-primary" onClick={publishNow} title="Clear cache + re-fetch">
              Publish to Sidebar
            </button>
          </div>

          {canCreate && (
            <Button intent="success" leftIcon={Plus} onClick={openCreate}>
              New item
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="card bg-base-100 shadow-md mb-4">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <input
              type="text"
              placeholder="Filter by page/menu/submenu/path…"
              className="input input-bordered w-full sm:w-96"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {isLoading && <span className="loading loading-spinner" />}
            {isError && <div className="text-error">{error?.message || "Failed to load."}</div>}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body overflow-x-auto">
          {!canList ? (
            <div className="alert">You don’t have permission to view items.</div>
          ) : isLoading ? (
            <div className="h-24 animate-pulse">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="opacity-60">No items.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Menu</th>
                  <th>Sub-menu</th>
                  <th>Path</th>
                  <th>Created</th>
                  <th className="w-40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="font-medium">{r.page_name ?? "-"}</td>
                    <td>{r.menu_name ?? <span className="opacity-60">—</span>}</td>
                    <td>{r.sub_menu_name ?? <span className="opacity-60">—</span>}</td>
                    <td><code>{r.path}</code></td>
                    <td className="text-xs opacity-70">
                      {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                    </td>
                    <td>
                      <div className="flex justify-end gap-2">
                        {canUpdate && (
                          <Button size="xs" variant="outline" leftIcon={Pencil} onClick={() => openEdit(r)}>
                            Edit
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            size="xs"
                            intent="danger"
                            leftIcon={Trash2}
                            onClick={() => setDeletingItem(r)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Upsert modal */}
      <UpsertModal
        open={!!editing}
        initial={editing}
        onClose={closeEdit}
        onSubmit={submitUpsert}
        saving={createMut.isPending || updateMut.isPending}
      />

      {/* Delete confirm */}
      <ConfirmDeleteModal
        open={!!deletingItem}
        item={deletingItem}
        onCancel={() => setDeletingItem(null)}
        onConfirm={confirmDelete}
        deleting={deleteMut.isPending}
      />
    </div>
  );
}
