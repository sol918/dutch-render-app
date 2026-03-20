import { OptionalFeature } from "@/types";

export interface FeatureConfig {
  id: OptionalFeature;
  label: string;
  promptText: string;
}

export const FEATURE_CONFIGS: Record<OptionalFeature, FeatureConfig> = {
  pergola: {
    id: "pergola",
    label: "Pergola",
    promptText:
      "Include an elegant pergola structure at the front of one or more dwellings, integrated with the architectural language.",
  },
  dakkapel: {
    id: "dakkapel",
    label: "Dakkapel",
    promptText:
      "Include refined dormer windows (dakkapellen) in the roof, proportioned and styled consistently with the chosen architectural style.",
  },
  "extra-ramen-kopgevel": {
    id: "extra-ramen-kopgevel",
    label: "Extra ramen in de kopgevel",
    promptText:
      "Add additional windows to the end/side gable (kopgevel) of the terrace, maintaining the architectural style and proportions.",
  },
  luifel: {
    id: "luifel",
    label: "Luifel",
    promptText:
      "Include a refined canopy or awning above the front door(s), integrated elegantly with the façade design.",
  },
  "franse-balkons": {
    id: "franse-balkons",
    label: "Franse balkons",
    promptText:
      "Include French balconies (juliet balconies) with elegant railings at upper floor windows, consistent with the architectural style.",
  },
  erker: {
    id: "erker",
    label: "Erker",
    promptText:
      "Include a refined bay window (erker) at ground floor level, integrated with the façade composition and architectural style.",
  },
  zonnepanelen: {
    id: "zonnepanelen",
    label: "Zonnepanelen",
    promptText:
      "Include solar panels on the roof, integrated neatly and visually consistent with the roof material and color. They should look like a natural part of the design.",
  },
  "afwijkende-voordeuraccenten": {
    id: "afwijkende-voordeuraccenten",
    label: "Afwijkende voordeuraccenten",
    promptText:
      "Give the front doors distinctive accent treatment — this could be a contrasting color, a different material surround, a recessed portal, or another refined detail that makes the entrance special.",
  },
};

export const FEATURE_OPTIONS = Object.values(FEATURE_CONFIGS);
