import { RenderConfig, RenderQuality, GreyVolumeImage } from "@/types";
import { STYLE_CONFIGS } from "@/config/styles";
import { FLOORLINE_CONFIGS } from "@/config/floorline";
import { GUTTER_CONFIGS } from "@/config/gutters";
import { FEATURE_CONFIGS } from "@/config/options";
import { WOOD_CONFIGS } from "@/config/wood";
import { BRICK_CONFIGS } from "@/config/bricks";

export function buildPrompt(config: RenderConfig, baseImage?: GreyVolumeImage, quality: RenderQuality = "hq"): string {
  const style = STYLE_CONFIGS[config.style];
  const floorLine = FLOORLINE_CONFIGS[config.floorLine];
  const gutter = GUTTER_CONFIGS[config.gutterType];

  const geo = baseImage ?? {
    numberOfHouses: config.geometry.numberOfHouses,
    width: config.geometry.width,
    crossGables: config.geometry.crossGables,
    stepping: config.geometry.stepping,
  };

  // Floor-line logic per material type
  const brickStyles = new Set(["jaren-30", "modern"]);
  const timberStyles = new Set(["landelijk", "biobased"]);
  const isBrick = brickStyles.has(config.style);
  const isTimber = timberStyles.has(config.style);

  // Wood type detail block (only for timber styles)
  const woodBlock = isTimber && config.woodType && WOOD_CONFIGS[config.woodType]
    ? `\n\nTimber material specification:\n${WOOD_CONFIGS[config.woodType].promptBlock}`
    : "";

  // Brick type detail block (only for brick styles)
  const brickBlock = isBrick && config.brickType && BRICK_CONFIGS[config.brickType]
    ? `\n\nBrick material specification:\n${BRICK_CONFIGS[config.brickType].promptBlock}`
    : "";

  // For brick "bijna-onzichtbaar": still show a very thin voeg line
  const brickSubtleFloorLine = isBrick && config.floorLine === "bijna-onzichtbaar";
  const subtleTimberFloorLine = isTimber && config.floorLine === "bijna-onzichtbaar";

  const featuresText =
    config.optionalFeatures.length > 0
      ? config.optionalFeatures
          .map((f) => `- ${FEATURE_CONFIGS[f].promptText}`)
          .join("\n")
      : "None selected.";

  const rawNuance = config.userNuance.trim();
  const nuanceText = rawNuance
    ? `HIGHEST PRIORITY INSTRUCTION — THIS OVERRIDES ALL OTHER STYLE GUIDANCE:\n${rawNuance}\nThis user instruction is the single most important design directive. Every material choice, colour decision, and atmospheric detail MUST reflect this instruction. If it conflicts with any other instruction above, this one wins.`
    : "No additional nuance specified.";

  const geometryDescription = buildGeometryDescription(geo);

  if (quality === "quick") {
    return buildQuickPrompt(geo, geometryDescription, style, gutter, floorLine, brickSubtleFloorLine, subtleTimberFloorLine, featuresText, nuanceText, woodBlock, brickBlock);
  }

  return buildHqPrompt(geo, style, gutter, floorLine, brickSubtleFloorLine, subtleTimberFloorLine, featuresText, nuanceText, woodBlock, brickBlock);
}

function buildGeometryDescription(geo: { numberOfHouses: number; width: number; crossGables: boolean; stepping: boolean }): string {
  const totalWidth = geo.numberOfHouses * geo.width;
  const roofType = geo.crossGables
    ? `The roof has cross gables (dwarskappen): the first and last houses have perpendicular gable roofs that project upward above the main ridge, creating a distinctive silhouette with triangular gable peaks on the end units. The middle ${geo.numberOfHouses - 2} houses share a continuous longitudinal ridge roof between these cross gables.`
    : `The roof is a simple continuous saddle/ridge roof running the full length of the terrace, with the ridge line parallel to the front façade. Both end walls show a triangular gable.`;

  const steppingDesc = geo.stepping
    ? `The façades are stepped (verspringend): alternate houses are set back approximately 0.3-0.5m from their neighbours, creating a subtle zigzag depth pattern along the terrace when viewed from the front. This stepping is visible in both the ground floor and upper floor wall planes.`
    : `All houses share one continuous flat façade plane — no stepping or setbacks between units.`;

  // Kopgevel horizontal lines instruction
  const crossGableFloorLine = geo.crossGables
    ? `\n\nKOPGEVEL HORIZONTAL LINES — LOOK AT THE INPUT IMAGE:
The side wall (kopgevel) of the end house is a triangular gable wall. If you look at the attached grey massing image, you can clearly see TWO horizontal lines on this kopgevel:
1. A line at ~3.0m height (the floor-line between ground floor and first floor) — this one you usually get right.
2. A line at ~6.0m height (the eave line, where the rectangular wall ends and the triangular gable begins) — THIS ONE IS COMMONLY FORGOTTEN. It marks the transition from the normal two-storey wall to the gable triangle above. In the input image this is clearly visible as a horizontal edge on the side wall.
BOTH lines must appear on the kopgevel in the render. The eave-height line at ~6m is especially important — it separates the main wall from the gable peak. Without it, the kopgevel looks like one flat surface from ground to ridge, which is architecturally wrong.`
    : `\n\nKOPGEVEL HORIZONTAL LINES — LOOK AT THE INPUT IMAGE:
The side wall (kopgevel) of the end house shows TWO horizontal lines in the attached grey massing image:
1. A line at ~3.0m height (the floor-line between ground floor and first floor).
2. A line at ~6.0m height (the eave line, where the wall meets the roof). This second line is commonly forgotten but clearly visible in the input image.
BOTH lines must appear on the kopgevel in the render.`;

  return `EXACT BUILDING GEOMETRY — you must reproduce this precisely:

OVERVIEW: A Dutch terraced housing block (rijwoningen) consisting of exactly ${geo.numberOfHouses} attached houses in a row, viewed from a 3/4 front-right isometric perspective. The total building is approximately ${totalWidth.toFixed(1)}m wide and approximately 10m deep.

MASSING: The building is a simple rectangular block, 2 storeys tall plus a pitched roof. The building height to the eaves is approximately 6m. The total height to the ridge is approximately 9.5m. The depth of the building is approximately 10m.

HOUSE DIVISIONS: The ${geo.numberOfHouses} houses are divided by ${geo.numberOfHouses - 1} visible vertical party walls (brandmuren) that extend from ground to roof ridge. These party walls are evenly spaced at ${geo.width}m intervals, creating ${geo.numberOfHouses} equal-width units. The party wall lines must be clearly visible as vertical lines/seams on the façade.

FLOOR DIVISION: A clear horizontal floor-line runs across the entire front façade at approximately 2.8-3.0m height, dividing the ground floor from the upper floor. This line must be visible.${crossGableFloorLine}

GROUND FLOOR (per house): Each house has one front door (left side, approximately 1m wide, 2.2m tall) and one window (right side, approximately 1m wide, 1.5m tall) on the ground floor. The door and window are roughly the same height and aligned horizontally.

UPPER FLOOR (per house): Each house has two smaller windows on the upper floor, evenly spaced and centred above the ground floor openings. These windows are approximately 0.8m wide and 1.2m tall each.

ROOF: ${roofType} The roof slope angle is approximately 45 degrees. The roof overhangs the façade slightly at the eaves.

STEPPING: ${steppingDesc}

RAINWATER DOWNPIPES (HWA): Between every two adjacent houses, there MUST be a visible rainwater downpipe (hemelwaterafvoer / HWA) running vertically down the façade at the party wall position, from the gutter to ground level. These downpipes are a mandatory construction element — they collect rainwater from the shared gutter between each pair of houses. The HWA pipes should be styled to match the architectural language: for traditional/warm styles use copper or dark-painted metal pipes; for modern/industrial styles use dark anthracite or black square-profile pipes; for timber styles use dark-coloured round or rectangular pipes that complement the wood. The HWA must be present at EVERY party wall — that means exactly ${geo.numberOfHouses - 1} downpipes visible on the front façade.

VIEWPOINT: The camera is positioned at approximately 30 degrees to the right of the front façade, looking slightly downward from about 5m height. This shows the full front façade, the right side wall of the end house, and the roof clearly. The perspective is a mild 3/4 isometric view — not a flat elevation, not a dramatic wide-angle.

FRAMING — CRITICAL: The ENTIRE building must be fully visible within the image, with comfortable margin on ALL sides. No part of the building may be cropped or cut off — not the left edge, not the right edge, not the roof ridge, not the ground. There must be visible sky above the roof, visible ground/garden below the building, and clear space on both the left and right sides. The building should occupy roughly 60-70% of the image width, centred, with the surrounding streetscape filling the rest. Do NOT zoom in too close — pull back enough that the complete building plus environment fits comfortably.`;
}

function buildFloorLineBlock(
  floorLine: { label: string; promptBlock: string },
  brickSubtleFloorLine: boolean,
  subtleTimberFloorLine: boolean,
): string {
  if (brickSubtleFloorLine) {
    return `Floor-line treatment: ALMOST INVISIBLE.
The façade is entirely the SAME brick from ground to roofline — identical colour, identical bond pattern, identical texture everywhere. Every single brick must be the same colour — there must be NO row or course of bricks that looks different from the rest.

The ONLY indication of the floor transition is in the MORTAR (voeg/specie), not the bricks: one single horizontal mortar joint may be 1-2mm wider or have a mortar tone that is 5% different from surrounding joints. The BRICKS on either side of this joint must be identical to all other bricks on the wall.

COMMON ERROR TO AVOID: Gemini often makes one horizontal course/row of bricks a slightly different colour (darker, lighter, or a different hue) — this is WRONG. The bricks themselves must never change colour. Only the thin mortar line between bricks may be subtly different.

FLOOR-LINE HEIGHT: This subtle mortar joint must be at exactly 3.0m — approximately 20-30cm ABOVE the tops of the ground-floor windows. NOT at the window heads, NOT just under the windows. There must be visible brickwork between the window tops and the floor-line.

Do NOT change the brick colour above vs below. Do NOT change the bond pattern. Do NOT add any band, stripe, ledge, or course change. The brick wall must look like one continuous, uninterrupted surface.`;
  }

  if (subtleTimberFloorLine) {
    return `Floor-line treatment:
The façade is entirely timber/wood cladding. The SAME wood cladding must run continuously from ground level to roofline — do NOT switch to brick, render, or any other material below or above the floor line. You may show a very thin, subtle shadow line or fine groove at the floor transition, but the material must remain wood on both sides. NEVER make the bottom half brick and the top half wood.`;
  }

  return `Selected floor-line treatment:
${floorLine.label}

Floor-line instructions:
${floorLine.promptBlock}
CRITICAL: The floor-line is a detail within one continuous material. Do NOT change the facade material above vs below this line. The same material runs continuously across the floor-line transition.`;
}

function buildQuickPrompt(
  geo: { numberOfHouses: number; width: number; crossGables: boolean; stepping: boolean },
  geometryDescription: string,
  style: { label: string; promptBlock: string },
  gutter: { label: string; description: string },
  floorLine: { label: string; promptBlock: string },
  brickSubtleFloorLine: boolean,
  subtleTimberFloorLine: boolean,
  featuresText: string,
  nuanceText: string,
  woodBlock: string,
  brickBlock: string
): string {
  const floorLineBlock = buildFloorLineBlock(floorLine, brickSubtleFloorLine, subtleTimberFloorLine);

  return `Generate a high-resolution 4K image (3840 pixels wide). Your output MUST be a single photorealistic image, not text. Do not describe the image — produce it.

You are generating a high-end, hyperrealistic Dutch sales render for a newly built terraced housing project.

A reference grey massing image is attached showing the exact 3D geometry. Follow its silhouette, proportions, and layout as closely as possible. Below is a detailed text description of the geometry in case the image is unclear:

${geometryDescription}

CRITICAL RULES:
- There must be EXACTLY ${geo.numberOfHouses} houses — count the party wall divisions carefully
- Each house is ${geo.width}m wide
- The building has 2 storeys plus a pitched roof
- ${geo.crossGables ? "Cross gables (dwarskappen) on the end houses — triangular gable peaks projecting above the main ridge" : "Simple continuous ridge roof, no cross gables"}
- ${geo.stepping ? "Stepped façades — alternate houses set back slightly" : "Flat continuous façade plane, no stepping"}
- Maintain the 3/4 front-right isometric camera angle shown in the reference
- Keep all window and door positions as described above
- Rainwater downpipes (HWA) must be visible at every party wall between houses

Your job: apply materials, textures, colours, landscaping, and atmosphere onto this exact geometry. Do NOT redesign the building.

Selected style:
${style.label}

Style instructions:
${style.promptBlock}${woodBlock}${brickBlock}

Selected gutter type: ${gutter.label}
Gutter: ${gutter.label} — ${gutter.description}. Integrate into the roof edge detailing.

${floorLineBlock}

Optional features:
${featuresText}
Integrate any features elegantly into the design.

Environment: Dutch streetscape context — front gardens, paths, greenery, trees, realistic daylight, warm aspirational atmosphere, sales brochure quality.

User nuance: ${nuanceText}

AVOID: Any text/labels/watermarks. Wrong house count. Changing the massing or roofline. American aesthetics. Cartoonish elements.`;
}

function buildHqPrompt(
  geo: { numberOfHouses: number; width: number; crossGables: boolean; stepping: boolean },
  style: { label: string; promptBlock: string },
  gutter: { label: string; description: string },
  floorLine: { label: string; promptBlock: string },
  brickSubtleFloorLine: boolean,
  subtleTimberFloorLine: boolean,
  featuresText: string,
  nuanceText: string,
  woodBlock: string,
  brickBlock: string
): string {
  const floorLineBlock = buildFloorLineBlock(floorLine, brickSubtleFloorLine, subtleTimberFloorLine);

  return `Generate a high-resolution 4K image (3840 pixels wide). Your output MUST be a single photorealistic image, not text. Do not describe the image — produce it.

You are generating a high-end, hyperrealistic Dutch sales render for a newly built terraced housing project.

THE ATTACHED IMAGE IS YOUR STRICT BLUEPRINT:
The provided grey massing image defines the EXACT 3D geometry, silhouette, and layout you must follow pixel-for-pixel. Treat it as an architectural elevation drawing — every edge, roofline, and opening is fixed.

MANDATORY GEOMETRY RULES — zero deviation allowed:
- SILHOUETTE: The overall outline/silhouette of the building must match the source image exactly. Trace every roofline, eave, gable, and wall edge precisely.
- HOUSE COUNT: There are exactly ${geo.numberOfHouses} houses. Not ${geo.numberOfHouses - 1}, not ${geo.numberOfHouses + 1}. Count the vertical party-wall divisions in the source.
- WIDTHS: Each house is approximately ${geo.width}m wide. Preserve the proportions shown.
- OPENINGS: Every window and door visible in the source must appear at the same position, same size, same proportion. Do NOT move, add, remove, or resize any opening.
- ROOF: The roof form, ridge direction, slope angles, and eave lines must be identical to the source.
- VIEWPOINT: The camera angle, perspective, and framing must match the source exactly.
- WALL PLANES: All wall surfaces, setbacks, and projections must follow the source geometry.
- RAINWATER DOWNPIPES: Between every two adjacent houses, there MUST be a visible rainwater downpipe (HWA) running vertically from the gutter down to ground level at the party wall position. These are mandatory construction elements — exactly ${geo.numberOfHouses - 1} HWA pipes on the front façade. Style them to match the architecture: copper or dark-painted metal for traditional styles, dark anthracite square-profile for modern styles, dark-coloured pipes for timber styles.

Your ONLY job is to apply materials, textures, colours, landscaping, and atmosphere onto this exact geometry. Think of it as "skinning" a 3D model — the shape is locked, you control the surface treatment.

Important construction logic:
- A horizontal floor transition line at ~3.0m is visible in the source image and must remain present in the render on the FRONT façade.
- The kopgevel (side wall) must show TWO horizontal lines — both visible in the source image: one at ~3.0m (floor-line) and one at ~6.0m (eave line where the gable triangle starts). The 6.0m line is the most commonly forgotten — check the input image carefully.
- The façade should never look overly modular or prefabricated.

Selected style:
${style.label}

Style instructions:
${style.promptBlock}${woodBlock}${brickBlock}

Selected gutter type:
${gutter.label}

Gutter instructions:
Clearly express the selected gutter type (${gutter.label} — ${gutter.description}) in the roof edge and façade detailing. The roof edge must feel architecturally consistent with the chosen style.

${floorLineBlock}

Optional architectural features:
${featuresText}

Optional feature instructions:
Any optional features must be integrated elegantly into the architectural design language. They must feel intentional, refined and coherent, not pasted on afterwards.

Environment and atmosphere:
Create a complete high-quality surrounding scene in a Dutch context, including believable landscaping, street or path, greenery, trees, front gardens or shared outdoor space, and a subtle presence of people. The atmosphere should feel warm, aspirational and premium, like a project brochure render. Use realistic daylight and soft attractive lighting.

User design nuance:
${nuanceText}

STRICTLY AVOID:
- ANY text, labels, watermarks, titles, captions, or lettering anywhere in the image
- changing the number of houses (must be exactly ${geo.numberOfHouses})
- ANY change to the building silhouette, roofline, or massing from the source image
- moving, adding, removing, or resizing any window or door
- adding extra volumes, dormers, bay windows, or extensions not present in the source image
- changing the camera angle or perspective from the source
- distorting roof geometry or slope angles
- missing rainwater downpipes between houses
- forgetting the horizontal lines on the kopgevel (side wall) — both the 3m floor-line AND the 6m eave-line must be there
- cropping or cutting off ANY part of the building — the entire building must be fully visible with margin on all sides
- generic AI-looking architecture
- American suburb aesthetics
- cartoonish people or vegetation`;
}
