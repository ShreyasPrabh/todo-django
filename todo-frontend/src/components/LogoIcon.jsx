import React from "react";

export default function LogoIcon({
  size = 26,
  color = "currentColor",
  checkmarkColor = "#ffffff",
  className = "",
  style = {},
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
    >
      {/* Bottom Task Layer */}
      <rect
        x="6"
        y="19"
        width="20"
        height="7"
        rx="3"
        fill={color}
        fillOpacity="0.3"
      />
      {/* Middle Task Layer */}
      <rect
        x="4"
        y="12"
        width="24"
        height="7.5"
        rx="3"
        fill={color}
        fillOpacity="0.6"
      />
      {/* Top Active Task Layer */}
      <rect
        x="2"
        y="4"
        width="28"
        height="9.5"
        rx="3.5"
        fill={color}
      />
      {/* Vibrant Dynamic Checkmark on the Top Layer */}
      <path
        d="M9.5 8.8L13.5 12.2L22.5 5.8"
        stroke={checkmarkColor}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
