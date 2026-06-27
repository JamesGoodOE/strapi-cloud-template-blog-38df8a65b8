import { BrandVariants, createLightTheme, Theme } from "@fluentui/react-components";

/**
 * Oxford Economics brand ramp for Fluent UI v9. Anchored on the OE primary
 * blue (#0077C8) and deep navy ink, generated as a 16-step tonal ramp so all
 * Fluent components (buttons, focus rings, accents) pick up the brand colour.
 */
const oxfordBrand: BrandVariants = {
  10: "#020407",
  20: "#0B1F3A", // OE navy ink
  30: "#0E2C53",
  40: "#103A6E",
  50: "#11498A",
  60: "#1058A6",
  70: "#0E68C3",
  80: "#0077C8", // OE primary blue
  90: "#1F8AD4",
  100: "#3F9BDB",
  110: "#5FACE2",
  120: "#80BEEA",
  130: "#A2CFF1",
  140: "#C3E0F7",
  150: "#E0EFFB",
  160: "#F2F8FE",
};

export const oxfordLightTheme: Theme = {
  ...createLightTheme(oxfordBrand),
};

/** Brand constants reused outside Fluent (e.g. inline styles, canvas charts). */
export const OE = {
  navy: "#0B1F3A",
  blue: "#0077C8",
  cyan: "#00A3E0",
  ink: "#0B1F3A",
  muted: "#5A6B7B",
  surface: "#F4F7FB",
  border: "#E2E8F0",
};
