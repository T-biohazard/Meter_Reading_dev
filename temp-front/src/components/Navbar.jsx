// import { NavLink } from "react-router-dom";

// export default function Navbar() {
//   const linkClass = ({ isActive }) =>
//     `px-3 py-2 rounded-lg ${isActive ? "bg-base-200 font-medium" : "hover:bg-base-200"}`;

//   return (
//     <nav className="navbar bg-base-100/95 backdrop-blur supports-[backdrop-filter]:bg-base-100/90 border-b border-base-300 shadow-md">
//       <div className="container mx-auto px-4 w-full flex items-center">
//         {/* left: brand + drawer toggle */}
//         <div className="flex items-center gap-2 flex-1">
//           <label htmlFor="app-drawer" className="btn btn-ghost lg:hidden" aria-label="Open sidebar">
//             ☰
//           </label>
//           <NavLink to="/" className="btn btn-ghost text-xl">MyApp</NavLink>
//         </div>

//         {/* center: main nav (desktop only) */}
//         <ul className="menu menu-horizontal gap-1 hidden md:flex">
//           <li><NavLink to="/" end className={linkClass}>Home</NavLink></li>
//           <li><NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink></li>
//           <li><NavLink to="/settings" className={linkClass}>Settings</NavLink></li>
//         </ul>

//         {/* right: auth actions */}
//         <div className="ml-2 flex items-center gap-2">
//           <NavLink to="/login" className="btn btn-ghost">Sign in</NavLink>
//           <NavLink to="/register" className="btn btn-primary">Sign up</NavLink>
//         </div>
//       </div>
//     </nav>
//   );
// }


import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../app/AuthContext";
import { Roles } from "../lib/roles";

function normalizeRole(user, fallbackRole) {
  // Accepts string or numeric roles from various backends
  return (
    user?.role ??
    user?.role_name ??
    user?.primary_role ??
    user?.primary_role_id ??
    fallbackRole ??
    null
  );
}
function isOneOfRoles(roleValue, allowed) {
  if (roleValue == null) return false;
  const r = String(roleValue).toLowerCase();
  return allowed.map((x) => String(x).toLowerCase()).includes(r);
}

export default function Navbar() {
  const { isAuthenticated, role, user, logout } = useAuth();
  const navigate = useNavigate();

  // Be tolerant if token wasn't persisted yet
  const signedIn = Boolean(isAuthenticated || user);

  const normalizedRole = normalizeRole(user, role);
  const canSeeSettings =
    signedIn && isOneOfRoles(normalizedRole, [Roles.EDITOR, Roles.ADMIN, "editor", "admin", 2, 1]);

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg ${isActive ? "bg-base-200 font-medium" : "hover:bg-base-200"}`;

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <nav className="navbar bg-base-100/95 backdrop-blur supports-[backdrop-filter]:bg-base-100/90 border-b border-base-300 shadow-md">
      <div className="container mx-auto px-4 w-full flex items-center">
        {/* left: drawer toggle appears only when authenticated */}
        <div className="flex items-center gap-2 flex-1">
          <label
            htmlFor="app-drawer"
            className={`btn btn-ghost lg:hidden ${!signedIn ? "hidden" : ""}`}
            aria-label="Open sidebar"
          >
            ☰
          </label>
          <NavLink to="/" className="btn btn-ghost text-xl">MyApp</NavLink>
        </div>

        {/* center: main nav (desktop) */}
        <ul className="menu menu-horizontal gap-1 hidden md:flex">
          <li><NavLink to="/" end className={linkClass}>Home</NavLink></li>
          {signedIn && (
            <li><NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink></li>
          )}
          {canSeeSettings && (
            <li><NavLink to="/settings" className={linkClass}>Settings</NavLink></li>
          )}
        </ul>

        {/* right: auth actions */}
        <div className="ml-2 flex items-center gap-2">
          {!signedIn ? (
            <>
              <NavLink to="/login" className="btn btn-ghost">Sign in</NavLink>
              <NavLink to="/register" className="btn btn-primary">Sign up</NavLink>
            </>
          ) : (
            <div className="dropdown dropdown-end">
              <button className="btn btn-ghost">
                {user?.name ?? "Account"}
              </button>
              <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48 mt-2">
                <li className="menu-title px-2 py-1 opacity-70 truncate">
                  {user?.email ?? user?.name ?? "Signed in"}
                </li>
                <li><NavLink to="/dashboard">Dashboard</NavLink></li>
                {canSeeSettings && <li><NavLink to="/settings">Settings</NavLink></li>}
                <li><button onClick={handleLogout} className="text-error">Logout</button></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
