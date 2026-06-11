import React from "react";

interface TorraLogoProps {
  size?: number;
  color?: string;
  showText?: boolean;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * TORRA Commercial Real Estate Group — Brand Logo
 * Monogram "TR" with optional full wordmark
 */
export default function TorraLogo({
  size = 48,
  color = "#b40101",
  showText = false,
  compact = false,
  className,
  style,
}: TorraLogoProps) {
  if (compact) {
    return (
      <div
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          ...style,
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer square frame */}
          <rect
            x="2"
            y="2"
            width="60"
            height="60"
            rx="6"
            stroke={color}
            strokeWidth="3.5"
            fill="none"
          />
          {/* T */}
          <rect x="14" y="16" width="22" height="4" rx="1" fill={color} />
          <rect x="23" y="16" width="4" height="32" rx="1" fill={color} />
          {/* R */}
          <rect x="36" y="16" width="4" height="32" rx="1" fill={color} />
          <path
            d="M36 16h12a7 7 0 0 1 0 14H36"
            stroke={color}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="43"
            y1="30"
            x2="52"
            y2="48"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
        {showText && (
          <span
            style={{
              color,
              fontSize: size * 0.4,
              fontWeight: 900,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            TORRA
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        ...style,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer square frame */}
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="6"
          stroke={color}
          strokeWidth="3.5"
          fill="none"
        />
        {/* T */}
        <rect x="14" y="16" width="22" height="4" rx="1" fill={color} />
        <rect x="23" y="16" width="4" height="32" rx="1" fill={color} />
        {/* R */}
        <rect x="36" y="16" width="4" height="32" rx="1" fill={color} />
        <path
          d="M36 16h12a7 7 0 0 1 0 14H36"
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="43"
          y1="30"
          x2="52"
          y2="48"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <>
          <span
            style={{
              color,
              fontSize: size * 0.28,
              fontWeight: 900,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            TORRA
          </span>
          <span
            style={{
              color: "#6b7280",
              fontSize: size * 0.1,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            Commercial Real Estate
          </span>
        </>
      )}
    </div>
  );
}
