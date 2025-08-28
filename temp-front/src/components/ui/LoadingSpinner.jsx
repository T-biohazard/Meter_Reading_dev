// src/components/ui/LoadingSpinner.jsx
/**
 * A simple, reusable loading spinner component.
 * It provides a visual indicator that an asynchronous operation is in progress.
 */
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center py-8">
      <div
        className="animate-spin inline-block w-8 h-8 border-4 rounded-full"
        style={{
          borderTopColor: "transparent",
          borderRightColor: "transparent",
          borderColor: "currentColor",
          color: "rgb(59, 130, 246)", // Tailwind's blue-500
        }}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
