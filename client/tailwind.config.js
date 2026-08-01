/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Points at the semantic tokens in src/styles/tokens/semantic.css —
      // keep these keys in sync with that file, not the other way around.
      colors: {
        base: "var(--bg-base)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        card: "var(--bg-card)",
        ink: {
          DEFAULT: "var(--text-primary)",
          muted: "var(--slate-light)",
          faint: "var(--slate-muted)",
        },
        accent: {
          DEFAULT: "var(--violet)",
          light: "var(--violet-light)",
          dim: "var(--violet-dim)",
        },
        line: {
          DEFAULT: "var(--border-subtle)",
          muted: "var(--border-muted)",
          accent: "var(--border-accent)",
        },
        energy: {
          low: "var(--energy-low)",
          medium: "var(--energy-med)",
          high: "var(--energy-high)",
        },
        "energy-tint": {
          low: "var(--energy-low-bg)",
          medium: "var(--energy-med-bg)",
          high: "var(--energy-high-bg)",
        },
        slot: {
          am: "var(--slot-am)",
          pm: "var(--slot-pm)",
          eve: "var(--slot-eve)",
        },
        "slot-tint": {
          am: "var(--slot-am-bg)",
          pm: "var(--slot-pm-bg)",
          eve: "var(--slot-eve-bg)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      fontSize: {
        label: "var(--font-size-label)",
        caption: "var(--font-size-caption)",
        body: "var(--font-size-body)",
        title: "var(--font-size-title)",
        heading: "var(--font-size-heading)",
        icon: "var(--font-size-icon)",
        "icon-lg": "var(--font-size-icon-lg)",
        display: "var(--font-size-display)",
      },
    },
  },
  plugins: [],
};
