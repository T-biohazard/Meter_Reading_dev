import { useEffect } from "react";

/**
 * Custom hook to detect clicks outside of a component.
 * @param {React.RefObject} ref The ref of the element to monitor.
 * @param {function} onOutside The function to call when a click outside is detected.
 */
export function useOutside(ref, onOutside) {
  useEffect(() => {
    /**
     * Call the handler function if the click is outside the element.
     * @param {MouseEvent} event The click event.
     */
    const handler = (event) => {
      // Do nothing if the element is not there or the click is on the element itself
      if (ref.current && !ref.current.contains(event.target)) {
        onOutside();
      }
    };

    // Attach the event listener on component mount
    document.addEventListener("mousedown", handler);

    // Detach the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [ref, onOutside]); // Re-run effect if ref or onOutside function changes
}