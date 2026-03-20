import { BrickType } from "@/types";

export interface BrickConfig {
  id: BrickType;
  label: string;
  promptBlock: string;
}

export const BRICK_CONFIGS: Record<BrickType, BrickConfig> = {
  "waals-rood": {
    id: "waals-rood",
    label: "Waals rood",
    promptBlock: `Brick specification: Traditional Waal-format bricks (waalformaat, ~210x50mm face) in warm red tones. Classic Dutch red brick with subtle tonal variation from brick to brick — some slightly darker, some slightly lighter, creating a lively but harmonious red facade. Use stretcher bond or cross bond. The mortar is a medium grey, slightly recessed. This is the quintessential Dutch brick — warm, familiar, and dignified.`,
  },
  "ijsselsteen-geel": {
    id: "ijsselsteen-geel",
    label: "IJsselsteen geel",
    promptBlock: `Brick specification: IJssel-type bricks in warm yellow/cream tones. These are traditional Dutch yellow bricks (IJsselsteentjes) with a characteristic warm, sandy, golden-cream colour. The bricks show natural variation from pale cream to warm ochre. Use stretcher bond. The mortar is light, almost flush with the brick face. The overall facade reads as warm, light, and elegant — distinctly different from red brick, with a softer, more luminous quality.`,
  },
  "handvorm-bruin": {
    id: "handvorm-bruin",
    label: "Handvorm bruin",
    promptBlock: `Brick specification: Hand-moulded bricks (handvorm) in warm brown tones. These bricks have an irregular, textured surface with visible creases and undulations from the hand-moulding process. The colour ranges from warm chocolate brown to dark terracotta, with significant variation between individual bricks. Use stretcher bond with slightly wider joints. The facade has a rich, artisanal, tactile quality — warm and characterful, with more depth and texture than machine-made bricks.`,
  },
  "strengpers-grijs": {
    id: "strengpers-grijs",
    label: "Strengpers grijs",
    promptBlock: `Brick specification: Wire-cut bricks (strengpers) in cool grey tones. These machine-made bricks have a smooth, precise surface with sharp edges. The colour is a consistent cool grey — from silver-grey to warm anthracite-grey. Use stretcher bond or stack bond for a contemporary look. The mortar is dark grey or anthracite, close to the brick colour. The facade reads as modern, clean, and sophisticated — a contemporary alternative to traditional red or yellow brick.`,
  },
  "langformaat-antraciet": {
    id: "langformaat-antraciet",
    label: "Langformaat antraciet",
    promptBlock: `Brick specification: Long-format bricks (langformaat, ~290x90mm or larger) in dark anthracite/near-black tones. These oversized, elongated bricks create a strong horizontal emphasis on the facade with fewer joints and a more monolithic, contemporary expression. The colour is deep anthracite or charcoal black with subtle matte variation. Use stretcher bond with thin dark joints. The facade reads as bold, graphic, and unmistakably contemporary — a premium, architectural statement in brick.`,
  },
  "geglazuurd-donker": {
    id: "geglazuurd-donker",
    label: "Geglazuurd donker",
    promptBlock: `Brick specification: Glazed bricks (geglazuurde baksteen) in dark tones. These bricks have a glossy, vitrified surface that catches and reflects light. The colour is deep — dark brown, dark blue-black, or dark green-black with a subtle sheen. Use stretcher bond. The glazed surface creates a distinctive play of light and reflection across the facade, especially in Dutch daylight and rain. The facade reads as luxurious, refined, and distinctive — a premium material choice that stands out from standard matte brick.`,
  },
  "lichte-baksteen": {
    id: "lichte-baksteen",
    label: "Lichte baksteen (zand/wit)",
    promptBlock: `Brick specification: Light-coloured bricks in sand, cream, or near-white tones. These bricks have a pale, luminous quality — ranging from warm sand to cool off-white. The mortar is white or very light grey, creating a minimal contrast that gives the facade an almost monolithic, rendered appearance while still reading as genuine brick. Use stretcher bond. The facade reads as bright, clean, and Scandinavian-influenced — a light, airy alternative to the heavier Dutch brick traditions. Popular in contemporary premium housing.`,
  },
};

export const BRICK_OPTIONS = Object.values(BRICK_CONFIGS);
