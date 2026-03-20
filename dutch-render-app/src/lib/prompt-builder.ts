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
  const brickStyles = new Set(["jaren-30", "moderne-stadswoning", "oud-hollands", "industrieel", "haags"]);
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
  const skipFloorLine = isBrick && config.floorLine === "bijna-onzichtbaar";
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
    return buildQuickPrompt(geo, geometryDescription, style, gutter, floorLine, skipFloorLine, subtleTimberFloorLine, featuresText, nuanceText, woodBlock, brickBlock);
  }

  return buildHqPrompt(geo, style, gutter, floorLine, skipFloorLine, subtleTimberFloorLine, featuresText, nuanceText, woodBlock, brickBlock);
}

function buildGeometryDescription(geo: { numberOfHouses: number; width: number; crossGables: boolean; stepping: boolean }): string {
  const totalWidth = geo.numberOfHouses * geo.width;
  const roofType = geo.crossGables
    ? `The roof has cross gables (dwarskappen): the first and last houses have perpendicular gable roofs that project upward above the main ridge, creating a distinctive silhouette with triangular gable peaks on the end units. The middle ${geo.numberOfHouses - 2} houses share a continuous longitudinal ridge roof between these cross gables.`
    : `The roof is a simple continuous saddle/ridge roof running the full length of the terrace, with the ridge line parallel to the front façade. Both end walls show a triangular gable.`;

  const steppingDesc = geo.stepping
    ? `The façades are stepped (verspringend): alternate houses are set back approximately 0.3-0.5m from their neighbours, creating a subtle zigzag depth pattern along the terrace when viewed from the front. This stepping is visible in both the ground floor and upper floor wall planes.`
    : `All houses share one continuous flat façade plane — no stepping or setbacks between units.`;

  return `EXACT BUILDING GEOMETRY — you must reproduce this precisely:

OVERVIEW: A Dutch terraced housing block (rijwoningen) consisting of exactly ${geo.numberOfHouses} attached houses in a row, viewed from a 3/4 front-right isometric perspective. The total building is approximately ${totalWidth.toFixed(1)}m wide and approximately 10m deep.

MASSING: The building is a simple rectangular block, 2 storeys tall plus a pitched roof. The building height to the eaves is approximately 6m. The total height to the ridge is approximately 9.5m. The depth of the building is approximately 10m.

HOUSE DIVISIONS: The ${geo.numberOfHouses} houses are divided by ${geo.numberOfHouses - 1} visible vertical party walls (brandmuren) that extend from ground to roof ridge. These party walls are evenly spaced at ${geo.width}m intervals, creating ${geo.numberOfHouses} equal-width units. The party wall lines must be clearly visible as vertical lines/seams on the façade.

FLOOR DIVISION: A clear horizontal floor-line runs across the entire front façade at approximately 2.8-3.0m height, dividing the ground floor from the upper floor. This line must be visible.

GROUND FLOOR (per house): Each house has one front door (left side, approximately 1m wide, 2.2m tall) and one window (right side, approximately 1m wide, 1.5m tall) on the ground floor. The door and window are roughly the same height and aligned horizontally.

UPPER FLOOR (per house): Each house has two smaller windows on the upper floor, evenly spaced and centred above the ground floor openings. These windows are approximately 0.8m wide and 1.2m tall each.

ROOF: ${roofType} The roof slope angle is approximately 45 degrees. The roof overhangs the façade slightly at the eaves.

STEPPING: ${steppingDesc}

VIEWPOINT: The camera is positioned at approximately 30 degrees to the right of the front façade, looking slightly downward from about 5m height. This shows the full front façade, the right side wall of the end house, and the roof clearly. The perspective is a mild 3/4 isometric view — not a flat elevation, not a dramatic wide-angle.`;
}

function buildQuickPrompt(
  geo: { numberOfHouses: number; width: number; crossGables: boolean; stepping: boolean },
  geometryDescription: string,
  style: { label: string; promptBlock: string },
  gutter: { label: string; description: string },
  floorLine: { label: string; promptBlock: string },
  skipFloorLine: boolean,
  subtleTimberFloorLine: boolean,
  featuresText: string,
  nuanceText: string,
  woodBlock: string,
  brickBlock: string
): string {
  return `Generate an image. Your output MUST be a single photorealistic image, not text. Do not describe the image — produce it.

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

Your job: apply materials, textures, colours, landscaping, and atmosphere onto this exact geometry. Do NOT redesign the building.

Selected style:
${style.label}

Style instructions:
${style.promptBlock}${woodBlock}${brickBlock}

Selected gutter type: ${gutter.label}
Gutter: ${gutter.label} — ${gutter.description}. Integrate into the roof edge detailing.

${skipFloorLine ? `Floor-line: The façade is entirely brick. Do NOT add any visible floor-line, material change, colour change, or horizontal band at the floor transition. The same brick runs continuously from ground to roof with no interruption whatsoever.` : subtleTimberFloorLine ? `Floor-line: The façade is entirely timber/wood cladding. The SAME wood cladding must run continuously from ground level to roofline — do NOT switch to brick, render, or any other material below or above the floor line. You may show a very thin, subtle shadow line or fine groove at the floor transition, but the material must remain wood on both sides. NEVER make the bottom half brick and the top half wood.` : `Floor-line treatment: ${floorLine.label}
${floorLine.promptBlock}
IMPORTANT: The floor-line is a subtle detail — do NOT change the facade material above vs below this line. The same material runs continuously across it.`}

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
  skipFloorLine: boolean,
  subtleTimberFloorLine: boolean,
  featuresText: string,
  nuanceText: string,
  woodBlock: string,
  brickBlock: string
): string {
  return `Generate an image. Your output MUST be a single photorealistic image, not text. Do not describe the image — produce it.

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

Your ONLY job is to apply materials, textures, colours, landscaping, and atmosphere onto this exact geometry. Think of it as "skinning" a 3D model — the shape is locked, you control the surface treatment.

Important construction logic:
- A horizontal floor transition line is visible in the source image and must remain present in the render.
- The façade should never look overly modular or prefabricated.

Selected style:
${style.label}

Style instructions:
${style.promptBlock}${woodBlock}${brickBlock}

Selected gutter type:
${gutter.label}

Gutter instructions:
Clearly express the selected gutter type (${gutter.label} — ${gutter.description}) in the roof edge and façade detailing. The roof edge must feel architecturally consistent with the chosen style.

${skipFloorLine ? `Floor-line treatment:
The façade is entirely brick. IGNORE the floor transition completely. Do NOT add any visible horizontal line, band, groove, colour change, or material change at the floor transition height. The same brick in the same colour and bond runs continuously from ground level to the roofline without any interruption. There is NO floor line — just continuous brick.` : subtleTimberFloorLine ? `Floor-line treatment:
The façade is entirely timber/wood cladding from ground to roof. The SAME wood material must be used continuously on the entire façade — do NOT use brick, render, plaster, or any other material on any part of the façade. NEVER make the lower half brick and the upper half wood. The floor transition may be expressed as a very thin, barely visible shadow line or fine groove in the wood, but the material on both sides of that line is identical wood cladding.` : `Selected floor-line treatment:
${floorLine.label}

Floor-line instructions:
${floorLine.promptBlock}
CRITICAL: The floor-line is a detail within one continuous material. Do NOT change the facade material above vs below this line. The same material runs continuously across the floor-line transition.`}

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
- generic AI-looking architecture
- American suburb aesthetics
- cartoonish people or vegetation`;
}
