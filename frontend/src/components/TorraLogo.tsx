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
 * High-end editorial wordmark using DM Serif Display with a subtle accent.
 */
export default function TorraLogo({
  size = 36,
  color = "#b40101",
  className,
  style,
}: TorraLogoProps) {
  // We ignore showText and compact now, as the wordmark is the logo.
  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: '"DM Serif Display", Georgia, serif',
          fontSize: size,
          fontWeight: 400, // Serif has natural weight
          letterSpacing: "-0.02em",
          color: "#111", // The main text is always dark
          lineHeight: 1,
        }}
      >
        Torra
      </span>
      <span
        style={{
          fontFamily: '"DM Serif Display", Georgia, serif',
          fontSize: size,
          fontWeight: 400,
          color: color, // The accent dot gets the brand color
          lineHeight: 1,
        }}
      >
        .
      </span>
    </div>
  );
}
