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

The floor transition should be PRACTICALLY INVISIBLE. For brick façades: the same brick in the same colour and bond pattern runs continuously from ground to roof. Every brick must be the same colour — NEVER make one row/course of bricks a different colour. The ONLY expression is a single mortar joint (voeg/specie) that is marginally (1-2mm) wider or has a mortar tone that is barely 5% different from the rest. Only the mortar changes, never the bricks themselves. From normal viewing distance this should be nearly undetectable. Do NOT change brick colour, bond pattern, or add any band/ledge/course. The wall must read as one uninterrupted brick surface. For timber/wood façades: a narrow horizontal timber strip (maybe 3-5cm) in the opposite direction of the main cladding, or a thin shadow gap between boards. The same material continues above and below.`,
  },

  "architectonisch-opgelost": {
    id: "architectonisch-opgelost",
    label: "Architectonisch opgelost",
    description: "Elegantly resolved through material logic",
    promptBlock: `Floor-line treatment: architectonisch opgelost (architecturally resolved).

The floor transition must be CLEARLY VISIBLE as a designed architectural element, but elegant and integrated. This is distinctly MORE visible than "bijna onzichtbaar". For brick façades: there MUST be at minimum a rollaag (soldier course — a row of bricks placed on their short end, standing upright) at the floor transition. This rollaag creates a clear horizontal line in the brickwork. It may be combined with a slight projection, a recessed band, or a change in brick bond pattern above vs below. The rollaag is mandatory — it is the defining element of this treatment for brick. For timber/wood façades: a clear change in cladding direction (e.g., vertical below, horizontal above, or vice versa), or a visible trim board 8-15cm wide in a slightly different tone. The transition should feel intentional and designed — someone looking at the façade should notice and appreciate it as a compositional element. But the primary façade material should remain the same on both sides (same brick type or same wood species).`,
  },

  "expliciet-gemaakt": {
    id: "expliciet-gemaakt",
    label: "Expliciet gemaakt",
    description: "Consciously expressed as an architectural feature",
    promptBlock: `Floor-line treatment: expliciet gemaakt (explicitly expressed).

The floor transition must be BOLD and PROMINENT — a strong, deliberate architectural statement. This is the most visible option. For brick façades: there MUST be a prominent rollaag (soldier course) as the foundation of the floor line, combined with additional expression — a thick horizontal band (15-25cm) that may include a projecting brick ledge, a recessed strip, natural stone or cast concrete capping above the rollaag, or a contrasting material insert. The rollaag is mandatory and should be clearly visible as part of a larger, bolder composition. For timber/wood façades: a wide horizontal plank or panel in a contrasting material (e.g., a metal strip, a fibre-cement band, a different-coloured wood panel, or a concrete ledge). The floor line should be immediately obvious and read as a strong horizontal element that divides the façade into two distinct zones. It should be architecturally bold but still refined — not crude or cheap-looking.`,
  },
};

export const FLOORLINE_OPTIONS = Object.values(FLOORLINE_CONFIGS);
