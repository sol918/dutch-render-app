import { FloorLineTreatment } from "@/types";

export interface FloorLineConfig {
  id: FloorLineTreatment;
  label: string;
  description: string;
  promptBlock: string;
}

export const FLOORLINE_CONFIGS: Record<FloorLineTreatment, FloorLineConfig> = {
  "bijna-onzichtbaar": {
    id: "bijna-onzichtbaar",
    label: "Bijna onzichtbaar",
    description: "Floor line absorbed into the façade, barely visible",
    promptBlock: `Floor-line treatment: bijna onzichtbaar (almost invisible).

The floor transition should be VERY MINIMAL — barely noticeable. For brick façades: just a thin shadow line, a single recessed brick course, or a hairline groove. For timber/wood façades: a narrow horizontal timber strip (maybe 3-5cm) in the opposite direction of the main cladding, or a thin shadow gap between boards. The key point: the same material continues above and below. No material change, no colour change, no thick bands. Someone walking past should barely notice it. Keep it as subtle as possible while still technically being there.`,
  },

  "architectonisch-opgelost": {
    id: "architectonisch-opgelost",
    label: "Architectonisch opgelost",
    description: "Elegantly resolved through material logic",
    promptBlock: `Floor-line treatment: architectonisch opgelost (architecturally resolved).

The floor transition must be CLEARLY VISIBLE as a designed architectural element, but elegant and integrated. This is distinctly MORE visible than "bijna onzichtbaar". For brick façades: a change in brick bond pattern (e.g., stretcher bond below, stack bond above), a soldier course, a projecting brick course, or a recessed band 2-3 courses deep. For timber/wood façades: a clear change in cladding direction (e.g., vertical below, horizontal above, or vice versa), or a visible trim board 8-15cm wide in a slightly different tone. The transition should feel intentional and designed — someone looking at the façade should notice and appreciate it as a compositional element. But the primary façade material should remain the same on both sides (same brick type or same wood species).`,
  },

  "expliciet-gemaakt": {
    id: "expliciet-gemaakt",
    label: "Expliciet gemaakt",
    description: "Consciously expressed as an architectural feature",
    promptBlock: `Floor-line treatment: expliciet gemaakt (explicitly expressed).

The floor transition must be BOLD and PROMINENT — a strong, deliberate architectural statement. This is the most visible option. For brick façades: a thick horizontal band (15-25cm) in a contrasting material like natural stone, cast concrete, zinc, or a different colour brick. Or a deep shadow gap, a pronounced projecting ledge, or a wide recessed strip. For timber/wood façades: a wide horizontal plank or panel in a contrasting material (e.g., a metal strip, a fibre-cement band, a different-coloured wood panel, or a concrete ledge). The floor line should be immediately obvious and read as a strong horizontal element that divides the façade into two distinct zones. It should be architecturally bold but still refined — not crude or cheap-looking.`,
  },
};

export const FLOORLINE_OPTIONS = Object.values(FLOORLINE_CONFIGS);
