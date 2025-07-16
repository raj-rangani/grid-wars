"use client";

import React from "react";

function Notification({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  if (!message) return null;
  return (
    <div className="notification">
      <span>{message}</span>
      <button className="close-btn" onClick={onClose}>
        <svg
          fill="none"
          strokeWidth={1.5}
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      </button>
    </div>
  );
}

export default Notification;
