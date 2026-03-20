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
    label: "Jaren 30-stijl",
    description: "Warm brick, refined 1930s Dutch interpretation",
    promptBlock: `Style: Jaren 30-stijl — a refined contemporary interpretation of 1930s Dutch rowhouses.

Material world: warm brick tones ranging from soft ochre to deep terracotta, with subtle tonal variation across dwellings. Use refined brickwork with elegant bond patterns. Window frames in dark painted timber or powder-coated aluminium in anthracite or deep green. Roofing in dark ceramic pan tiles or slate-grey tiles.

Character: dignified rhythm, calm and elegant detailing, generous but restrained ornamentation. The architecture should feel premium residential — familiar yet elevated. Think refined bay proportions, subtle brick reliefs, elegant lintels, and restrained cornice detailing. The overall mood is warm, established, and inviting.

Color world: warm earth tones — brick reds, ochre, cream, deep green accents, warm grey. No stark whites or cold tones.`,
  },

  "moderne-stadswoning": {
    id: "moderne-stadswoning",
    label: "Moderne Stadswoning met baksteen",
    description: "Contemporary Dutch urban brick, clean and premium",
    promptBlock: `Style: Moderne Stadswoning met baksteen — contemporary Dutch urban brick rowhouses.

Material world: refined brick palette with a clean, contemporary expression. Use long-format bricks or slim bricks in muted tones — soft grey, warm anthracite, light sand, or subtle blended palettes. Window frames in slim aluminium profiles, dark grey or black. Roofing in flat dark tiles or zinc-look standing seam.

Character: clean, calm, elegant, and unmistakably current. The architecture should feel like a premium new-build development in a desirable Dutch city neighborhood. Sharp detailing, flush surfaces, minimal ornamentation, but warm and human through material quality and proportional refinement.

Color world: muted contemporary palette — warm greys, soft anthracite, sand tones, with restrained dark accents. No bright colors.`,
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

Material world: timber cladding (vertical or horizontal, natural or lightly treated) as the primary material. Sedum (green living roof) is integral to the design and MUST be visible on the roof surface. Combine timber with bio-based panels, natural render, or recycled brick. Window frames in timber or dark aluminium. The sedum roof should look lush and established, not freshly planted.

Character: ecological and sustainable but also contemporary, desirable, and premium. The architecture should look like an ambitious biobased development — forward-thinking, rich with greenery, and aspirational. Not hippie or makeshift — this is premium sustainable living.

Color world: timber naturals, rich greens from sedum and planting, soft earth tones, moss, warm grey. The green of the sedum roof is a defining color element.`,
  },

  "oud-hollands": {
    id: "oud-hollands",
    label: "Oud-Hollands",
    description: "Contemporary traditional Dutch, earthy and calm",
    promptBlock: `Style: Oud-Hollands — a contemporary interpretation of traditional Dutch housing.

Material world: classic Dutch brick in warm, earthy tones — Waals brick, IJssel brick, or similar traditional formats. Use traditional bond patterns (cross bond, stretcher bond). Window frames in painted timber in traditional colors — deep green, cream, or dark blue. Roofing in traditional Dutch ceramic pan tiles in red-brown or dark anthracite.

Character: familiar, calm, and rooted in Dutch building tradition — but interpreted with contemporary quality and refinement. No fake nostalgia or theme-park pastiche. This should feel like a believable current development that respects and reinterprets Dutch housing tradition. Think dignified, understated, and warm.

Color world: earthy reds, warm browns, cream, deep green, traditional blue accents. A warm, grounded palette.`,
  },

  industrieel: {
    id: "industrieel",
    label: "Industrieel",
    description: "Darker, graphic, robust but premium industrial",
    promptBlock: `Style: Industrieel — stronger, darker, more graphic industrial-inspired residential architecture.

Material world: dark brick (anthracite, dark grey, or near-black) as the primary material, potentially combined with dark metal cladding, weathering steel accents, or dark-tinted render. Window frames in black or dark anthracite aluminium with strong profiles. Roofing in dark zinc, standing seam, or flat dark tiles.

Character: robust but premium, sober and stylish. The architecture should feel like a bold contemporary development with industrial heritage references — not a converted warehouse, but new-build housing with an assertive, graphic quality. Strong shadow lines, bold material contrasts, and a confident presence.

Color world: dark and graphic — anthracite, charcoal, black, with selective warm accents in timber or weathering steel. Restrained and powerful.`,
  },

  haags: {
    id: "haags",
    label: "Haagse Stijl",
    description: "Haagse School — sober dark brick, expressionist detailing, Amsterdam School-adjacent",
    promptBlock: `Style: Haagse School (The Hague School of architecture) — refined, sober early-20th-century Dutch residential architecture rooted in the Amsterdam School and Expressionist tradition, as seen throughout The Hague's Plan-Zuid, Marlot, Benoordenhout, and Belgisch Park neighbourhoods.

Material world: dark-toned brick is the primary material — think warm dark brown, deep reddish-brown, or muted plum-toned brickwork with expressive masonry detailing. Decorative brickwork patterns, corbelling, recessed panels, and soldier courses give the facades depth and rhythm. Window frames in dark-stained timber or steel. Roofing in dark ceramic pan tiles, often with pronounced overhangs or sculpted roof edges. Subtle use of natural stone or concrete accents for lintels, sills, and entrance surrounds. Doors in dark-stained wood.

Character: dignified, understated, and architecturally rich. The beauty comes from the craftsmanship of the brickwork and the sculptural quality of the massing — rounded corners, stepped volumes, subtle asymmetry, and expressive rooflines. No bright colours or painted surfaces. The effect is warm but serious, civic and enduring. Think of the residential streets designed by architects like Jan Wils, Co Brandes, and H.P. Berlage's followers in The Hague.

Color world: a restrained, warm-dark palette — deep brown and reddish-brown brick tones, dark timber, dark roof tiles. Contrast comes from the texture and pattern of the brickwork rather than from colour variation. Occasional accents in natural stone (cream or grey) at entrances and window surrounds.`,
  },
};

export const STYLE_OPTIONS = Object.values(STYLE_CONFIGS);
