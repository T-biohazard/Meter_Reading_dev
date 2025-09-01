import { Outlet } from "react-router-dom";
import { useState } from "react";
import clsx from "clsx";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useAuth } from "../app/AuthContext";

export default function MainLayout() {
  const { isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-base-100">
      {/* Ensure the drawer itself is screen-height */}
      <div className={clsx("drawer min-h-screen", isAuthenticated && "lg:drawer-open")}>
        <input id="app-drawer" type="checkbox" className="drawer-toggle" />

        {/* Make the drawer-content a full-height flex column */}
        <div className="drawer-content min-h-screen flex flex-col">
          <Navbar />

          {/* Let main grow so the footer stays at the bottom */}
          <main className="container mx-auto max-w-screen-2xl px-2 py-8 grow">
            <Outlet />
          </main>

          {/* border-top -> border-t; mt-auto also keeps it pinned at bottom */}
          <footer className="mt-auto footer footer-center bg-base-100 text-base-content p-4 border-t border-base-300">
            <aside>© {new Date().getFullYear()} MyApp • All rights reserved</aside>
          </footer>
        </div>

        {/* Sidebar only when logged in */}
        {isAuthenticated && (
          <div className="drawer-side">
            <label htmlFor="app-drawer" className="drawer-overlay" aria-label="Close sidebar" />
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
          </div>
        )}
      </div>
    </div>
  );
}
