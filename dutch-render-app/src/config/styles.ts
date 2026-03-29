import { StylePreset } from "@/types";

export interface StyleConfig {
  id: StylePreset;
  label: string;
  description: string;
  promptBlock: string;
}

export const STYLE_CONFIGS: Record<StylePreset, StyleConfig> = {
  "jaren-30": {
    id: "jaren-30",
    label: "Jaren '30",
    description: "Warm brick, refined 1930s Dutch interpretation",
    promptBlock: `Style: Jaren '30 — a refined contemporary interpretation of 1930s Dutch rowhouses.

Material world: warm brick tones ranging from soft ochre to deep terracotta, with subtle tonal variation across dwellings. Use refined brickwork with elegant bond patterns. Window frames in dark painted timber or powder-coated aluminium in anthracite or deep green. Roofing in dark ceramic pan tiles or slate-grey tiles.

Character: dignified rhythm, calm and elegant detailing, generous but restrained ornamentation. The architecture should feel premium residential — familiar yet elevated. Think refined bay proportions, subtle brick reliefs, elegant lintels, and restrained cornice detailing. The overall mood is warm, established, and inviting.

Color world: warm earth tones — brick reds, ochre, cream, deep green accents, warm grey. No stark whites or cold tones.`,
  },

  modern: {
    id: "modern",
    label: "Modern",
    description: "Contemporary Dutch urban brick, clean and assertive",
    promptBlock: `Style: Modern — contemporary Dutch urban rowhouses that blend clean, minimal brick design with a confident, graphic architectural presence.

Material world: refined brick palette with a strong, contemporary expression. Use long-format bricks or slim bricks in muted tones — soft grey, warm anthracite, light sand, dark charcoal, or subtle blended palettes. Occasional use of dark metal cladding or weathering steel accents is allowed for visual contrast. Window frames in slim aluminium profiles, black or dark anthracite. Roofing is primarily in dark ceramic roof tiles (dakpannen), but occasionally a standing-seam metal roof in dark zinc or anthracite is acceptable as an alternative — use roof tiles by default unless the design specifically calls for a more industrial edge.

Character: clean, calm, and confident. The architecture should feel like a premium new-build development — sharp detailing, flush surfaces, minimal ornamentation, but warm and human through material quality and proportional refinement. There is an underlying robustness and graphic quality — strong shadow lines, bold material contrasts where appropriate, and an assertive but not aggressive presence. Not cold or corporate — still residential and inviting.

Color world: muted contemporary palette — warm greys, soft anthracite, sand tones, charcoal, with restrained dark accents. Selective warm accents in timber or weathering steel are permitted. No bright colors.`,
  },

  landelijk: {
    id: "landelijk",
    label: "Landelijk",
    description: "Timber-dominant, warm, natural, rural-inspired",
    promptBlock: `Style: Landelijk — timber-dominant, warm, natural, rural-inspired Dutch housing.

Material world: timber cladding as the primary façade material — vertical or horizontal boarding in natural wood tones (cedar, larch, or thermally modified wood). Combine with limited brick or render at ground level. Window frames in timber or timber-look aluminium in warm tones. Roofing in dark ceramic tiles or natural slate — NO sedum roof for this style.

Character: warm, natural, and relaxed but still premium. The architecture should feel like a high-end rural-edge development — generous, green, and grounded. Soft landscaping, mature planting, and a connection to nature. Think relaxed premium — not rustic or rough, but refined and comfortable.

Color world: natural timber tones, warm browns, soft greens, cream, moss, warm grey. Earthy and organic.`,
  },

  biobased: {
    id: "biobased",
    label: "Biobased",
    description: "Timber + sedum roof, ecological and aspirational",
    promptBlock: `Style: Biobased — timber-dominant with sedum roof, ecological, contemporary, and aspirational.

Material world: timber cladding (vertical or horizontal, natural or lightly treated) as the primary material. Sedum (green living roof) is integral to the design and MUST be visible on the roof surface. Combine timber with bio-based panels, natural render, or recycled brick. Window frames in timber or dark aluminium.

CRITICAL SEDUM ROOF INSTRUCTION — READ CAREFULLY: The sedum is a FLAT, THIN layer of tiny succulent ground-cover — maximum 3-5cm tall. It looks like green MOSS or a thin CARPET glued to the roof surface. The roof pitch, edges, and ridge must remain completely visible through the sedum — the green is just a thin skin/coating on the roof tiles, like a flat green paint layer with slight texture. Do NOT generate tall plants, grass, bushes, wildflowers, meadow, or any vegetation taller than a coin standing on its edge. The roof SHAPE must be perfectly preserved — if you cannot clearly see the roof slope angle and ridge line through the sedum, it is WRONG. Think of it as a 3cm-thick green felt blanket laid flat on the roof. Real sedum species: Sedum album, Sedum acre — these are tiny, flat succulents smaller than a fingertip. NEVER make the sedum look like a garden, forest, or meadow growing on the roof.

Character: ecological and sustainable but also contemporary, desirable, and premium. The architecture should look like an ambitious biobased development — forward-thinking, rich with greenery, and aspirational. Not hippie or makeshift — this is premium sustainable living.

Color world: timber naturals, rich greens from sedum and planting, soft earth tones, moss, warm grey. The green of the sedum roof is a defining color element.`,
  },
};

export const STYLE_OPTIONS = Object.values(STYLE_CONFIGS);
