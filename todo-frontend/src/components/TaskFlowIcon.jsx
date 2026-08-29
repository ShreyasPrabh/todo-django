import React from "react";

export default function TaskFlowIcon({
  size = 28,
  className = "",
  style = {},
  variant = "gradient", // "gradient" or "white"
}) {
  const gradientId = "taskFlowLogoGradient";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
    >
      <defs>
        <linearGradient id={gradientId} x1="20%" y1="20%" x2="85%" y2="85%">
          <stop offset="0%" stopColor="#fba375" />
          <stop offset="45%" stopColor="#f16867" />
          <stop offset="100%" stopColor="#e84a83" />
        </linearGradient>
      </defs>

      {/* Outer Ring */}
      <circle
        cx="46"
        cy="54"
        r="34"
        stroke={variant === "white" ? "#ffffff" : `url(#${gradientId})`}
        strokeWidth="5"
        fill="none"
        opacity={variant === "white" ? "0.85" : "1"}
      />

      {/* Middle Ring */}
      <circle
        cx="46"
        cy="54"
        r="22"
        stroke={variant === "white" ? "#ffffff" : `url(#${gradientId})`}
        strokeWidth="5"
        fill="none"
        opacity={variant === "white" ? "0.95" : "1"}
      />

      {/* Center Solid Circle */}
      <circle
        cx="46"
        cy="54"
        r="11"
        fill={variant === "white" ? "#ffffff" : `url(#${gradientId})`}
      />

      {/* Arrow Shaft */}
      <line
        x1="46"
        y1="54"
        x2="74"
        y2="26"
        stroke={variant === "white" ? "#ffffff" : `url(#${gradientId})`}
        strokeWidth="5.5"
        strokeLinecap="round"
      />

      {/* Arrow Head */}
      <path
        d="M66 22 L83 18 L79 35 L73.5 28.5 L66 22 Z"
        fill={variant === "white" ? "#ffffff" : `url(#${gradientId})`}
      />
      {/* Arrow Tip Rounding */}
      <circle
        cx="83"
        cy="18"
        r="2"
        fill={variant === "white" ? "#ffffff" : `url(#${gradientId})`}
      />
    </svg>
  );
}
