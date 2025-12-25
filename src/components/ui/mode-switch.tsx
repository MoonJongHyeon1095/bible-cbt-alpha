// src/components/ui/PureSwitch.tsx
import * as React from "react";

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
};

function ModeSwitch({
  checked,
  onCheckedChange,
  disabled,
  "aria-label": ariaLabel = "toggle",
}: SwitchProps) {
  const trackStyle: React.CSSProperties = {
    width: 44,
    height: 24,
    borderRadius: 9999,
    border: "1px solid rgba(0,0,0,0.12)",
    background: checked ? "#7c3aed" : "#cbd5e1", // 보라 / slate-300
    position: "relative",
    transition: "background 150ms ease",
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
    flexShrink: 0,
    display: "inline-block",
  };

  const thumbStyle: React.CSSProperties = {
    width: 20,
    height: 20,
    borderRadius: 9999,
    background: "#ffffff",
    boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
    position: "absolute",
    top: 1.5,
    left: checked ? 22 : 2,
    transition: "left 150ms ease",
  };

  const onToggle = () => {
    if (disabled) return;
    onCheckedChange(!checked);
  };

  return (
    <span
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      tabIndex={disabled ? -1 : 0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      style={trackStyle}
    >
      <span style={thumbStyle} />
    </span>
  );
}

export function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div style={{ padding: "8px 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
            {label}
          </div>
        </div>

        <ModeSwitch checked={checked} onCheckedChange={onChange} />
      </div>

      {description ? (
        <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>
          {description}
        </div>
      ) : null}
    </div>
  );
}
