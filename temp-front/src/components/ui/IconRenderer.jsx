// src/components/ui/IconRenderer.jsx
import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
import '@fortawesome/fontawesome-free/css/solid.min.css';
import '@fortawesome/fontawesome-free/css/brands.min.css'; // only if you use brands
// (optional) import '@fortawesome/fontawesome-free/css/regular.min.css';

export default function IconRenderer({ fa, Icon, className = "w-4 h-4", colorClass = "text-base-content/70" }) {
  // Priority: explicit React Icon component > FA class string > dot
  if (Icon) return <Icon className={`${className} ${colorClass}`} aria-hidden="true" />;
  if (fa) {
    // Font Awesome expects its CSS to be loaded in index.html
    return (
      <span className={`inline-flex items-center justify-center ${className}`}>
        <i className={`${fa} fa-fw ${colorClass.replace("text-", "")}`} aria-hidden="true" />
      </span>
    );
  }
  return <span className={`inline-block rounded-full ${className}`} style={{ background: "currentColor", opacity: 0.4 }} />;
}
