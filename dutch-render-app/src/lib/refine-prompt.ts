import { RenderConfig } from "@/types";

const STYLE_CORRECTIONS: Record<string, string> = {
  "jaren-30": `STYLE-SPECIFIC CORRECTIONS FOR JAREN '30:

CORRECTION 1 — REMOVE THE BRICK COLOUR BAND:
Look at the render carefully. There is almost certainly a horizontal band/strip where the bricks are a DIFFERENT COLOUR (darker or lighter) than the rest of the wall. This band usually runs between the ground floor and first floor. THIS IS WRONG — it must be removed.
FIX: Repaint/replace those differently-coloured bricks so they are EXACTLY the same colour, texture, and tone as every other brick on the wall. The entire brick wall from ground to roof must be ONE uniform colour. No bands, no stripes, no tonal shifts. If the current floor-line treatment is "bijna onzichtbaar", there should be essentially NO visible horizontal element at all — just a perfectly uniform brick wall. The floor-line should be so subtle it is invisible in the render.

CORRECTION 2 — FLOOR-LINE HEIGHT:
If any horizontal element remains visible (for "architectonisch opgelost" or "expliciet gemaakt" treatments), check its height. It must be at 3.0m — which is 20-30cm ABOVE the tops of the ground-floor windows. There must be a strip of plain brickwork visible between the window heads and the floor-line. If the line is AT the window tops or below them, move it up.

CORRECTION 3 — ROLLAAG:
If the config says "architectonisch opgelost" or "expliciet gemaakt", ensure there is a visible rollaag (soldier course) at 3.0m. But if the config says "bijna onzichtbaar", there should be NO rollaag, NO band, NO visible element — just uniform bricks.`,

  modern: `STYLE-SPECIFIC CORRECTIONS FOR MODERN:

CORRECTION 1 — REMOVE THE BRICK COLOUR BAND:
Same as Jaren '30 — look for any horizontal band where bricks are a different colour from the rest of the wall. Remove it by making all bricks the same uniform colour. For "bijna onzichtbaar", the wall should look like one perfectly uniform brick surface with NO visible floor-line element at all.

CORRECTION 2 — FLOOR-LINE HEIGHT:
If a visible floor-line element is appropriate (for "architectonisch opgelost" or "expliciet gemaakt"), it must be at 3.0m — 20-30cm ABOVE ground-floor window tops. Add a rollaag (soldier course) at that height.

CORRECTION 3 — HWA (RAINWATER DOWNPIPES):
These should be flat, slim, black or dark anthracite rectangular-profile pipes that sit flush or nearly flush against the wall. They should NOT look like cheap white PVC tubes. Think elegant, minimal, architectural — a flat black metal strip running vertically, not a chunky round pipe.

Keep the overall expression clean and confident — no fussy details.`,

  landelijk: `STYLE-SPECIFIC CORRECTIONS FOR LANDELIJK:

CORRECTION 1 — HORIZONTAL LINES ON THE KOPGEVEL (MOST IMPORTANT):
Look at the FIRST IMAGE (grey massing volume). On the side wall (kopgevel), you can clearly see TWO horizontal lines:
- Line 1 at ~3.0m: the floor slab between ground floor and first floor
- Line 2 at ~6.0m: the eave line where the rectangular wall ends and the gable triangle begins

These lines must NOT align with window tops or bottoms. They are STRUCTURAL lines at FIXED heights. Look at the grey volume image — the 3.0m line is clearly ABOVE the ground-floor window tops, and the 6.0m line is clearly ABOVE the first-floor window tops.

COMMON ERROR: Gemini places these lines at window head height (top of windows) or window sill height. This is WRONG. The lines represent floor slabs and the eave, which are at fixed structural heights independent of window positions. Check the grey volume — match those exact positions.

For timber façades, express these lines as:
- A horizontal trim board (12-20cm wide), or
- A change in cladding direction (vertical↔horizontal), or
- A visible shadow line / recessed joint in the timber

CORRECTION 2 — TIMBER PLANKS:
The wood cladding should show individual narrow planks (6-15cm wide) with visible shadow gaps. If it looks like flat sheets, fix it.

CORRECTION 3 — NO BRICK AT GROUND LEVEL:
The façade should be timber from ground to roof. Do NOT add a strip of brick at the bottom. If brick is visible at the base, replace it with timber.`,

  biobased: `STYLE-SPECIFIC CORRECTIONS FOR BIOBASED:

CORRECTION 1 — HORIZONTAL LINES ON THE KOPGEVEL (MOST IMPORTANT):
Same as Landelijk — look at the grey massing image. The kopgevel must show TWO horizontal lines:
- Line 1 at ~3.0m: floor slab height (ABOVE ground-floor window tops, not at them)
- Line 2 at ~6.0m: eave line (ABOVE first-floor window tops, not at them)

These are STRUCTURAL positions — match them to the grey volume image, NOT to window heights. Express them as timber trim boards, direction changes, or shadow lines.

CORRECTION 2 — SEDUM ROOF:
The sedum must be a FLAT, thin layer (3-5cm) of tiny succulents — like green moss or felt on the roof surface. The roof shape, ridge, and slope MUST be clearly visible through it. If the sedum looks like tall grass, bushes, or a meadow, flatten it drastically.

CORRECTION 3 — HWA (RAINWATER DOWNPIPES):
With a hidden gutter ("verholen goot"), the downpipes should be very flat and subtle — a thin dark strip running close to the wall surface. Not removed, but minimal and architectural.

CORRECTION 4 — NO BRICK AT GROUND LEVEL:
Same as Landelijk — timber from ground to roof, no brick strip.`,
};

export function buildRefinePrompt(config: RenderConfig): string {
  const styleCorrection = STYLE_CORRECTIONS[config.style] || "";

  const isBrickStyle = config.style === "jaren-30" || config.style === "modern";

  const floorLineTreatment = config.floorLine === "bijna-onzichtbaar"
    ? isBrickStyle
      ? "The selected floor-line treatment is BIJNA ONZICHTBAAR. For this brick façade, this means: the floor-line should be COMPLETELY INVISIBLE. There should be NO visible horizontal element, NO colour band, NO different-coloured row of bricks. The entire wall must be one perfectly uniform brick surface from ground to roof. If you see ANY horizontal band or strip of differently-coloured bricks in the render, REMOVE IT by making those bricks identical to the rest."
      : "The selected floor-line treatment is BIJNA ONZICHTBAAR (almost invisible). For timber: a hairline shadow gap only. It must NOT be a visible band, stripe, or material change."
    : config.floorLine === "architectonisch-opgelost"
    ? "The selected floor-line treatment is ARCHITECTONISCH OPGELOST. It should be clearly visible as an elegant element — for brick: at minimum a rollaag (soldier course) at 3.0m height (ABOVE the ground-floor window tops). For timber: a visible change in cladding direction or a trim board."
    : "The selected floor-line treatment is EXPLICIET GEMAAKT. It should be bold and prominent — a strong horizontal element at 3.0m height (ABOVE the ground-floor window tops).";

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
