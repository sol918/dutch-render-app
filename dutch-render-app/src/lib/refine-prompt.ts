import { RenderConfig } from "@/types";

const STYLE_CORRECTIONS: Record<string, string> = {
  "jaren-30": `STYLE-SPECIFIC CORRECTIONS FOR JAREN '30:
- FLOOR-LINE: Check the horizontal floor-line at ~3m on the front façade. If the config says "bijna onzichtbaar", this MUST be just a tiny, barely visible colour difference in ONE mortar joint — not a band, not a material change, not a different brick colour above vs below. Just one joint that is 5% different in mortar tone. If it's currently too heavy or visible, make it almost invisible.
- If the config says "architectonisch opgelost" or "expliciet gemaakt", ensure there is a visible rollaag (soldier course) at the floor-line.
- Check the floor-line HEIGHT — it should be at approximately 3.0m (just above the ground-floor window heads), not at mid-wall or at random heights.
- Ensure the brick colour and bond pattern are IDENTICAL above and below the floor-line.`,

  modern: `STYLE-SPECIFIC CORRECTIONS FOR MODERN:
- FLOOR-LINE: Same rules as Jaren '30 — check height (~3m) and prominence matches the selected treatment.
- HWA (RAINWATER DOWNPIPES): These should be flat, slim, black or dark anthracite rectangular-profile pipes that sit flush or nearly flush against the wall. They should NOT look like cheap white PVC tubes. Think elegant, minimal, architectural — a flat black metal strip running vertically, not a chunky round pipe.
- Keep the overall expression clean and confident — no fussy details.`,

  landelijk: `STYLE-SPECIFIC CORRECTIONS FOR LANDELIJK:
- EAVE LINE AT 6M: This is the most common error for this style. On the kopgevel (side wall), there MUST be a visible horizontal line at ~6.0m height where the rectangular wall ends and the gable triangle begins. Look at the first image (grey volume) — this line is clearly visible there. If it's missing in the render, ADD IT as a trim board, shadow line, or subtle material transition.
- TIMBER PLANKS: The wood cladding should show individual narrow planks (6-15cm wide) with visible shadow gaps between them. If the cladding looks like flat sheets/plates instead of individual planks, fix it to show individual boards with fine vertical joints.
- NO BRICK AT GROUND LEVEL: The façade should be timber from ground to roof. Do NOT add a strip of brick at the bottom 1m. If brick is visible at the base, replace it with timber continuing all the way to the ground.
- FLOOR-LINE ON KOPGEVEL: The 3.0m floor-line must also be visible on the side wall.`,

  biobased: `STYLE-SPECIFIC CORRECTIONS FOR BIOBASED:
- EAVE LINE AT 6M: Same as Landelijk — the kopgevel MUST show a horizontal line at ~6.0m. Check the first image (grey volume) to see where it should be.
- SEDUM ROOF: The sedum must be a FLAT, thin layer (3-5cm) of tiny succulents — like green moss or felt on the roof surface. The roof shape, ridge, and slope MUST be clearly visible through it. If the sedum looks like tall grass, bushes, or a meadow, flatten it drastically.
- HWA (RAINWATER DOWNPIPES): With a hidden gutter ("verholen goot"), the downpipes should be very flat and subtle — a thin dark strip running close to the wall surface. Not removed, but minimal and architectural. With other gutter types, keep them visible but refined.
- NO BRICK AT GROUND LEVEL: Same as Landelijk — timber from ground to roof, no brick strip.`,
};

export function buildRefinePrompt(config: RenderConfig): string {
  const styleCorrection = STYLE_CORRECTIONS[config.style] || "";

  const floorLineTreatment = config.floorLine === "bijna-onzichtbaar"
    ? "The selected floor-line treatment is BIJNA ONZICHTBAAR (almost invisible). The floor-line should be barely detectable — just a single mortar joint with a 5% colour difference, or for timber: a hairline shadow gap. It must NOT be a visible band, stripe, or material change."
    : config.floorLine === "architectonisch-opgelost"
    ? "The selected floor-line treatment is ARCHITECTONISCH OPGELOST. It should be clearly visible as an elegant element — for brick: at minimum a rollaag (soldier course). For timber: a visible change in cladding direction or a trim board."
    : "The selected floor-line treatment is EXPLICIET GEMAAKT. It should be bold and prominent — a strong horizontal element.";

  return `You are given TWO images:
1. FIRST IMAGE: A grey 3D massing volume showing the EXACT geometry of the building with all horizontal and vertical lines clearly visible. Use this as your reference for where lines should be.
2. SECOND IMAGE: An AI-generated architectural render that needs correction.

Your task: Output a CORRECTED version of the second image (the render). Keep the style, materials, colours, atmosphere, landscaping, and composition as close to the original render as possible. Only fix the specific issues listed below.

GENERAL CORRECTIONS — apply to ALL styles:
- Compare the kopgevel (visible side wall) in the render against the grey volume. The grey volume shows horizontal lines at ~3.0m AND ~6.0m on the side wall. Both lines MUST appear in the corrected render.
- The 6.0m line (eave height, where the gable triangle starts) is the most commonly missing line. If it's absent, add it.
- HWA downpipes must be visible at every party wall between houses. They should be architectural and refined, not cheap-looking.
- The building must be FULLY visible in the frame — no cropping on any side.

${floorLineTreatment}

${styleCorrection}

IMAGE QUALITY:
- Output this image at the MAXIMUM resolution you can produce — ideally 2048px or wider.
- Render with sharp, crisp detail on all materials: individual bricks, wood grain, mortar joints, roof tiles, window frames.
- Use photographic quality: realistic depth-of-field, soft natural daylight, detailed material textures visible at close inspection.
- The output should feel like a professional architectural photograph taken with a high-end camera, not a low-resolution AI sketch.

CRITICAL RULES:
- Do NOT change the building shape, roofline, camera angle, or overall composition.
- Do NOT change the style or material palette — keep the same look.
- Do NOT add or remove windows, doors, or major elements.
- ONLY fix the specific architectural details listed above while maximizing image quality.
- The output must be a single photorealistic image, not text.`;
}
