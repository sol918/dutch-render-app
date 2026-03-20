import { GutterType } from "@/types";

export interface GutterConfig {
  id: GutterType;
  label: string;
  description: string;
}

export const GUTTER_CONFIGS: Record<GutterType, GutterConfig> = {
  overstek: {
    id: "overstek",
    label: "Overstek",
    description: "Extended eave overhang with visible soffit",
  },
  mastgoot: {
    id: "mastgoot",
    label: "Mastgoot",
    description: "Box gutter integrated into the façade wall",
  },
  "verholen-goot": {
    id: "verholen-goot",
    label: "Verholen goot",
    description: "Concealed gutter hidden behind the façade parapet",
  },
};

export const GUTTER_OPTIONS = Object.values(GUTTER_CONFIGS);
